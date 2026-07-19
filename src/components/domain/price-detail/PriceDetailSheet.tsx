import { useState, useMemo, useEffect, useRef } from 'react';
// 💡 훅(Hook): 특정 기능을 재사용 가능하도록 묶어놓은 함수. 음식점 주방의 '레시피 카드'와 같습니다.
import { usePriceDetail } from '../../../hooks/usePriceDetail';

interface PriceDetailSheetProps {
  isOpen: boolean;
  itemId: string | null;
  onClose: () => void;
  onFavoriteRemoved?: () => void; // 선택적 속성으로 유지 (MainPage 호환용)
}

// 1. 상품명 텍스트에서 등급 문자열을 낚아채는 순수 유틸 함수
const extractGrade = (name: string) => {
  if (name.includes('1++')) return '1++';
  if (name.includes('1+')) return '1+';
  if (name.includes('1등급') || name.match(/\b1\b/)) return '1';
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
}

type SortOption =
  | 'PRICE_PER_KG_ASC'
  | 'PRICE_PER_KG_DESC'
  | 'AGE_ASC'
  | 'AGE_DESC'
  | 'TOTAL_PRICE_ASC'
  | 'TOTAL_PRICE_DESC';

const GRADE_TABS = ['1++', '1+', '1'] as const;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'PRICE_PER_KG_ASC', label: 'kg당 단가 낮은 순' },
  { value: 'PRICE_PER_KG_DESC', label: 'kg당 단가 높은 순' },
  { value: 'AGE_ASC', label: '월령 낮은 순' },
  { value: 'AGE_DESC', label: '월령 높은 순 (최대 40개월)' },
  { value: 'TOTAL_PRICE_ASC', label: '판매가 낮은 순' },
  { value: 'TOTAL_PRICE_DESC', label: '판매가 높은 순' },
];

export function PriceDetailSheet({ isOpen, itemId, onClose, onFavoriteRemoved: _onFavoriteRemoved }: PriceDetailSheetProps) {
  // 4. 💡 핵심: 실제로 백엔드 API에서 데이터를 가져오는 훅 연결
  // status: 'idle' | 'loading' | 'success' | 'empty' | 'error' 중 하나를 가집니다.
  const { status, detail, refetch } = usePriceDetail(isOpen ? itemId : null);
  const sourceItems = useMemo(() => detail?.sourceItems ?? [], [detail]);
  const sourceRecords = useMemo(() => detail?.sourceRecords ?? [], [detail]);

  const [activeTab, setActiveTab] = useState<string>(GRADE_TABS[0]);
  const [sortOption, setSortOption] = useState<SortOption>('PRICE_PER_KG_ASC');
  const sheetRef = useRef<HTMLDivElement>(null);

  // 5. API 응답(detail.sourceItems)을 화면 렌더링용 규격으로 변환 + 중량/최종가 산출
  // 💡 useMemo: 데이터가 바뀔 때만 재계산하는 성능 최적화 훅. 계산기가 입력값이 같으면 다시 계산 안 하는 것과 같습니다.
  const items = useMemo<FormattedMarketItem[]>(() => {
    if (sourceItems.length > 0) {
      return sourceItems.map((si) => {
        const weight = si.weightKg || extractWeight(si.name) || 0;
        const pricePerKg = si.price || 0;
        const totalPrice = si.salePrice || (weight > 0 ? Math.round(pricePerKg * weight) : 0);

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
    const gradeItems = groupedItems[activeTab] || [];
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
  }, [activeTab, groupedItems, sortOption]);
  const stats = useMemo(() => {
    if (currentItems.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    const prices = currentItems.map((item: FormattedMarketItem) => item.pricePerKg);
    return {
      avg: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: currentItems.length,
    };
  }, [currentItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center px-[var(--spacing-20)]">
      {/* 배경 딤(Dim) 처리 및 클릭 시 닫기 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 바텀 시트 컨테이너 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-detail-title"
        className="relative z-10 w-full max-w-md max-h-[calc(100dvh-96px)] overflow-y-auto bg-[var(--color-surface)] rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] p-[var(--spacing-20)] shadow-medium transition-transform duration-200"
      >
        {/* 상단 헤더 및 닫기 버튼 */}
        <div className="flex justify-between items-center mb-[var(--spacing-16)]">
          <h2 id="price-detail-title" className="text-title text-[var(--text-strong)]">상세 시세 및 구매</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="상세 시세 닫기"
            className="w-12 h-12 -mr-2 flex items-center justify-center rounded-[var(--radius-full)] text-[var(--text-light)] text-title-xl active:scale-[0.98] hover:bg-[var(--color-surface-soft)] transition-all duration-200"
          >
            ✕
          </button>
        </div>

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
              onClick={refetch}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* ③ 데이터 없음: 안내 문구 */}
        {status === 'empty' && (
          <div className="py-12 text-center">
            <p className="text-2xl mb-2">🥩</p>
            <p className="text-gray-600 font-bold mb-1">현재 수집된 도매 매물이 없습니다.</p>
            <p className="text-gray-400 text-sm">잠시 후 다시 시도해 주세요.</p>
          </div>
        )}

        {/* ④ 성공: 등급별 탭 필터 + 통계 카드 + 상품 카드 리스트 */}
        {status === 'success' && items.length > 0 && (
          <>
            {/* 상단 등급 탭 버튼 */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {GRADE_TABS.map((tab) => (
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
                  <span className="text-sm font-normal opacity-80">({groupedItems[tab]?.length}건)</span>
                </button>
              ))}
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

            {/* 선택된 등급의 평균가 요약 카드 */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
              <p className="text-gray-500 mb-2">{activeTab} 평균 시세 (1kg)</p>
              <p className="text-3xl font-extrabold text-gray-900">
                {stats.avg.toLocaleString()}원
              </p>
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
                  <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(64px,0.65fr)_minmax(104px,1fr)] border-b border-[var(--color-divider)] pb-[var(--spacing-12)]">
                    <div className="col-span-2 min-w-0 pr-[var(--spacing-12)] border-r border-[var(--color-divider)]">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">상품명</p>
                      <p className="text-label text-[var(--text-strong)] break-words leading-snug">{item.itemName}</p>
                    </div>
                    <div className="min-w-0 overflow-hidden pl-[var(--spacing-12)] text-right">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">제조일</p>
                      <p className="w-full truncate text-base font-bold leading-snug tabular-nums text-[var(--text-strong)]" title={formatDate(item.manufacturedAt)}>
                        {formatDate(item.manufacturedAt)}
                      </p>
                    </div>
                  </div>

                  {/* 2행: 등급 | 월령 | 소비기한 */}
                  <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(64px,0.65fr)_minmax(104px,1fr)] border-b border-[var(--color-divider)] py-[var(--spacing-12)]">
                    <div className="min-w-0 pr-[var(--spacing-12)] border-r border-[var(--color-divider)]">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">등급</p>
                      <p className="text-label text-[var(--text-strong)]">{item.grade}</p>
                    </div>
                    <div className="min-w-0 px-[var(--spacing-12)] border-r border-[var(--color-divider)]">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">월령</p>
                      {item.ageInMonths != null ? (
                        <span className="inline-block px-2 py-0.5 rounded-[var(--radius-sm)] bg-[#edf6fc] text-[var(--color-secondary)] text-caption font-bold whitespace-nowrap">
                          {item.ageInMonths}개월
                        </span>
                      ) : (
                        <span className="text-label text-[var(--text-strong)]">-</span>
                      )}
                    </div>
                    <div className="min-w-0 overflow-hidden pl-[var(--spacing-12)] text-right">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">소비기한</p>
                      <p
                        className={`w-full truncate text-base font-bold leading-snug tabular-nums ${isExpirySoon(item.expiresAt) ? 'text-[var(--color-text-red)]' : 'text-[var(--text-strong)]'}`}
                        title={formatDate(item.expiresAt)}
                      >
                        {isExpirySoon(item.expiresAt) ? '⚠ ' : ''}{formatDate(item.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {/* 3행: kg당 단가 | 중량 | 판매가 */}
                  <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(64px,0.65fr)_minmax(104px,1fr)] pt-[var(--spacing-16)]">
                    <div className="pr-[var(--spacing-12)] border-r border-[var(--color-divider)]">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">kg당 단가</p>
                      <p className="text-label text-[var(--text-strong)]">{item.pricePerKg.toLocaleString()}원</p>
                    </div>
                    <div className="px-[var(--spacing-12)] border-r border-[var(--color-divider)] text-center">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">중량</p>
                      <p className="text-label text-[var(--text-strong)]">{item.weight ? `${item.weight}kg` : '-'}</p>
                    </div>
                    <div className="pl-[var(--spacing-12)] text-right">
                      <p className="text-caption text-[var(--text-light)] mb-[var(--spacing-4)]">판매가</p>
                      <p className="text-xl font-black tracking-[-0.04em] tabular-nums whitespace-nowrap text-[var(--text-strong)]">
                        {item.totalPrice ? `${item.totalPrice.toLocaleString()}원` : '-'}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
