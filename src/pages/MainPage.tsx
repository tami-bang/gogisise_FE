import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { Pagination } from '../components/common/Pagination';
import { AnimalSelect } from '../components/domain/AnimalSelect';
import { SummaryStats } from '../components/domain/SummaryStats';
import { FavoritePriceList } from '../components/domain/FavoritePriceList';
import { KakaoShareButton } from '../components/domain/KakaoShareButton';
import { FavoriteShareSheet } from '../components/domain/FavoriteShareSheet';
import { PriceDetailSheet } from '../components/domain/price-detail/PriceDetailSheet';
import { useFavoritePrices } from '../hooks/useFavoritePrices';
import { useMarketSummary } from '../hooks/useMarketSummary';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
const ITEMS_PER_PAGE = 15;

export function MainPage() {
  const navigate = useNavigate();
  const [appStep, setAppStep] = useState<'select' | 'list'>('select');
  const [animalType, setAnimalType] = useState<'BEEF' | 'PORK' | null>(null);
  const [storageType, setStorageType] = useState<'CHILLED' | 'FROZEN'>('CHILLED');
  const [page, setPage] = useState(1);

  const { status: summaryStatus, summary, refetch: loadInitialData } = useMarketSummary();
  const initialStatus: AsyncStatus = summaryStatus === 'empty'
    ? 'success'
    : summaryStatus === 'idle'
      ? 'loading'
      : summaryStatus;

  const {
    status: listStatus,
    items,
    totalPages,
    totalCount,
    refetch: refetchFavorites,
  } = useFavoritePrices({
    animalType,
    storageType,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pageChangeTrigger, setPageChangeTrigger] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const mainRef = useRef<HTMLElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('인터넷이 다시 연결되었어요');
      if (initialStatus === 'error') loadInitialData();
      if (appStep === 'list') refetchFavorites();
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
  }, [appStep, initialStatus, loadInitialData, refetchFavorites, showToast]);

  useEffect(() => {
    if (totalCount > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalCount, totalPages]);

  useEffect(() => {
    if (appStep === 'list' && listStatus === 'success') {
      setPageChangeTrigger((trigger) => trigger + 1);
    }
  }, [appStep, animalType, listStatus, page, storageType]);

  useLayoutEffect(() => {
    if (pageChangeTrigger > 0 && listStatus === 'success') {
      listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pageChangeTrigger, listStatus]);

  const handleAnimalSelect = (type: 'BEEF' | 'PORK') => {
    setAnimalType(type);
    if (appStep === 'select') {
      const hasSeen = sessionStorage.getItem('hasSeenAnimalTooltip');
      if (!hasSeen) {
        setShowTooltip(true);
        sessionStorage.setItem('hasSeenAnimalTooltip', 'true');
      }
    }
    setAppStep('list');
    setStorageType('CHILLED');
    setPage(1);
  };

  const handleStorageChange = (type: 'CHILLED' | 'FROZEN') => {
    if (storageType === type) return;
    setStorageType(type);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(Math.min(newPage, totalPages));
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

  const handleBack = () => {
    setAppStep('select');
    setAnimalType(null);
    setStorageType('CHILLED');
    setPage(1);
    setShowTooltip(false);
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

  const headerTitle = appStep === 'select'
    ? '고기시세'
    : `${animalType === 'BEEF' ? '소고기' : '돼지고기'} 즐겨찾기 시세 목록`;
  const rightAction = appStep === 'select' ? null : 'share';

  return (
    <PageLayout>
      <Header
        title={headerTitle}
        rightAction={rightAction}
        onActionClick={rightAction === 'share' ? handleOpenShare : undefined}
        onBack={appStep === 'list' ? handleBack : undefined}
      />

      <main ref={mainRef} className="w-full flex flex-col flex-1 pb-4">
        {summaryStatus === 'error' && (
          <div className="w-full pt-6 flex-shrink-0">
            <InlineError message="오늘의 시세 요약을 불러오지 못했어요" onRetry={loadInitialData} />
          </div>
        )}

        {appStep === 'select' && (
          <div className="w-full flex-1">
            <AnimalSelect onSelect={handleAnimalSelect} />
          </div>
        )}

        {appStep === 'list' && (
          <>
            {summaryStatus === 'success' && summary && (
              <SummaryStats
                summary={summary}
                onClickCard={handleAnimalSelect}
                activeAnimal={animalType}
              />
            )}

            {showTooltip && (
              <div className="mx-5 mb-6 bg-[var(--color-primary)] text-white text-body font-bold rounded-[var(--radius-md)] px-4 py-3 flex justify-between items-center shadow-soft animate-fade-in">
                <span>소고기·돼지고기 카드를 눌러 시세를 전환할 수 있어요</span>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="p-1 -mr-1 active:scale-95"
                  aria-label="닫기"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            )}

            <section className="w-full pb-6">
              <div ref={listTopRef} className="scroll-mt-[88px]" />
              <div className="flex bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-1 mb-6 gap-1">
                <button
                  className={`flex-1 py-3 text-center text-label rounded-[var(--radius-md)] transition-colors ${
                    storageType === 'CHILLED'
                      ? 'border-2 border-[var(--color-secondary)] bg-[var(--color-surface)] text-[var(--text-strong)]'
                      : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--text-muted)]'
                  }`}
                  aria-pressed={storageType === 'CHILLED'}
                  onClick={() => handleStorageChange('CHILLED')}
                  disabled={listStatus === 'loading'}
                >
                  냉장
                </button>
                <button
                  className={`flex-1 py-3 text-center text-label rounded-[var(--radius-md)] transition-colors ${
                    storageType === 'FROZEN'
                      ? 'border-2 border-[var(--color-secondary)] bg-[var(--color-surface)] text-[var(--text-strong)]'
                      : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--text-muted)]'
                  }`}
                  aria-pressed={storageType === 'FROZEN'}
                  onClick={() => handleStorageChange('FROZEN')}
                  disabled={listStatus === 'loading'}
                >
                  냉동
                </button>
              </div>

              {listStatus === 'loading' && <ListSkeleton />}

              {listStatus === 'error' && (
                <InlineError message="즐겨찾기 시세를 불러오지 못했어요" onRetry={refetchFavorites} />
              )}

              {listStatus === 'empty' && (
                <EmptyState
                  title={`${animalType === 'BEEF' ? '소고기' : '돼지고기'} ${storageType === 'CHILLED' ? '냉장' : '냉동'} 즐겨찾기가 없어요`}
                  description="전체 시세에서 자주 확인하는 품목을 추가해 보세요"
                  actionLabel="전체 시세에서 품목 찾기"
                  onAction={handleNavigateToAll}
                />
              )}

              {listStatus === 'success' && items.length > 0 && (
                <>
                  <FavoritePriceList items={items} onItemClick={setSelectedItemId} />

                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}

                  <KakaoShareButton onOpenShare={handleOpenShare} />
                </>
              )}
            </section>
          </>
        )}
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
