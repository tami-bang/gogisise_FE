import { useEffect, useState } from 'react';
import type { MarketSummary, PriceItem } from '../api';
import { marketService } from '../api';
import { Layout } from '../components/common/Layout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { SummaryStats } from '../components/domain/SummaryStats';
import { FavoritePriceList } from '../components/domain/FavoritePriceList';
import { KakaoShareButton } from '../components/domain/KakaoShareButton';

export function MainPage() {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [favoritePrices, setFavoritePrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 병렬로 요약 데이터와 관심 시세 리스트 로드
        const [summaryData, pricesData] = await Promise.all([
          marketService.getMarketSummary(),
          marketService.getFavoritePrices()
        ]);
        
        setSummary(summaryData);
        setFavoritePrices(pricesData);
        setError(null);
      } catch (err) {
        setError('시세를 불러오지 못했어요');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Layout>
      <Header />
      
      {/* 
        Body 영역: Header와 Footer 사이의 공간을 차지하며 수직 스크롤 가능
        Tailwind: flex-1, overflow-y-auto, 그리고 footer를 위한 pb 확보
      */}
      <main className="flex-1 overflow-y-auto pb-[96px]">
        {loading && (
          <div className="flex justify-center items-center h-40 text-(--text-muted) text-body-lg">
            오늘 시세를 불러오고 있어요...
          </div>
        )}

        {error && (
          <div className="flex flex-col justify-center items-center h-40 gap-4">
            <span className="text-4xl" aria-hidden="true">⚠️</span>
            <p className="text-(--color-error) text-body-lg font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-(--color-surface-soft) px-6 py-3 rounded-[var(--radius-md)] text-body font-bold text-(--text-strong) active:scale-[0.98] transition-transform"
            >
              다시 불러오기
            </button>
          </div>
        )}

        {!loading && !error && summary && (
          <>
            <SummaryStats summary={summary} />
            
            <section className="px-5 pb-6">
              <FavoritePriceList items={favoritePrices} />
            </section>
            
            <KakaoShareButton summary={summary} items={favoritePrices} />
          </>
        )}
      </main>

      <Footer />
    </Layout>
  );
}
