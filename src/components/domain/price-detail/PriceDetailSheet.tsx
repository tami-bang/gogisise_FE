import { useState, useMemo, useEffect, useRef } from 'react';
import { usePriceDetail } from '../../../hooks/usePriceDetail';
import { ListSkeleton } from '../../common/ListSkeleton';
import { InlineError } from '../../common/InlineError';
import { EmptyState } from '../../common/EmptyState';

interface PriceDetailSheetProps {
  isOpen: boolean;
  itemId: string | null;
  onClose: () => void;
  onFavoriteRemoved?: () => void; // 선택적 속성으로 유지 (MainPage 호환용)
}

// 1. 상품명에서 등급을 정확히 낚아채는 유틸리티 함수
const extractGrade = (name: string) => {
  if (name.includes('1++')) return '1++등급';
  if (name.includes('1+')) return '1+등급';
  if (name.includes('1등급') || name.match(/\b1\b/)) return '1등급';
  return '기타'; 
};

// 2. 상품명에서 중량(kg)을 동적으로 낚아채는 정규식 유틸 함수
const extractWeight = (name: string): number | null => {
  const match = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
  return match ? parseFloat(match[1]) : null;
};

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
  const { status, detail, refetch } = usePriceDetail(isOpen ? itemId : null);
  const [activeTab, setActiveTab] = useState<string>('');
  const sheetRef = useRef<HTMLDivElement>(null);

  // 3. API 응답 데이터(sourceItems)를 화면용 데이터 스펙으로 포맷팅 및 중량/총가격 산출
  const items = useMemo<FormattedMarketItem[]>(() => {
    if (!detail || !detail.sourceItems) return [];
    return detail.sourceItems.map((si) => {
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
  }, [detail]);

  // 4. 원본 데이터를 등급별로 그룹화 및 탭 목록 생성
  const { groupedItems, availableTabs } = useMemo(() => {
    if (items.length === 0) return { groupedItems: {}, availableTabs: [] };

    const groups: Record<string, FormattedMarketItem[]> = {
      '1++등급': [],
      '1+등급': [],
      '1등급': [],
      '기타': []
    };

    items.forEach((item: FormattedMarketItem) => {
      const grade = extractGrade(item.itemName || '');
      groups[grade].push(item);
    });

    const targetGrades = ['1++등급', '1+등급', '1등급'];
    const tabs = targetGrades.filter(g => groups[g].length > 0);

    if (tabs.length === 0 && groups['기타'].length > 0) {
      tabs.push('전체');
      groups['전체'] = groups['기타'];
    }

    return { groupedItems: groups, availableTabs: tabs };
  }, [items]);

  // 모달이 열리거나 데이터가 바뀔 때 첫 번째 탭 자동 선택
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  // ESC 키 누를 시 닫기 바인딩
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  // 바텀 시트 열릴 시 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 5. 현재 선택된 탭(등급)의 실시간 통계 계산
  const currentItems = groupedItems[activeTab] || [];
  const stats = useMemo(() => {
    if (currentItems.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    const prices = currentItems.map((item: FormattedMarketItem) => item.pricePerKg); 
    
    return {
      avg: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: currentItems.length
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {status === 'loading' && (
          <div className="pt-4"><ListSkeleton count={4} /></div>
        )}

        {status === 'error' && (
          <div className="pt-8">
            <InlineError message="평균 산출 정보를 불러오지 못했습니다. 다시 시도해 주세요." onRetry={refetch} />
          </div>
        )}

        {status === 'empty' && (
          <div className="pt-8">
            <EmptyState
              title="상세 정보가 아직 준비되지 않았습니다."
              description="잠시 후 다시 시도해 주세요."
            />
          </div>
        )}

        {status === 'success' && items.length > 0 && (
          <>
            {/* UI 렌더링: 상단 탭 버튼 영역 */}
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
                  {tab} <span className="text-sm font-normal opacity-80">({groupedItems[tab]?.length}건)</span>
                </button>
              ))}
            </div>

            {/* UI 렌더링: 선택된 등급 전용 평균가 요약 카드 */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
              <p className="text-gray-500 mb-2">{activeTab} 평균 시세 (1kg)</p>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {stats.avg.toLocaleString()}원
              </h2>
              
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

            {/* UI 렌더링: 선택된 등급의 상세 상품 카드 리스트 및 링크 연결 */}
            <div className="flex flex-col gap-4 pb-8">
              {currentItems.map((item: FormattedMarketItem, idx: number) => (
                <a
                  key={idx}
                  href={item.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
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
                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                      구매창 이동 ↗
                    </span>
                  </div>

                  {/* 상품명 */}
                  <h4 className="font-bold text-gray-900 text-[15px] mb-3 leading-snug">
                    {item.itemName}
                  </h4>

                  {/* 상세 스펙 (중량) */}
                  <div className="text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg flex flex-col gap-1.5 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">총 중량</span>
                      <span className="font-bold text-gray-800">{item.weight ? `${item.weight}kg` : '-'}</span>
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
