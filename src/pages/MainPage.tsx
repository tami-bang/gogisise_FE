import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import type { MarketSummary, PriceItem } from '../api';
import { marketService } from '../api';
import { Layout } from '../components/common/Layout';
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
import { selectableStateClass } from '../utils/styles';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export function MainPage() {
  const [appStep, setAppStep] = useState<'select' | 'list'>('select');
  const [animalType, setAnimalType] = useState<'BEEF' | 'PORK' | null>(null);
  const [storageType, setStorageType] = useState<'CHILLED' | 'FROZEN'>('CHILLED');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [items, setItems] = useState<PriceItem[]>([]);

  const [initialStatus, setInitialStatus] = useState<AsyncStatus>('loading');
  const [summaryStatus, setSummaryStatus] = useState<AsyncStatus>('idle');
  const [listStatus, setListStatus] = useState<AsyncStatus>('idle');
  const [paginationStatus, setPaginationStatus] = useState<AsyncStatus>('idle');
  
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [showTooltip, setShowTooltip] = useState(false);

  // Pagination scroll trigger
  const [pageChangeTrigger, setPageChangeTrigger] = useState(0);

  // Share UI states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);

  const listRequestId = useRef(0);
  const mainRef = useRef<HTMLElement>(null);
  const listTopRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  }, []);

  const loadInitialData = useCallback(async () => {
    setInitialStatus('loading');
    setSummaryStatus('loading');
    try {
      const summaryData = await marketService.getMarketSummary();
      setSummary(summaryData);
      setInitialStatus('success');
      setSummaryStatus('success');
    } catch (err) {
      console.error(err);
      setInitialStatus('error');
      setSummaryStatus('error');
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('인터넷이 다시 연결되었어요');
      if (initialStatus === 'error') loadInitialData();
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
  }, [initialStatus, loadInitialData, showToast]);

  useEffect(() => {
    if (appStep !== 'list' || !animalType) return;

    const fetchList = async () => {
      const currentReqId = ++listRequestId.current;
      
      if (page === 1) {
        setListStatus('loading');
      } else {
        setPaginationStatus('loading');
      }

      try {
        const response = await marketService.getPrices({
          animalType,
          storageType,
          page,
          limit: 15
        });

        if (currentReqId !== listRequestId.current) return;

        if (response.items.length === 0 && page === 1) {
          setListStatus('empty');
          setItems([]);
        } else {
          setListStatus('success');
          setPaginationStatus('success');
          
          setItems(response.items);
          setTotalPages(response.hasNextPage ? page + 1 : page);
          setPageChangeTrigger(t => t + 1);
        }
      } catch (err) {
        if (currentReqId !== listRequestId.current) return;
        
        console.error(err);
        if (page === 1) {
          setListStatus('error');
        } else {
          setPaginationStatus('error');
          showToast('다음 페이지를 불러오지 못했어요');
        }
      }
    };

    fetchList();
  }, [appStep, animalType, storageType, page, showToast]);

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
    setPage(Math.min(newPage, totalPages || 1));
  };

  const handleOpenShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOffline) {
      showToast('인터넷 연결이 끊겨 공유할 수 없어요');
      return;
    }
    setLastFocusedElement(e.currentTarget);
    setIsShareModalOpen(true);
  };

  const handleCloseShare = () => {
    setIsShareModalOpen(false);
    if (lastFocusedElement) {
      // Small delay to allow DOM to unmount modal before focusing back
      setTimeout(() => {
        lastFocusedElement.focus();
        setLastFocusedElement(null);
      }, 10);
    }
  };

  const handleConfirmShare = async () => {
    setIsSharing(true);
    try {
      // Mock share delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsShareModalOpen(false);
      showToast('오늘 시세 공유를 시작했어요');
      
      if (lastFocusedElement) {
        setTimeout(() => {
          lastFocusedElement.focus();
          setLastFocusedElement(null);
        }, 10);
      }
    } catch (err) {
      console.error(err);
      showToast('시세를 공유하지 못했어요. 다시 시도해주세요');
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

  if (initialStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (initialStatus === 'error') {
    return (
      <ErrorState 
        title="시세를 불러오지 못했어요" 
        description="인터넷 연결을 확인한 뒤 다시 시도해주세요"
        onRetry={loadInitialData}
      />
    );
  }

  const headerTitle = appStep === 'select' 
    ? '고기시세' 
    : `${animalType === 'BEEF' ? '한우' : '한돈'} 즐겨찾기 시세 목록`;
  
  const rightAction = appStep === 'select' ? null : 'share';

  return (
    <Layout>
      <Header 
        title={headerTitle} 
        rightAction={rightAction}
        onActionClick={rightAction === 'share' ? handleOpenShare : undefined} 
        onBack={appStep === 'list' ? handleBack : undefined}
      />
      
      <main ref={mainRef} className="flex flex-col flex-1 min-h-0 overflow-y-auto pt-[72px] pb-[96px] bg-[var(--color-bg)]">
        {summaryStatus === 'error' && (
          <div className="px-5 pt-6 flex-shrink-0">
            <InlineError 
              message="오늘의 시세 요약을 불러오지 못했어요" 
              onRetry={loadInitialData} 
            />
          </div>
        )}
        
        {appStep === 'select' && (
          <div className="flex-1 min-h-full">
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
                <span>한우·한돈 카드를 눌러 시세를 전환할 수 있어요</span>
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

            <section className="px-5 pb-6">
              <div ref={listTopRef} className="scroll-mt-[88px]" />
              <div className="flex bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-1 mb-6 gap-1">
                <button
                  className={`flex-1 py-3 text-center text-label rounded-[var(--radius-md)] transition-colors ${
                    storageType === 'CHILLED' ? selectableStateClass.active : selectableStateClass.inactive
                  }`}
                  aria-pressed={storageType === 'CHILLED'}
                  onClick={() => handleStorageChange('CHILLED')}
                  disabled={listStatus === 'loading'}
                >
                  냉장
                </button>
                <button
                  className={`flex-1 py-3 text-center text-label rounded-[var(--radius-md)] transition-colors ${
                    storageType === 'FROZEN' ? selectableStateClass.active : selectableStateClass.inactive
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
                <InlineError 
                  message="즐겨찾기 시세를 불러오지 못했어요" 
                  onRetry={() => setPage(1)} 
                />
              )}

              {listStatus === 'empty' && (
                <EmptyState 
                  title={`${animalType === 'BEEF' ? '한우' : '한돈'} ${storageType === 'CHILLED' ? '냉장' : '냉동'} 즐겨찾기가 없어요`}
                  description="전체 시세에서 자주 확인하는 품목을 추가해보세요"
                />
              )}

              {listStatus === 'success' && (
                <>
                  <FavoritePriceList items={items} />
                  
                  {totalPages > 1 && (
                    <div className="mt-4">
                      {paginationStatus === 'error' && (
                        <div className="mb-2">
                          <InlineError message="다음 페이지를 불러오지 못했어요" onRetry={() => setPage(page)} />
                        </div>
                      )}
                      <Pagination 
                        currentPage={page} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                        disabled={paginationStatus === 'loading'}
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

      <Footer />
      
      <FavoriteShareSheet
        isOpen={isShareModalOpen}
        isSharing={isSharing}
        onClose={handleCloseShare}
        onConfirm={handleConfirmShare}
      />

      <Toast 
        isVisible={isToastVisible} 
        message={toastMessage} 
        onClose={() => setIsToastVisible(false)} 
      />
    </Layout>
  );
}
