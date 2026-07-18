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
  if (name.includes('1++')) return '1++등급';
  if (name.includes('1+')) return '1+등급';
  if (name.includes('1등급') || name.match(/\b1\b/)) return '1등급';
  return '기타';
};

// 2. 상품명에서 중량(kg)을 동적으로 낚아채는 정규식 유틸 함수
// 💡 정규식(Regex): '(숫자)+(kg)' 패턴을 탐지하는 필터. 광화문 CCTV가 번호판만 인식하는 것과 같습니다.
const extractWeight = (name: string): number | null => {
  const match = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
  return match ? parseFloat(match[1]) : null;
};

// 3. 화면에서 사용할 상품 데이터의 타입 명세서(Interface)
interface FormattedMarketItem {
  goodsNo: string;
  brandName: string;
  grade: string;
  itemName: string;
  weight?: number;
  pricePerKg: number;
  totalPrice?: number;
  detailUrl?: string;
}

export function PriceDetailSheet({ isOpen, itemId, onClose, onFavoriteRemoved: _onFavoriteRemoved }: PriceDetailSheetProps) {
  // 4. 💡 핵심: 실제로 백엔드 API에서 데이터를 가져오는 훅 연결
  // status: 'idle' | 'loading' | 'success' | 'empty' | 'error' 중 하나를 가집니다.
  const { status, detail, refetch } = usePriceDetail(isOpen ? itemId : null);
  const sourceItems = useMemo(() => detail?.sourceItems ?? [], [detail]);
  const sourceRecords = useMemo(() => detail?.sourceRecords ?? [], [detail]);

  const [activeTab, setActiveTab] = useState<string>('');
  const sheetRef = useRef<HTMLDivElement>(null);

  // 5. API 응답(detail.sourceItems)을 화면 렌더링용 규격으로 변환 + 중량/최종가 산출
  // 💡 useMemo: 데이터가 바뀔 때만 재계산하는 성능 최적화 훅. 계산기가 입력값이 같으면 다시 계산 안 하는 것과 같습니다.
  const items = useMemo<FormattedMarketItem[]>(() => {
    if (sourceItems.length > 0) {
      return sourceItems.map((si) => {
        const weight = extractWeight(si.name) || 0;
        const pricePerKg = si.price || 0;
        const totalPrice = weight > 0 ? Math.round(pricePerKg * weight) : 0;

        return {
          goodsNo: si.itemId,
          brandName: si.brand || '금천한우',
          grade: si.grade || extractGrade(si.name),
          itemName: si.name,
          weight: weight > 0 ? weight : undefined,
          pricePerKg,
          totalPrice: totalPrice > 0 ? totalPrice : undefined,
          detailUrl: si.detailUrl,
        };
      });
    }

    return sourceRecords.map((record) => {
      const itemName = record.rawProductName || record.sourceName;
      return {
        goodsNo: record.id,
        brandName: record.brand || '금천한우',
        grade: record.grade || extractGrade(itemName),
        itemName,
        pricePerKg: record.price || 0,
      };
    });
  }, [sourceItems, sourceRecords]);

  // 6. 변환된 items를 등급별(1++, 1+, 1등급)로 그룹화 및 탭 목록 생성
  const { groupedItems, availableTabs } = useMemo(() => {
    if (items.length === 0) return { groupedItems: {}, availableTabs: [] };

    const groups: Record<string, FormattedMarketItem[]> = {
      '1++등급': [],
      '1+등급': [],
      '1등급': [],
      '기타': [],
    };

    items.forEach((item: FormattedMarketItem) => {
      const grade = extractGrade(item.itemName || '');
      groups[grade].push(item);
    });

    const targetGrades = ['1++등급', '1+등급', '1등급'];
    const tabs = targetGrades.filter(g => groups[g].length > 0);

    // 등급 구분이 없는 경우(예: 돼지고기) '전체' 탭으로 폴백
    if (tabs.length === 0 && groups['기타'].length > 0) {
      tabs.push('전체');
      groups['전체'] = groups['기타'];
    }

    return { groupedItems: groups, availableTabs: tabs };
  }, [items]);

  // 7. 데이터 로드 완료 시 첫 번째 탭 자동 선택
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

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
  const currentItems = groupedItems[activeTab] || [];
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 배경 딤(Dim) 처리 및 클릭 시 닫기 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 바텀 시트 컨테이너 */}
      <div
        ref={sheetRef}
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 z-10 max-h-[90vh] overflow-y-auto transform transition-transform"
      >
        {/* 상단 헤더 및 닫기 버튼 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">상세 시세 및 구매</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            ✕
          </button>
        </div>

        {/* 💡 상태(Status)에 따른 조건 분기 렌더링 */}

        {/* ① 로딩 중: 스켈레톤 UI (첫 번째 사진 대응) */}
        {(status === 'loading' || status === 'idle') && (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-10 bg-gray-200 rounded-full w-3/4 mb-4"></div>
            <div className="h-32 bg-gray-100 rounded-xl w-full mb-4"></div>
            <div className="h-24 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
            <div className="h-24 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
            <div className="h-24 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
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
              {availableTabs.map((tab: string) => (
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
                  className={`block bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all ${
                    item.detailUrl ? 'hover:border-blue-500 hover:shadow-md cursor-pointer' : ''
                  }`}
                >
                  {/* 브랜드 및 등급 뱃지 */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1.5">
                      <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded border border-orange-100">
                        {item.brandName}
                      </span>
                      <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-100">
                        {item.grade}
                      </span>
                    </div>
                    {item.detailUrl && (
                      <span className="text-xs text-blue-600 font-bold">구매창 이동 ↗</span>
                    )}
                  </div>

                  {/* 상품명 */}
                  <h4 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">
                    {item.itemName}
                  </h4>

                  {/* 상세 스펙 (중량) */}
                  <div className="text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg flex flex-col gap-1.5 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">총 중량</span>
                      <span className="font-bold text-gray-800">
                        {item.weight ? `${item.weight}kg` : '-'}
                      </span>
                    </div>
                  </div>

                  {/* 가격 정보 (kg당 단가 & 최종 판매가) */}
                  <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-1">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">kg당 단가</p>
                      <p className="font-bold text-gray-700 text-sm">
                        {item.pricePerKg?.toLocaleString()}원
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-500 mb-0.5">최종 판매가</p>
                      <p className="text-lg font-extrabold text-red-600">
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
