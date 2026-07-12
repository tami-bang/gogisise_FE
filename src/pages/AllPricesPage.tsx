import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { AnimalSelect } from '../components/domain/AnimalSelect';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { PriceCard } from '../components/domain/PriceCard';
import { Pagination } from '../components/common/Pagination';
import { ListSkeleton } from '../components/common/ListSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { InlineError } from '../components/common/InlineError';
import { PriceDetailSheet } from '../components/domain/price-detail/PriceDetailSheet';
import { marketService } from '../api/services/marketService';
import type { PriceItem } from '../api/types/market';

type AnimalType = 'BEEF' | 'PORK';
type StorageType = 'CHILLED' | 'FROZEN';
type PageStatus = 'loading' | 'success' | 'empty' | 'error';

export function AllPricesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // 즐겨찾기 목록 등에서 '전체 시세에서 품목 찾기'로 넘어온 경우 쿼리 파라미터 적용, 없으면 기본값
  const initialAnimal = (searchParams.get('animalType') as AnimalType) || 'BEEF';
  const initialStorage = (searchParams.get('storageType') as StorageType) || 'CHILLED';

  const [animalType, setAnimalType] = useState<AnimalType>(initialAnimal);
  const [storageType, setStorageType] = useState<StorageType>(initialStorage);
  const [page, setPage] = useState(1);
  
  const [status, setStatus] = useState<PageStatus>('loading');
  const [items, setItems] = useState<PriceItem[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const listTopRef = useRef<HTMLDivElement>(null);

  const fetchPrices = async (currentPage: number) => {
    setStatus('loading');
    try {
      const response = await marketService.getPrices({
        animalType,
        storageType,
        page: currentPage,
        limit: 15,
      });

      if (response.items.length === 0) {
        setStatus('empty');
      } else {
        setItems(response.items);
        setHasNextPage(response.hasNextPage);
        setStatus('success');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchPrices(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalType, storageType, page]);

  const handleAnimalChange = (type: AnimalType) => {
    setAnimalType(type);
    setPage(1); // 필터 변경 시 1페이지로 초기화
  };

  const handleStorageChange = (type: StorageType) => {
    setStorageType(type);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
  };

  const closeDetailSheet = () => {
    setSelectedItemId(null);
  };

  return (
    <Layout>
      <Header title="전체 시세" />
      <div className="flex flex-col h-full bg-[var(--color-bg)] pt-[72px] pb-[96px]">
        {/* 필터 영역 (탐색형 구조) */}
        <div className="flex-shrink-0 flex flex-col px-[var(--spacing-20)] py-[var(--spacing-16)] gap-[var(--spacing-16)] bg-[var(--color-surface)] border-b border-[var(--color-divider)]">
          <div className="flex-shrink-0 w-full">
            <AnimalSelect selectedType={animalType} onSelect={handleAnimalChange} hideHeader />
          </div>
          <SegmentedControl
            options={[
              { label: '냉장', value: 'CHILLED' },
              { label: '냉동', value: 'FROZEN' },
            ]}
            selectedValue={storageType}
            onChange={(val) => handleStorageChange(val as StorageType)}
          />
        </div>

        {/* 리스트 영역 (본문 스크롤 전담) */}
        <main className="flex-1 min-h-0 overflow-y-auto px-[var(--spacing-20)] py-[var(--spacing-16)]">
          <div ref={listTopRef} />
          <div className="flex justify-between items-end mb-[var(--spacing-16)]">
            <h3 className="text-title font-bold">전체 품목 시세</h3>
            <span className="text-caption text-[var(--text-light)]">1kg 기준</span>
          </div>

          <div className="flex flex-col gap-[var(--spacing-12)]">
            {status === 'loading' && <ListSkeleton count={5} />}
            
            {status === 'error' && (
              <div className="mt-8">
                <InlineError message="시세 정보를 불러오지 못했습니다." onRetry={() => fetchPrices(page)} />
              </div>
            )}
            
            {status === 'empty' && (
              <div className="mt-8">
                <EmptyState title="조건에 맞는 시세 정보가 없습니다." description="다른 축종이나 보관 상태를 선택해 보세요." />
              </div>
            )}
            
            {status === 'success' && (
              <>
                {items.map((item) => (
                  <PriceCard 
                    key={item.id} 
                    item={item} 
                    id={`price-card-${item.id}`}
                    onClick={handleItemClick}
                  />
                ))}
                
                <div className="mt-[var(--spacing-24)] mb-[var(--spacing-16)]">
                  <Pagination
                    currentPage={page}
                    totalPages={page + (hasNextPage ? 1 : 0)}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        onClose={closeDetailSheet}
      />
      <Footer activeTab="all" />
    </Layout>
  );
}
