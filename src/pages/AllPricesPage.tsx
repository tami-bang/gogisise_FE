import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLayout } from '../components/common/PageLayout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { AnimalSelect } from '../components/domain/AnimalSelect';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SearchInput } from '../components/common/SearchInput';
import { PriceCard } from '../components/domain/PriceCard';
import { ListSkeleton } from '../components/common/ListSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { InlineError } from '../components/common/InlineError';
import { PriceDetailSheet } from '../components/domain/price-detail/PriceDetailSheet';
import { useMarketItems } from '../hooks/useMarketItems';
import { matchesSearch } from '../utils/koreanSearch';

type AnimalType = 'BEEF' | 'PORK';
type StorageType = 'CHILLED' | 'FROZEN';

export function AllPricesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const initialAnimal = (searchParams.get('animalType') as AnimalType) || 'BEEF';
  const initialStorage = (searchParams.get('storageType') as StorageType) || 'CHILLED';

  const [animalType, setAnimalType] = useState<AnimalType>(initialAnimal);
  const [storageType, setStorageType] = useState<StorageType>(initialStorage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { status, items: allItems, refetch } = useMarketItems();
  const listTopRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      return (
        item.species === animalType &&
        item.storageType === storageType &&
        matchesSearch(item.searchKeywords || '', searchQuery)
      );
    });
  }, [allItems, animalType, storageType, searchQuery]);

  const handleAnimalChange = (type: AnimalType) => {
    setAnimalType(type);
    setSearchQuery('');
    listTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStorageChange = (type: StorageType) => {
    setStorageType(type);
    setSearchQuery('');
  };

  const isApiEmpty = status === 'empty';
  const isFilterEmpty = status === 'success' && filteredItems.length === 0;

  return (
    <PageLayout>
      <Header title="전체 시세" />

      <div className="w-full flex-shrink-0 flex flex-col pt-[var(--spacing-16)] pb-[var(--spacing-8)] gap-[var(--spacing-12)]">
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

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="품목명으로 검색 (예: 삼겹, 안심)"
        />

        {status === 'success' && (
          <div className="flex items-center justify-between">
            <span className="text-caption text-[var(--text-light)]">
              {searchQuery.trim() ? `"${searchQuery.trim()}" 검색 결과` : '전체 품목'}
            </span>
            <span
              className="text-caption font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: filteredItems.length > 0
                  ? 'rgba(59, 145, 200, 0.1)'
                  : 'rgba(209, 71, 52, 0.1)',
                color: filteredItems.length > 0
                  ? 'var(--color-secondary)'
                  : 'var(--color-text-red)',
              }}
            >
              {filteredItems.length}건
            </span>
          </div>
        )}
      </div>

      <main className="w-full flex-1 flex flex-col pb-[var(--spacing-16)]">
        <div ref={listTopRef} />

        <div className="flex justify-between items-end mb-[var(--spacing-16)]">
          <h3 className="text-title font-bold">
            {animalType === 'BEEF' ? '소고기' : '돼지고기'} {storageType === 'CHILLED' ? '냉장' : '냉동'} 시세
          </h3>
          <span className="text-caption text-[var(--text-light)]">1kg 기준</span>
        </div>

        <div className="flex flex-col gap-[var(--spacing-12)]">
          {status === 'loading' && <ListSkeleton count={5} />}

          {status === 'error' && (
            <div className="mt-8">
              <InlineError
                message="시세 정보를 불러오지 못했습니다."
                onRetry={refetch}
              />
            </div>
          )}

          {isApiEmpty && (
            <div className="mt-8">
              <EmptyState
                title="시세 데이터가 아직 제공되지 않습니다."
                description="잠시 후 다시 확인해 주세요."
              />
            </div>
          )}

          {isFilterEmpty && (
            <div className="mt-8">
              <EmptyState
                title={searchQuery.trim() ? `"${searchQuery.trim()}"에 해당하는 품목이 없습니다.` : '조건에 맞는 시세 정보가 없습니다.'}
                description={searchQuery.trim() ? '다른 검색어를 입력해 보세요.' : '다른 축종이나 보관 상태를 선택해 보세요.'}
              />
            </div>
          )}

          {status === 'success' && filteredItems.length > 0 && filteredItems.map((item) => (
            <PriceCard
              key={item.itemId}
              item={item}
              id={`price-card-${item.itemId}`}
              onClick={setSelectedItemId}
            />
          ))}
        </div>
      </main>

      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
      <Footer activeTab="all" />
    </PageLayout>
  );
}
