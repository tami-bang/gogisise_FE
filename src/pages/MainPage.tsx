import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/common/PageLayout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { InlineError } from '../components/common/InlineError';
import { Toast } from '../components/common/Toast';
import { ListSkeleton } from '../components/common/ListSkeleton';
import { AnimalSelect } from '../components/domain/AnimalSelect';
import { SummaryStats } from '../components/domain/SummaryStats';
import { FavoriteShareSheet } from '../components/domain/FavoriteShareSheet';
import { PriceDetailSheet } from '../components/domain/price-detail/PriceDetailSheet';
import { useFavoritePrices } from '../hooks/useFavoritePrices';
import { useMarketSummary } from '../hooks/useMarketSummary';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SearchInput } from '../components/common/SearchInput';
import { marketService } from '../api/services/marketService';
import { matchesSearch } from '../utils/koreanSearch';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
interface CategoryNode {
  ctgNo: string;
  name: string;
  parentNo: string | null;
  depth: number;
  path: string;
}

const CATEGORY_MASTER = {
  HANWOO_CHILLED: ["안심", "등심", "윗등심", "채끝", "아랫등심", "목심", "앞다리살(앞다리+꾸리)", "앞다리살", "꾸리살", "부채살", "우둔(홍두깨포함)", "우둔살", "홍두깨", "설도(삼각살 X)", "설도", "설깃", "양지머리,치마양지", "양지머리외", "삼각살", "차돌양지", "치마살", "차돌박이(냉장)", "업진살", "앞치마살,업진안살", "앞치마살", "업진안살", "사태", "갈비", "갈비살", "안창살", "갈비본살+갈비살치", "토시살", "토시,제비추리", "늑간살", "제비추리", "안창외2종"],
  HANWOO_FROZEN: ["차돌박이", "우족", "사골", "꼬리반골", "알꼬리", "잡뼈", "냉동설깃", "냉동우둔", "잡육", "도가니", "스지", "냉동목심", "냉동앞다리", "냉동설도", "냉동양지머리외", "냉동양지머리, 치마양지", "냉동사태", "냉동갈비"],
  HANDON_CHILLED: ["더좋은삼겹", "더좋은삼겹(암)", "더좋은미박삼겹", "더좋은미박삼겹(암)", "두판삼겹", "A원삼겹", "삼겹", "삼겹(암)", "미박삼겹", "미박삼겹(암)", "목심", "미박목심", "목심(암)", "앞다리", "미박앞다리", "앞다리(암)", "미박앞다리(암)", "뒷다리", "미박뒷다리", "등심", "지방등심", "mm등심", "안심", "안심S", "갈비", "등갈비", "항정", "등심덧살", "갈매기", "삼겹(수육용)", "미박삼겹(수육용)", "목심(수육용)", "삼겹미추리", "미박앞사태", "미박뒷사태", "사태", "미박사태", "미사태", "미박삼겹(흑)", "미박목심(흑)", "미박앞다리(흑)", "등심(흑)", "안심(흑)", "미박뒷다리(흑)", "항정(흑)", "등심덧살(흑)", "갈매기(흑)"],
  HANDON_FROZEN: ["냉동롤삼겹(꽃삼겹)", "냉동삼겹", "냉동미박삼겹", "냉동목심", "냉동뒷다리", "냉동목심(수육용)", "냉동앞다리", "냉동미박앞다리", "냉동미박뒷다리", "냉동등심", "냉동안심", "냉동갈비", "냉동등갈비", "냉동항정", "냉동갈매기", "냉동등심덧살", "냉동잡육A", "냉동등뼈", "냉동돈피", "냉동앞장족", "냉동뒷장족", "냉동미박사태", "냉동미박앞사태", "냉동미박뒷사태", "냉동앞미니족", "냉동뒷미니족", "냉동사태", "냉동꼬리살", "냉동뒷고기", "냉동두항정", "냉동볼살+혀밑살", "냉동덜미살", "냉동막창", "전지연골", "냉동돈두롤"]
};

export function MainPage() {
  const navigate = useNavigate();
  const [animalType, setAnimalType] = useState<'BEEF' | 'PORK'>('BEEF');
  const [storageType, setStorageType] = useState<'CHILLED' | 'FROZEN'>('CHILLED');

  const { status: summaryStatus, summary, refetch: loadInitialData } = useMarketSummary();
  const initialStatus: AsyncStatus = summaryStatus === 'empty'
    ? 'success'
    : summaryStatus === 'idle'
      ? 'loading'
      : summaryStatus;

  const {
    status: listStatus,
    items = [],
    refetch: refetchFavorites,
  } = useFavoritePrices({
    animalType,
    storageType,
    page: 1,
    limit: 1000,
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const mainRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORY_CACHE_KEY = 'gogisise:cache:category_tree';
  const [categories, setCategories] = useState<CategoryNode[]>(() => {
    try {
      const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loadingCategories, setLoadingCategories] = useState(() => {
    try {
      return !localStorage.getItem(CATEGORY_CACHE_KEY);
    } catch {
      return true;
    }
  });

  const [errorCategories, setErrorCategories] = useState<boolean>(false);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCategoryTree = async () => {
    setLoadingCategories(() => {
      try {
        return !localStorage.getItem(CATEGORY_CACHE_KEY);
      } catch {
        return true;
      }
    });
    setErrorCategories(false);
    try {
      const data = await marketService.getCategoryTree({ depth: 4 });
      setCategories(data);
      try {
        localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to cache category tree', e);
      }
    } catch (e) {
      console.error('Failed to fetch category tree:', e);
      setErrorCategories(true);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategoryTree();
  }, []);

  const targetMasterList = useMemo(() => {
    if (animalType === 'BEEF' && storageType === 'CHILLED') return CATEGORY_MASTER.HANWOO_CHILLED;
    if (animalType === 'BEEF' && storageType === 'FROZEN') return CATEGORY_MASTER.HANWOO_FROZEN;
    if (animalType === 'PORK' && storageType === 'CHILLED') return CATEGORY_MASTER.HANDON_CHILLED;
    return CATEGORY_MASTER.HANDON_FROZEN;
  }, [animalType, storageType]);

  const favoritedCategoriesSet = useMemo(() => {
    if (!items || items.length === 0) return new Set<string>();
    return new Set(items.map((item) => item.category.trim()));
  }, [items]);

  const filteredCategories = useMemo(() => {
    if (!animalType) return [];

    const apiFiltered = categories.filter((node) => {
      const path = node.path || '';
      const isBeef = path.includes('한우') && path.includes('암소');
      const isPork = path.includes('돈육');
      return animalType === 'BEEF' ? isBeef : isPork;
    });

    return targetMasterList
      .filter((name) => favoritedCategoriesSet.has(name.trim()))
      .map((name) => {
        const matchedNode = apiFiltered.find((n) => n.name.trim() === name.trim());
        const speciesPrefix = animalType === 'BEEF' ? '국내산 한우 > 국내산 한우 암소' : '국내산 돈육';
        const storagePrefix = storageType === 'CHILLED' ? '냉장' : '냉동';
        const path = `${speciesPrefix} > ${storagePrefix} > ${name}`;

        let ctgNo = `virtual-${name}`;
        if (matchedNode) {
          ctgNo = matchedNode.ctgNo;
        }

        return {
          ctgNo,
          name,
          displayName: name,
          path,
          hasApiData: !!matchedNode,
        };
      })
      .filter((item) => {
        return matchesSearch(item.displayName, searchQuery);
      });
  }, [categories, animalType, storageType, targetMasterList, searchQuery, favoritedCategoriesSet]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('인터넷이 다시 연결되었어요');
      if (initialStatus === 'error') loadInitialData();
      refetchFavorites();
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('인터넷 연결이 끊겼어요');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initialStatus, loadInitialData, refetchFavorites, showToast]);

  const handleStorageChange = (type: 'CHILLED' | 'FROZEN') => {
    if (storageType === type) return;
    setStorageType(type);
  };

  const handleOpenShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOffline) {
      showToast('인터넷 연결이 없어 공유할 수 없어요');
      return;
    }
    setLastFocusedElement(e.currentTarget);
    setIsShareModalOpen(true);
  };

  const handleCloseShare = () => {
    setIsShareModalOpen(false);
    if (lastFocusedElement) {
      setTimeout(() => {
        lastFocusedElement.focus();
        setLastFocusedElement(null);
      }, 10);
    }
  };

  const handleConfirmShare = async () => {
    setIsSharing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsShareModalOpen(false);
      showToast('오늘 시세 공유를 시작했어요');
      if (lastFocusedElement) {
        setTimeout(() => {
          lastFocusedElement.focus();
          setLastFocusedElement(null);
        }, 10);
      }
    } catch {
      showToast('시세를 공유하지 못했어요. 다시 시도해 주세요');
    } finally {
      setIsSharing(false);
    }
  };

  const handleNavigateToAll = () => {
    navigate(`/all-prices?animalType=${animalType || 'BEEF'}&storageType=${storageType}`);
  };

  if (initialStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (initialStatus === 'error') {
    return (
      <ErrorState
        title="시세를 불러오지 못했어요"
        description="인터넷 연결을 확인한 뒤 다시 시도해 주세요"
        onRetry={loadInitialData}
      />
    );
  }

  const headerTitle = '즐겨찾기 시세';
  const rightAction = 'share';

  return (
    <PageLayout disableScroll>
      <Header
        title={headerTitle}
        rightAction={rightAction}
        onActionClick={handleOpenShare}
      />

      <main ref={mainRef} className="w-full flex flex-col flex-1 min-h-0 pb-4">
        {summaryStatus === 'error' && (
          <div className="w-full pt-6 flex-shrink-0">
            <InlineError message="오늘의 시세 요약을 불러오지 못했어요" onRetry={loadInitialData} />
          </div>
        )}

          <div 
            ref={scrollContainerRef}
            className="flex-1 flex flex-col overflow-y-auto [scrollbar-gutter:stable] px-5 -mx-5 min-h-0 relative pb-[var(--spacing-16)]"
          >
            {summaryStatus === 'success' && summary && (
              <div className="w-full flex-shrink-0 pt-[var(--spacing-16)]">
                <SummaryStats
                  summary={summary}
                  onClickCard={setAnimalType}
                  activeAnimal={animalType}
                />
              </div>
            )}

            <div className="w-full flex-shrink-0 flex flex-col pt-[var(--spacing-16)] pb-[var(--spacing-8)] gap-[var(--spacing-12)]">
              <div className="flex-shrink-0 w-full">
                <AnimalSelect selectedType={animalType} onSelect={setAnimalType} hideHeader />
              </div>

              <SegmentedControl
                options={[
                  { label: '냉장', value: 'CHILLED' },
                  { label: '냉동', value: 'FROZEN' },
                ]}
                selectedValue={storageType}
                onChange={(val) => handleStorageChange(val as 'CHILLED' | 'FROZEN')}
              />

              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="부위명으로 검색 (예: 삼겹, 안심)"
              />

              {!loadingCategories && !errorCategories && (
                <div className="flex items-center justify-between">
                  <span className="text-caption text-[var(--text-light)]">
                    {searchQuery.trim() ? `"${searchQuery.trim()}" 검색 결과` : '즐겨찾기 부위 선택'}
                  </span>
                  <span
                    className="text-caption font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: filteredCategories.length > 0
                        ? 'rgba(59, 145, 200, 0.1)'
                        : 'rgba(209, 71, 52, 0.1)',
                      color: filteredCategories.length > 0
                        ? 'var(--color-secondary)'
                        : 'var(--color-text-red)',
                    }}
                  >
                    {filteredCategories.length}개 부위
                  </span>
                </div>
              )}
            </div>

            <main className="w-full flex-1 flex flex-col pb-[var(--spacing-16)] px-5">
              <div ref={listTopRef} />

              <div className="flex justify-between items-end mb-[var(--spacing-16)]">
                <h3 className="text-title font-bold">
                  {animalType === 'BEEF' ? '한우' : '한돈'} {storageType === 'CHILLED' ? '냉장' : '냉동'} 즐겨찾기 목록
                </h3>
                <span className="text-caption text-[var(--text-light)]">1kg 기준 시세</span>
              </div>

              <div className="flex flex-col gap-[var(--spacing-12)]">
                {(loadingCategories || listStatus === 'loading') && <ListSkeleton count={6} />}

                {(errorCategories || listStatus === 'error') && (
                  <div className="mt-8">
                    <InlineError
                      message="즐겨찾기 데이터를 불러오지 못했습니다."
                      onRetry={() => {
                        fetchCategoryTree();
                        refetchFavorites();
                      }}
                    />
                  </div>
                )}

                {!loadingCategories && listStatus !== 'loading' && categories.length > 0 && filteredCategories.length === 0 && (
                  <div className="mt-8">
                    <EmptyState
                      title={searchQuery.trim() ? `"${searchQuery.trim()}"에 해당하는 즐겨찾기 부위가 없습니다.` : '즐겨찾기한 품목이 없습니다.'}
                      description={searchQuery.trim() ? '다른 부위를 검색해 보세요.' : '전체 시세에서 품목을 즐겨찾기에 추가해 보세요.'}
                      actionLabel={searchQuery.trim() ? undefined : '전체 시세로 이동'}
                      onAction={searchQuery.trim() ? undefined : handleNavigateToAll}
                    />
                  </div>
                )}

                {!loadingCategories && listStatus !== 'loading' && filteredCategories.length > 0 && filteredCategories.map((node) => {
                  const hasData = node.hasApiData;
                  return (
                    <button
                      key={node.ctgNo}
                      disabled={!hasData}
                      onClick={() => hasData && setSelectedItemId(`path:${node.path}`)}
                      className={`w-full text-left bg-[var(--color-surface)] p-[var(--spacing-20)] rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft transition-all duration-200 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                        hasData 
                          ? 'active:scale-[0.98] active:bg-[rgba(59,145,200,0.05)] cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-body-lg text-[var(--text-strong)] font-bold">{node.displayName}</span>
                        <span className="text-caption text-[var(--text-light)]">
                          {node.path ? node.path.split(' > ').slice(0, 2).join(' > ') : (animalType === 'BEEF' ? '국내산 한우 > 국내산 한우 암소' : '국내산 돈육')}
                        </span>
                      </div>
                      {hasData ? (
                        <div className="flex items-center gap-1 text-caption text-[var(--color-secondary)] font-bold">
                          시세 보기 &rarr;
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-caption text-[var(--text-light)] font-bold">
                          0개 (준비중)
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </main>

            {/* 플로팅 최상단 이동 버튼 (푸터와 겹치지 않으면서 너무 붕 뜨지 않도록 최적의 중간 높이 112px 지정) */}
            <div 
              className="absolute right-5 z-[99]"
              style={{ bottom: '112px' }}
            >
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-divider)] shadow-soft text-[var(--color-secondary)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-surface-soft)] transition-all duration-200"
                aria-label="최상단으로 이동"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
            </div>
          </div>
      </main>

      <Footer activeTab="favorite" />

      <FavoriteShareSheet
        isOpen={isShareModalOpen}
        isSharing={isSharing}
        onClose={handleCloseShare}
        onConfirm={handleConfirmShare}
      />

      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
        onFavoriteRemoved={() => {
          refetchFavorites();
          const focusTarget = document.getElementById('price-list-header');
          if (focusTarget) focusTarget.focus();
        }}
      />

      <Toast
        isVisible={isToastVisible}
        message={toastMessage}
        onClose={() => setIsToastVisible(false)}
      />
    </PageLayout>
  );
}
