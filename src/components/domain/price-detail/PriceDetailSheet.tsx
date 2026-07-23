import { useState, useMemo, useEffect, useRef } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
// 💡 훅(Hook): 특정 기능을 재사용 가능하도록 묶어놓은 함수. 음식점 주방의 '레시피 카드'와 같습니다.
import { usePriceDetail } from '../../../hooks/usePriceDetail';
import type { TrendStatus } from '../../../api/types/market';
import { useFavorites } from '../../../hooks/useFavorites';
import { useFavoriteMutation } from '../../../hooks/useFavoriteMutation';
import { Toast } from '../../common/Toast';

interface PriceDetailSheetProps {
  isOpen: boolean;
  itemId: string | null;
  initialGrade?: string | null; // 💡 [한글 주석] 초기 활성화할 등급 탭 정보
  onClose: () => void;
  onFavoriteRemoved?: () => void; // 선택적 속성으로 유지 (MainPage 호환용)
}

// 1. 상품명 텍스트에서 등급 문자열을 낚아채는 순수 유틸 함수
const extractGrade = (value: string) => {
  const normalized = value.replace(/등급/g, '').replace(/\s+/g, '').toUpperCase();
  if (normalized.includes('1++') || normalized.includes('1PP')) return '1++';
  if (normalized.includes('1+') || normalized.includes('1P')) return '1+';
  if (normalized === '1' || normalized.includes('/1') || normalized.match(/\b1\b/)) return '1';
  return '기타';
};

const extractWeight = (name: string): number | null => {
  const match = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
  return match ? parseFloat(match[1]) : null;
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().slice(0, 10);
};

const formatCollectedAt = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';

  return `${part('year')}.${part('month')}.${part('day')} ${part('hour')}:${part('minute')}:${part('second')}`;
};

const getDaysUntilExpiry = (value?: string | null) =>
  value ? Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000) : null;

const isExpirySoon = (value?: string | null) => {
  const days = getDaysUntilExpiry(value);
  return days !== null && days >= 0 && days <= 7;
};

// 3. 화면에서 사용할 상품 데이터의 타입 명세서(Interface)
interface FormattedMarketItem {
  goodsNo: string;
  grade: string;
  itemName: string;
  weight?: number;
  pricePerKg: number;
  totalPrice?: number;
  ageInMonths?: number | null;
  manufacturedAt?: string | null;
  expiresAt?: string | null;
  detailUrl?: string;
  changeAmount?: number | null;
  totalChangeAmount?: number | null;
  trendStatus?: TrendStatus | null;
}

const getTrendView = (changeAmount?: number | null, trendStatus?: TrendStatus | null) => {
  const status = trendStatus ?? (changeAmount == null ? 'UNCHANGED' : changeAmount > 0 ? 'UP' : changeAmount < 0 ? 'DOWN' : 'UNCHANGED');
  return {
    symbol: status === 'UP' ? '▲' : status === 'DOWN' ? '▼' : '—',
    colorClass: status === 'UP'
      ? 'text-[var(--color-text-red)]'
      : status === 'DOWN'
        ? 'text-[var(--color-secondary)]'
        : 'text-[var(--text-muted)]',
  };
};

const formatChange = (value?: number | null) => `${Math.abs(value ?? 0).toLocaleString()}원`;

type SortOption =
  | 'PRICE_PER_KG_ASC'
  | 'PRICE_PER_KG_DESC'
  | 'AGE_ASC'
  | 'AGE_DESC'
  | 'TOTAL_PRICE_ASC'
  | 'TOTAL_PRICE_DESC';

const GRADE_TABS = ['1++', '1+', '1'] as const;
const ALL_ITEMS_TAB = '전체';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'PRICE_PER_KG_ASC', label: 'kg당 단가 낮은 순' },
  { value: 'PRICE_PER_KG_DESC', label: 'kg당 단가 높은 순' },
  { value: 'AGE_ASC', label: '월령 낮은 순' },
  { value: 'AGE_DESC', label: '월령 높은 순 (최대 40개월)' },
  { value: 'TOTAL_PRICE_ASC', label: '판매가 낮은 순' },
  { value: 'TOTAL_PRICE_DESC', label: '판매가 높은 순' },
];

export function PriceDetailSheet({ isOpen, itemId, initialGrade, onClose, onFavoriteRemoved: _onFavoriteRemoved }: PriceDetailSheetProps) {
  // 4. 💡 핵심: 실제로 백엔드 API에서 데이터를 가져오는 훅 연결
  // status: 'idle' | 'loading' | 'success' | 'empty' | 'error' 중 하나를 가집니다.
  const { status, detail, refetch } = usePriceDetail(isOpen ? itemId : null);
  const sourceItems = useMemo(
    () => (Array.isArray(detail?.sourceItems) ? detail.sourceItems : []),
    [detail]
  );
  const sourceRecords = useMemo(
    () => (Array.isArray(detail?.sourceRecords) ? detail.sourceRecords : []),
    [detail]
  );

  const [activeTab, setActiveTab] = useState<string>(GRADE_TABS[0]);

  // 💡 [한글 주석] 모달이 열릴 때(isOpen === true) 전달받은 initialGrade가 있으면 해당 등급 탭을 활성화
  useEffect(() => {
    if (isOpen) {
      if (initialGrade) {
        setActiveTab(initialGrade);
      } else {
        // 지정된 기본 등급이 없으면 1++ 등급을 기본 탭으로 설정
        setActiveTab(GRADE_TABS[0]);
      }
    }
  }, [isOpen, initialGrade]);
  const [sortOption, setSortOption] = useState<SortOption>('PRICE_PER_KG_ASC');
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. API 응답(detail.sourceItems)을 화면 렌더링용 규격으로 변환 + 중량/최종가 산출
  // 💡 useMemo: 데이터가 바뀔 때만 재계산하는 성능 최적화 훅. 계산기가 입력값이 같으면 다시 계산 안 하는 것과 같습니다.
  const items = useMemo<FormattedMarketItem[]>(() => {
    if (sourceItems.length > 0) {
      return sourceItems.map((si) => {
        const weight = si.weightKg || extractWeight(si.name) || 0;
        const pricePerKg = si.price || 0;
        const totalPrice = si.salePrice || (weight > 0 ? Math.round(pricePerKg * weight) : 0);
        const totalChangeAmount = si.changeAmount != null && weight > 0
          ? Math.round(si.changeAmount * weight)
          : null;

        return {
          goodsNo: si.itemId,
          grade: extractGrade(si.grade || si.name),
          itemName: si.name,
          weight: weight > 0 ? weight : undefined,
          pricePerKg,
          totalPrice: totalPrice > 0 ? totalPrice : undefined,
          ageInMonths: si.ageInMonths,
          manufacturedAt: si.manufacturedAt,
          expiresAt: si.expiresAt,
          detailUrl: si.detailUrl,
          changeAmount: si.changeAmount,
          totalChangeAmount,
          trendStatus: si.trendStatus,
        };
      });
    }

    return sourceRecords.map((record) => {
      const itemName = record.rawProductName || record.sourceName;
      return {
        goodsNo: record.id,
        grade: extractGrade(record.grade || itemName),
        itemName,
        pricePerKg: record.price || 0,
        ageInMonths: record.ageInMonths,
      };
    });
  }, [sourceItems, sourceRecords]);

  // 6. 변환된 items를 등급별(1++, 1+, 1)로 그룹화 및 탭 목록 생성
  const groupedItems = useMemo(() => {
    const groups: Record<string, FormattedMarketItem[]> = {
      '1++': [],
      '1+': [],
      '1': [],
    };

    items.forEach((item: FormattedMarketItem) => {
      if (item.grade in groups) groups[item.grade].push(item);
    });

    return groups;
  }, [items]);

  // 6.5. 즐겨찾기 상태 판단 및 추가/삭제 Mutation
  const { isFavorite } = useFavorites();
  const { addFavorite: mutateAdd, removeFavorite: mutateRemove } = useFavoriteMutation({
    onSuccess: () => {
      // 상세 시세에서 즐겨찾기 상태 변경 성공 시, 메인화면 목록 자동 갱신
      _onFavoriteRemoved?.();
    },
  });

  const targetFavoriteItemId = useMemo(() => {
    if (!detail) return null;
    // 한우이고, 현재 선택된 탭이 '전체'가 아니라 등급 탭인 경우
    if (detail.animalType === 'BEEF' && activeTab !== ALL_ITEMS_TAB) {
      const currentGradeItems = groupedItems[activeTab] || [];
      return currentGradeItems[0]?.goodsNo || detail.itemId;
    }
    // 한돈이거나, 한우 '전체' 탭인 경우
    return detail.itemId;
  }, [detail, activeTab, groupedItems]);

  const isCurrentFavorite = useMemo(() => {
    if (!targetFavoriteItemId) return false;
    return isFavorite(targetFavoriteItemId);
  }, [targetFavoriteItemId, isFavorite]);

  const handleFavoriteToggle = async () => {
    if (!targetFavoriteItemId || !detail) return;

    const nameForToast = detail.animalType === 'BEEF' && activeTab !== ALL_ITEMS_TAB
      ? `${detail.displayName} (${activeTab})`
      : detail.displayName;

    if (isCurrentFavorite) {
      const success = await mutateRemove(targetFavoriteItemId);
      if (success) {
        showToast(`${nameForToast}을(를) 즐겨찾기에서 해제했어요`);
      }
    } else {
      const success = await mutateAdd({
        itemId: targetFavoriteItemId,
        animalType: detail.animalType,
        storageType: detail.storageType,
      });
      if (success) {
        showToast(`${nameForToast}을(를) 즐겨찾기에 등록했어요`);
      }
    }
  };

  const hasGradedItems = useMemo(
    () => GRADE_TABS.some((grade) => groupedItems[grade].length > 0),
    [groupedItems]
  );
  const hasUngradedItems = items.some((item) => item.grade === '기타');
  const visibleTabs = !hasGradedItems
    ? [ALL_ITEMS_TAB]
    : hasUngradedItems
      ? [ALL_ITEMS_TAB, ...GRADE_TABS]
      : GRADE_TABS;

  // 한우는 실제 등급 탭을 사용하고, 등급 체계가 없는 한돈은 전체 탭에서
  // ACTIVE 매물을 그대로 노출합니다. NULL 등급을 1등급으로 위장하지 않습니다.
  useEffect(() => {
    // 💡 [한글 주석] 데이터 로드가 성공한 시점(success)에만 등급 탭 유효성 검사 및 자동 변경을 처리하도록 변경하여 로딩 중 오버라이딩 방지
    if (status !== 'success') return;

    if (!hasGradedItems) {
      if (activeTab !== ALL_ITEMS_TAB) setActiveTab(ALL_ITEMS_TAB);
      return;
    }
    if (activeTab !== ALL_ITEMS_TAB && groupedItems[activeTab]?.length > 0) return;
    const firstAvailableGrade = GRADE_TABS.find((grade) => groupedItems[grade].length > 0);
    if (firstAvailableGrade) setActiveTab(firstAvailableGrade);
  }, [status, activeTab, groupedItems, hasGradedItems]);

  // 8. ESC 키 → 닫기 바인딩
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // 9. 바텀 시트 열릴 시 배경 스크롤 제어
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // 10. 현재 선택된 탭(등급)의 실시간 통계 계산
  const currentItems = useMemo(() => {
    const gradeItems = activeTab === ALL_ITEMS_TAB ? items : groupedItems[activeTab] || [];
    const sortableItems = sortOption === 'AGE_DESC'
      ? gradeItems.filter((item) => item.ageInMonths == null || item.ageInMonths <= 40)
      : gradeItems;

    const valueFor = (item: FormattedMarketItem): number | null => {
      if (sortOption.startsWith('PRICE_PER_KG')) return item.pricePerKg || null;
      if (sortOption.startsWith('AGE')) return item.ageInMonths ?? null;
      return item.totalPrice ?? null;
    };
    const direction = sortOption.endsWith('ASC') ? 1 : -1;

    return [...sortableItems].sort((a, b) => {
      const aValue = valueFor(a);
      const bValue = valueFor(b);
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      return (aValue - bValue) * direction;
    });
  }, [activeTab, groupedItems, items, sortOption]);
  const stats = useMemo(() => {
    if (currentItems.length === 0) return { avg: 0, min: 0, max: 0, count: 0, changeAmount: 0, trendStatus: 'UNCHANGED' as TrendStatus };
    const prices = currentItems.map((item: FormattedMarketItem) => item.pricePerKg);
    const changes = currentItems
      .map((item) => item.changeAmount)
      .filter((value): value is number => typeof value === 'number');
    const changeAmount = changes.length > 0
      ? Math.round(changes.reduce((sum, value) => sum + value, 0) / changes.length)
      : detail?.changeAmount ?? 0;
    return {
      avg: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: currentItems.length,
      changeAmount,
      trendStatus: changeAmount > 0 ? 'UP' as TrendStatus : changeAmount < 0 ? 'DOWN' as TrendStatus : 'UNCHANGED' as TrendStatus,
    };
  }, [currentItems, detail?.changeAmount]);

  const chartData = useMemo(
    () => (detail?.priceHistory ?? [])
      .filter((point) => typeof point.price === 'number')
      .slice(-7)
      .map((point) => ({
        ...point,
        label: point.marketDate.slice(5).replace('-', '.'),
      })),
    [detail?.priceHistory]
  );
  const selectedChartPoint = useMemo(
    () => chartData.find((point) => point.marketDate === selectedChartDate) ?? chartData.at(-1),
    [chartData, selectedChartDate]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center px-[var(--spacing-20)]">
      {/* 배경 딤(Dim) 처리 및 클릭 시 닫기 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 바텀 시트 컨테이너 (스크롤 제한, 내부 Flexbox 구성) */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-detail-title"
        className="relative z-10 w-full max-w-md max-h-[calc(100dvh-96px)] flex flex-col bg-[var(--color-surface)] rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] shadow-medium transition-transform duration-200 overflow-hidden"
      >
        {/* 상단 헤더 및 닫기 버튼 (p-[var(--spacing-20)] 패딩 및 하단 구분선 지정) */}
        <div className="flex justify-between items-center px-[var(--spacing-20)] pt-[var(--spacing-20)] pb-[var(--spacing-12)] border-b border-[var(--color-divider)] flex-shrink-0">
          <h2 id="price-detail-title" className="text-title font-bold text-[var(--text-strong)]">상세 시세 및 구매</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="상세 시세 닫기"
            className="w-12 h-12 -mr-2 flex items-center justify-center rounded-[var(--radius-full)] text-[var(--text-light)] text-title-xl active:scale-[0.98] hover:bg-[var(--color-surface-soft)] transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* 📌 내부 컨텐츠 스크롤 영역 (스크롤바가 모서리 라운드를 침범하지 않도록 px-[var(--spacing-20)] 지정) */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-[var(--spacing-20)] pt-[var(--spacing-16)] pb-[var(--spacing-32)] min-h-0 [scrollbar-gutter:stable]"
        >

        {/* 💡 상태(Status)에 따른 조건 분기 렌더링 */}

        {/* ① 로딩 중: 스켈레톤 UI (첫 번째 사진 대응) */}
        {(status === 'loading' || status === 'idle') && (
          <div className="animate-pulse flex flex-col gap-[var(--spacing-16)]" aria-busy="true" aria-live="polite">
            <span className="sr-only">상세 시세를 불러오는 중입니다.</span>

            <div className="flex gap-[var(--spacing-8)]" aria-hidden="true">
              <div className="h-10 w-24 bg-[var(--color-surface-soft)] rounded-[var(--radius-full)]" />
              <div className="h-10 w-24 bg-[var(--color-surface-soft)] rounded-[var(--radius-full)]" />
              <div className="h-10 w-20 bg-[var(--color-surface-soft)] rounded-[var(--radius-full)]" />
            </div>

            <div className="h-48 w-full bg-[var(--color-surface-soft)] rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft p-[var(--spacing-20)] flex flex-col items-center justify-center gap-[var(--spacing-12)]" aria-hidden="true">
              <div className="h-5 w-36 bg-[var(--color-border)] rounded-[var(--radius-sm)]" />
              <div className="h-10 w-44 bg-[var(--color-border)] rounded-[var(--radius-sm)]" />
              <div className="h-px w-full bg-[var(--color-divider)]" />
              <div className="flex w-full justify-around">
                <div className="h-8 w-16 bg-[var(--color-border)] rounded-[var(--radius-sm)]" />
                <div className="h-8 w-16 bg-[var(--color-border)] rounded-[var(--radius-sm)]" />
                <div className="h-8 w-16 bg-[var(--color-border)] rounded-[var(--radius-sm)]" />
              </div>
            </div>

            {[0, 1].map((skeletonItem) => (
              <div
                key={skeletonItem}
                className="min-h-40 w-full bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-soft p-[var(--spacing-16)]"
                aria-hidden="true"
              >
                <div className="grid grid-cols-3 gap-[var(--spacing-12)] pb-[var(--spacing-16)] border-b border-[var(--color-divider)]">
                  <div className="h-10 bg-[var(--color-surface-soft)] rounded-[var(--radius-sm)]" />
                  <div className="h-10 bg-[var(--color-surface-soft)] rounded-[var(--radius-sm)]" />
                  <div className="h-10 bg-[var(--color-surface-soft)] rounded-[var(--radius-sm)]" />
                </div>
                <div className="grid grid-cols-3 gap-[var(--spacing-12)] pt-[var(--spacing-16)]">
                  <div className="h-10 bg-[var(--color-surface-soft)] rounded-[var(--radius-sm)]" />
                  <div className="h-10 bg-[var(--color-surface-soft)] rounded-[var(--radius-sm)]" />
                  <div className="h-10 bg-[var(--color-surface-soft)] rounded-[var(--radius-sm)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ② 에러: 재시도 버튼 */}
        {status === 'error' && (
          <div className="py-12 text-center flex flex-col items-center gap-4">
            <p className="text-gray-500">데이터를 불러오지 못했습니다.</p>
            <button
              onClick={() => refetch(true)} // 💡 [한글 주석] 재시도 클릭 시 강제 새로고침(force=true) 수행하도록 함수 래핑하여 타입 호환 오류 해결
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* ③ 데이터 없음: 안내 문구 */}
        {(status === 'empty' || status === 'success') && items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl mb-2">🥩</p>
            <p className="text-gray-600 font-bold mb-1">현재 수집된 도매 매물이 없습니다.</p>
            <p className="text-gray-400 text-sm">잠시 후 다시 시도해 주세요.</p>
          </div>
        )}

        {/* ④ 성공: 등급별 탭 필터 + 통계 카드 + 상품 카드 리스트 */}
        {status === 'success' && items.length > 0 && (
          <>
            {/* 상단 등급 탭 버튼 및 우측 끝 즐겨찾기 버튼 정렬 컨테이너 */}
            <div className="flex justify-between items-center gap-4 mb-4 pb-2">
              <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide pr-1">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-colors ${
                      activeTab === tab
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {tab}{' '}
                    <span className="text-sm font-normal opacity-80">
                      ({tab === ALL_ITEMS_TAB ? items.length : groupedItems[tab]?.length}건)
                    </span>
                  </button>
                ))}
              </div>

              {/* 우측 끝 즐겨찾기 버튼 (파란색 테마) */}
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`flex-shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 rounded-full font-bold text-caption transition-all duration-200 active:scale-[0.96] border ${
                  isCurrentFavorite
                    ? 'bg-[var(--color-secondary)] border-[var(--color-secondary)] text-white'
                    : 'bg-white border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[rgba(59,145,200,0.05)]'
                }`}
                aria-label={isCurrentFavorite ? '즐겨찾기 삭제' : '즐겨찾기 추가'}
              >
                <span className="text-sm" aria-hidden="true">
                  {isCurrentFavorite ? '★' : '☆'}
                </span>
                <span>{isCurrentFavorite ? '즐겨찾기 해제' : '즐겨찾기'}</span>
              </button>
            </div>

            <div className="mb-[var(--spacing-16)]">
              <label htmlFor="price-detail-sort" className="sr-only">상세 매물 정렬</label>
              <select
                id="price-detail-sort"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="w-full min-h-12 px-[var(--spacing-16)] bg-[var(--color-surface-soft)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-body text-[var(--text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <p className="mb-[var(--spacing-16)] rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] px-[var(--spacing-16)] py-[var(--spacing-12)] text-caption font-bold leading-relaxed text-[var(--text-muted)]">
              <span className="block">데이터는 마지막 수집 시점({formatCollectedAt(detail?.lastCollectedAt)}) 기준이며,</span>
              <span className="block">실제 재고 상황과 차이가 있습니다.</span>
            </p>

            {/* 선택된 등급의 평균가 요약 카드 */}
            <div className="bg-gray-50 rounded-xl p-6 mb-[var(--spacing-16)] text-center">
              <p className="text-gray-500 mb-2">{detail?.displayName || '부위'} 평균 시세 (1kg)</p>
              <div className="flex flex-wrap items-baseline justify-center gap-x-[var(--spacing-12)] gap-y-[var(--spacing-4)]">
                <p className="text-3xl font-extrabold tabular-nums text-gray-900">
                  {stats.avg.toLocaleString()}원
                </p>
                <p className={`text-base font-extrabold tabular-nums ${getTrendView(stats.changeAmount, stats.trendStatus).colorClass}`}>
                  <span aria-hidden="true">{getTrendView(stats.changeAmount, stats.trendStatus).symbol}</span>{' '}
                  <span className="sr-only">전일 대비 </span>{formatChange(stats.changeAmount)}
                </p>
              </div>
              <div className="flex justify-between border-t border-gray-200 mt-4 pt-4 text-sm">
                <div className="text-left flex-1">
                  <p className="text-gray-400">최저가</p>
                  <p className="text-blue-500 font-bold">{stats.min.toLocaleString()}원</p>
                </div>
                <div className="text-center border-x border-gray-200 px-4 flex-1">
                  <p className="text-gray-400">최고가</p>
                  <p className="text-red-500 font-bold">{stats.max.toLocaleString()}원</p>
                </div>
                <div className="text-right flex-1">
                  <p className="text-gray-400">산출 업체</p>
                  <p className="text-gray-700 font-bold">{stats.count}곳</p>
                </div>
              </div>

              <section
                aria-labelledby="seven-day-price-title"
                className="mt-[var(--spacing-16)] border-t border-[var(--color-divider)] pt-[var(--spacing-16)] text-left"
              >
                <div className="mb-[var(--spacing-8)] flex flex-col items-start gap-[var(--spacing-4)]">
                  <h3 id="seven-day-price-title" className="text-label text-[var(--text-strong)]">최근 7일 가격 추이</h3>
                  {selectedChartPoint && (
                    <p className="text-base font-black tabular-nums text-[var(--color-secondary)]">
                      kg당 시세 : {Number(selectedChartPoint.price).toLocaleString()}원
                    </p>
                  )}
                </div>
                {chartData.length > 1 ? (
                  <div className="h-24 w-full" role="img" aria-label="최근 7일 kg당 평균 시세 차트">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 8, right: 18, left: 18, bottom: 8 }}>
                        <Tooltip
                          formatter={(value) => [`${Number(value).toLocaleString()}원`, 'kg당 시세']}
                          labelFormatter={(_, payload) => payload[0]?.payload?.marketDate ?? ''}
                          contentStyle={{
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-soft)',
                            color: 'var(--text-strong)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          isAnimationActive={false}
                          stroke="var(--color-secondary)"
                          strokeWidth={3}
                          dot={{ r: 4, fill: 'var(--color-surface)', stroke: 'var(--color-secondary)', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex min-h-20 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-[var(--spacing-12)] text-center text-caption text-[var(--text-muted)]">
                    가격 흐름을 표시할 이력이 아직 충분하지 않습니다.
                  </div>
                )}
                {chartData.length > 1 && (
                  <div className="mt-[var(--spacing-8)] flex gap-[var(--spacing-4)] overflow-x-auto pb-[var(--spacing-4)]" aria-label="날짜별 시세 선택">
                    {chartData.map((point) => {
                      const isSelected = selectedChartPoint?.marketDate === point.marketDate;
                      return (
                        <button
                          key={point.marketDate}
                          type="button"
                          onClick={() => setSelectedChartDate(point.marketDate)}
                          className="min-h-11 min-w-14 rounded-[var(--radius-sm)] px-[var(--spacing-8)] text-xs font-bold tabular-nums transition-colors sm:min-w-0 sm:flex-1"
                          style={{
                            backgroundColor: isSelected ? '#3b91c8' : 'var(--color-surface)',
                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          }}
                          aria-pressed={isSelected}
                          aria-label={`${point.marketDate}, kg당 ${Number(point.price).toLocaleString()}원`}
                        >
                          {point.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* 상세 상품 카드 리스트 + 금천미트 구매창 바로가기 링크 */}
            <div className="flex flex-col gap-4 pb-8">
              {currentItems.map((item: FormattedMarketItem, idx: number) => (
                <a
                  key={idx}
                  href={item.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-[var(--spacing-16)] shadow-soft transition-all duration-200 ${
                    item.detailUrl ? 'hover:border-[var(--color-secondary)] hover:shadow-medium cursor-pointer active:scale-[0.98]' : ''
                  }`}
                >
                  {/* 1행: 상품명(1·2열 병합) | 제조일 */}
                  <div className="grid grid-cols-1 border-b border-[var(--color-divider)] pb-[var(--spacing-12)] sm:grid-cols-3">
                    <div className="min-w-0 border-b border-[var(--color-divider)] pb-[var(--spacing-12)] sm:col-span-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-[var(--spacing-12)]">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">상품명</p>
                      <p className="text-label text-[var(--text-strong)] break-words leading-snug">{item.itemName}</p>
                    </div>
                    <div className="flex min-w-0 items-baseline justify-between overflow-hidden pt-[var(--spacing-12)] sm:block sm:pl-[var(--spacing-12)] sm:pt-0 sm:text-right">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">제조일</p>
                      <p className="whitespace-nowrap text-base font-bold leading-snug tabular-nums text-[var(--text-strong)]" title={formatDate(item.manufacturedAt)}>
                        {formatDate(item.manufacturedAt)}
                      </p>
                    </div>
                  </div>

                  {/* 2행: 기존 정보 영역 2/3만 3등분하고, 소비기한 1/3 폭은 보존 */}
                  <div className="flex flex-col border-b border-[var(--color-divider)] py-[var(--spacing-12)] sm:flex-row">
                    <div className="flex w-full min-w-0 sm:w-2/3">
                      <div className="min-w-0 flex-1 pr-[var(--spacing-8)] border-r border-[var(--color-divider)]">
                        <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">등급</p>
                        <p className="text-label text-[var(--text-strong)]">{item.grade === '기타' ? '-' : item.grade}</p>
                      </div>
                      <div className="min-w-0 flex-1 px-[var(--spacing-8)] border-r border-[var(--color-divider)] text-center">
                        <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">월령</p>
                        {item.ageInMonths != null ? (
                          <span className="inline-block max-w-full px-2 py-0.5 rounded-[var(--radius-sm)] bg-[#edf6fc] text-[var(--color-secondary)] text-caption font-bold whitespace-nowrap">
                            {item.ageInMonths}개월
                          </span>
                        ) : (
                          <span className="text-label text-[var(--text-strong)]">-</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 px-[var(--spacing-8)] border-r border-[var(--color-divider)] text-center">
                        <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">중량</p>
                        <p className="text-label text-[var(--text-strong)] whitespace-nowrap">{item.weight ? `${item.weight}kg` : '-'}</p>
                      </div>
                    </div>
                    <div className="mt-[var(--spacing-12)] flex w-full min-w-0 items-baseline justify-between overflow-hidden border-t border-[var(--color-divider)] pt-[var(--spacing-12)] sm:mt-0 sm:block sm:w-1/3 sm:border-t-0 sm:pl-[var(--spacing-12)] sm:pt-0 sm:text-right">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">소비기한</p>
                      <p
                        className={`whitespace-nowrap text-base font-bold leading-snug tabular-nums sm:text-sm ${isExpirySoon(item.expiresAt) ? 'text-[var(--color-text-red)]' : 'text-[var(--text-strong)]'}`}
                        title={formatDate(item.expiresAt)}
                      >
                        {isExpirySoon(item.expiresAt) ? '⚠ ' : ''}{formatDate(item.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {/* 3행: kg당 단가 | 전일 대비 | 판매가 */}
                  <div className="grid grid-cols-3 pt-[var(--spacing-16)]">
                    <div className="pr-[var(--spacing-12)] border-r border-[var(--color-divider)]">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">kg당 단가</p>
                      <p className="text-label text-[var(--text-strong)]">{item.pricePerKg.toLocaleString()}원</p>
                    </div>
                    <div className="min-w-0 px-[var(--spacing-8)] border-r border-[var(--color-divider)] text-center">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">전일 대비</p>
                      <p className={`text-sm font-extrabold tabular-nums whitespace-nowrap ${getTrendView(item.totalChangeAmount, item.trendStatus).colorClass}`}>
                        <span aria-hidden="true">{getTrendView(item.totalChangeAmount, item.trendStatus).symbol}</span>{' '}
                        {formatChange(item.totalChangeAmount)}
                      </p>
                    </div>
                    <div className="min-w-0 pl-[var(--spacing-12)] text-right">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">판매가</p>
                      <p className="text-xl font-black tracking-[-0.04em] tabular-nums whitespace-nowrap text-[var(--text-strong)]">
                        {item.totalPrice ? `${item.totalPrice.toLocaleString()}원` : '-'}
                      </p>
                    </div>
                  </div>
                  {item.detailUrl && (
                    <div className="mt-[var(--spacing-12)] border-t border-[var(--color-divider)] pt-[var(--spacing-12)] text-right">
                      <span className="text-caption font-bold text-[var(--color-secondary)]">구매하기 →</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </>
        )}
        </div>

        {/* 모달 전용 플로팅 최상단 이동 버튼 (스크롤바 영역과 겹치지 않게 right-8 및 z-30 지정) */}
        <div className="absolute bottom-6 right-8 z-30">
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-medium text-[var(--color-secondary)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-surface-soft)] transition-all duration-200"
            aria-label="최상단으로 이동"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* 즐겨찾기 등록/해제 토스트 알림 */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
