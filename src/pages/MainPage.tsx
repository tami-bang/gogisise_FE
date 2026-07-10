import { useEffect, useState, useRef, useCallback } from 'react';
import type { MarketSummary, PriceItem } from '../api';
import { marketService } from '../api';
import { Layout } from '../components/common/Layout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { SummaryStats } from '../components/domain/SummaryStats';
import { FavoritePriceList } from '../components/domain/FavoritePriceList';
import { KakaoShareButton } from '../components/domain/KakaoShareButton';
import { Button } from '../components/common/Button';

export function MainPage() {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  
  const [storageType, setStorageType] = useState<'CHILLED' | 'FROZEN'>('CHILLED');
  const [items, setItems] = useState<PriceItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<HTMLDivElement>(null);

  // 초기 요약 데이터 로딩
  useEffect(() => {
    async function loadSummary() {
      try {
        const summaryData = await marketService.getMarketSummary();
        setSummary(summaryData);
      } catch (err) {
        console.error('Summary load error:', err);
      }
    }
    loadSummary();
  }, []);

  // 탭 변경 또는 페이지 변경 시 리스트 데이터 페칭
  useEffect(() => {
    async function fetchList() {
      try {
        if (page === 1) setLoading(true);
        else setFetchingMore(true);

        const response = await marketService.getPrices({
          storageType,
          page,
          limit: 20
        });

        if (page === 1) {
          setItems(response.items);
        } else {
          setItems(prev => [...prev, ...response.items]);
        }
        setHasNextPage(response.hasNextPage);
        setError(null);
      } catch (err) {
        setError('시세를 불러오지 못했어요');
        console.error(err);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    }

    fetchList();
  }, [storageType, page]);

  // 무한 스크롤 옵저버
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage && !loading && !fetchingMore) {
      setPage(prev => prev + 1);
    }
  }, [hasNextPage, loading, fetchingMore]);

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);
    
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver]);

  const handleTabChange = (type: 'CHILLED' | 'FROZEN') => {
    if (storageType === type) return;
    setStorageType(type);
    setPage(1);
    setItems([]);
    setHasNextPage(true);
  };

  return (
    <Layout>
      <Header />
      <main className="flex-1 overflow-y-auto pb-[96px]">
        {!summary && loading && (
          <div className="flex justify-center items-center h-40 text-[var(--text-muted)] text-body-lg">
            오늘 시세를 불러오고 있어요...
          </div>
        )}

        {error && items.length === 0 && (
          <div className="flex flex-col justify-center items-center h-40 gap-4">
            <span className="text-4xl" aria-hidden="true">⚠️</span>
            <p className="text-[var(--color-error)] text-body-lg font-bold">{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>다시 불러오기</Button>
          </div>
        )}

        {summary && (
          <>
            <SummaryStats summary={summary} />
            
            <section className="px-5 pb-6">
              {/* 카테고리 탭 UI */}
              <div className="flex bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-1 mb-6">
                <button
                  className={`flex-1 py-3 text-label rounded-[var(--radius-md)] transition-colors ${
                    storageType === 'CHILLED' 
                      ? 'bg-[var(--color-surface)] text-[var(--color-primary)] font-bold shadow-soft' 
                      : 'text-[var(--text-muted)]'
                  }`}
                  onClick={() => handleTabChange('CHILLED')}
                >
                  🧊 냉장 (CHILLED)
                </button>
                <button
                  className={`flex-1 py-3 text-label rounded-[var(--radius-md)] transition-colors ${
                    storageType === 'FROZEN' 
                      ? 'bg-[var(--color-surface)] text-[var(--color-primary)] font-bold shadow-soft' 
                      : 'text-[var(--text-muted)]'
                  }`}
                  onClick={() => handleTabChange('FROZEN')}
                >
                  ❄️ 냉동 (FROZEN)
                </button>
              </div>

              {page === 1 && loading ? (
                <div className="flex justify-center py-12 text-[var(--text-muted)] text-body">
                  시세 데이터를 불러오는 중입니다...
                </div>
              ) : (
                <FavoritePriceList items={items} />
              )}
              
              {/* 무한 스크롤 트리거 */}
              <div ref={observerRef} className="h-4" />
              {fetchingMore && (
                <div className="flex justify-center py-4 text-[var(--text-muted)] text-caption">
                  다음 목록을 불러오는 중입니다...
                </div>
              )}
            </section>
            
            <KakaoShareButton summary={summary} items={items} />
          </>
        )}
      </main>
      <Footer />
    </Layout>
  );
}
