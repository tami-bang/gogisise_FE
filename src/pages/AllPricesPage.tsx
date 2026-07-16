import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLayout } from '../components/common/PageLayout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { AnimalSelect } from '../components/domain/AnimalSelect';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SearchInput } from '../components/common/SearchInput';
import { ListSkeleton } from '../components/common/ListSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { InlineError } from '../components/common/InlineError';
import { PriceDetailSheet } from '../components/domain/price-detail/PriceDetailSheet';
import { marketService } from '../api/services/marketService';
import { matchesSearch } from '../utils/koreanSearch';

type AnimalType = 'BEEF' | 'PORK';
type StorageType = 'CHILLED' | 'FROZEN';

interface CategoryNode {
  ctgNo: string;
  name: string;
  parentNo: string | null;
  depth: number;
  path: string;
}

export function AllPricesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const initialAnimal = (searchParams.get('animalType') as AnimalType) || 'BEEF';
  const initialStorage = (searchParams.get('storageType') as StorageType) || 'CHILLED';

  const [animalType, setAnimalType] = useState<AnimalType>(initialAnimal);
  const [storageType, setStorageType] = useState<StorageType>(initialStorage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 카테고리 트리 상태
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const listTopRef = useRef<HTMLDivElement>(null);

  // 카테고리 로드
  const fetchCategoryTree = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await marketService.getCategoryTree({ depth: 4 });
      setCategories(data);
    } catch (e) {
      console.error('Failed to fetch category tree:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTree();
  }, []);

  // 대분류/보관상태 및 검색어 기반 필터링
  const filteredCategories = useMemo(() => {
    const speciesPrefix = animalType === 'BEEF' ? '국내산 한우' : '국내산 돈육';
    const storagePrefix = storageType === 'CHILLED' ? '냉장' : '냉동';

    return categories
      .filter((node) => {
        // 1. 해당 대분류 및 보관상태 매칭
        const matchesSpecies = node.path.startsWith(speciesPrefix);
        const matchesStorage = node.path.includes(`> ${storagePrefix} >`);
        return matchesSpecies && matchesStorage;
      })
      .map((node) => {
        // 2. 표시용 명칭 가공 (한우 암소일 경우 "(암소)" 꼬리표 부착)
        let displayName = node.name;
        if (node.path.includes('국내산 한우 암소')) {
          displayName = `${node.name} (암소)`;
        }
        return {
          ...node,
          displayName,
        };
      })
      .filter((item) => {
        // 3. 자음/모음 검색 지원
        return matchesSearch(item.displayName, searchQuery);
      });
  }, [categories, animalType, storageType, searchQuery]);

  const handleAnimalChange = (type: AnimalType) => {
    setAnimalType(type);
    setSearchQuery('');
    listTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStorageChange = (type: StorageType) => {
    setStorageType(type);
    setSearchQuery('');
  };

  const isApiEmpty = !loading && categories.length === 0;
  const isFilterEmpty = !loading && categories.length > 0 && filteredCategories.length === 0;

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
          placeholder="부위명으로 검색 (예: 삼겹, 안심)"
        />

        {!loading && !error && (
          <div className="flex items-center justify-between">
            <span className="text-caption text-[var(--text-light)]">
              {searchQuery.trim() ? `"${searchQuery.trim()}" 검색 결과` : '부위 선택'}
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

      <main className="w-full flex-1 flex flex-col pb-[var(--spacing-16)]">
        <div ref={listTopRef} />

        <div className="flex justify-between items-end mb-[var(--spacing-16)]">
          <h3 className="text-title font-bold">
            {animalType === 'BEEF' ? '한우' : '한돈'} {storageType === 'CHILLED' ? '냉장' : '냉동'} 부위 목록
          </h3>
          <span className="text-caption text-[var(--text-light)]">1kg 기준 시세</span>
        </div>

        <div className="flex flex-col gap-[var(--spacing-12)]">
          {loading && <ListSkeleton count={6} />}

          {error && (
            <div className="mt-8">
              <InlineError
                message="카테고리 정보를 불러오지 못했습니다."
                onRetry={fetchCategoryTree}
              />
            </div>
          )}

          {isApiEmpty && (
            <div className="mt-8">
              <EmptyState
                title="카테고리 데이터가 없습니다."
                description="크롤러 구동 후 다시 시도해 주세요."
              />
            </div>
          )}

          {isFilterEmpty && (
            <div className="mt-8">
              <EmptyState
                title={searchQuery.trim() ? `"${searchQuery.trim()}"에 해당하는 부위가 없습니다.` : '해당 조건의 부위가 존재하지 않습니다.'}
                description={searchQuery.trim() ? '다른 부위를 입력해 보세요.' : '축종이나 보관 상태를 변경해 보세요.'}
              />
            </div>
          )}

          {!loading && filteredCategories.length > 0 && filteredCategories.map((node) => (
            <button
              key={node.ctgNo}
              onClick={() => setSelectedItemId(`path:${node.path}`)}
              className="w-full text-left bg-[var(--color-surface)] p-[var(--spacing-20)] rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft active:scale-[0.98] active:bg-[rgba(59,145,200,0.05)] transition-all duration-200 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <div className="flex flex-col gap-1">
                <span className="text-body-lg text-[var(--text-strong)] font-bold">{node.displayName}</span>
                <span className="text-caption text-[var(--text-light)]">{node.path.split(' > ').slice(0, 2).join(' > ')}</span>
              </div>
              <div className="flex items-center gap-1 text-caption text-[var(--color-secondary)] font-bold">
                시세 보기 &rarr;
              </div>
            </button>
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
