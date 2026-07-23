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
// 💡 [한글 주석] 상세 시세 미리 가져오기(Prefetch)를 위한 훅 헬퍼 임포트
import { prefetchPriceDetail } from '../hooks/usePriceDetail';

type AnimalType = 'BEEF' | 'PORK';
type StorageType = 'CHILLED' | 'FROZEN';

interface CategoryNode {
  ctgNo: string;
  name: string;
  parentNo: string | null;
  depth: number;
  path: string;
}

// 📌 한국어 주석: 사용자가 지정한 136개 카테고리 마스터 딕셔너리
const CATEGORY_MASTER = {
  HANWOO_CHILLED: ["안심", "등심", "윗등심", "채끝", "아랫등심", "목심", "앞다리살(앞다리+꾸리)", "앞다리살", "꾸리살", "부채살", "우둔(홍두깨포함)", "우둔살", "홍두깨", "설도(삼각살 X)", "설도", "설깃", "양지머리,치마양지", "양지머리외", "삼각살", "차돌양지", "치마살", "차돌박이(냉장)", "업진살", "앞치마살,업진안살", "앞치마살", "업진안살", "사태", "갈비", "갈비살", "안창살", "갈비본살+갈비살치", "토시살", "토시,제비추리", "늑간살", "제비추리", "안창외2종"],
  HANWOO_FROZEN: ["차돌박이", "우족", "사골", "꼬리반골", "알꼬리", "잡뼈", "냉동설깃", "냉동우둔", "잡육", "도가니", "스지", "냉동목심", "냉동앞다리", "냉동설도", "냉동양지머리외", "냉동양지머리, 치마양지", "냉동사태", "냉동갈비"],
  HANDON_CHILLED: ["더좋은삼겹", "더좋은삼겹(암)", "더좋은미박삼겹", "더좋은미박삼겹(암)", "두판삼겹", "A원삼겹", "삼겹", "삼겹(암)", "미박삼겹", "미박삼겹(암)", "목심", "미박목심", "목심(암)", "앞다리", "미박앞다리", "앞다리(암)", "미박앞다리(암)", "뒷다리", "미박뒷다리", "등심", "지방등심", "mm등심", "안심", "안심S", "갈비", "등갈비", "항정", "등심덧살", "갈매기", "삼겹(수육용)", "미박삼겹(수육용)", "목심(수육용)", "삼겹미추리", "미박앞사태", "미박뒷사태", "사태", "미박사태", "미사태", "미박삼겹(흑)", "미박목심(흑)", "미박앞다리(흑)", "등심(흑)", "안심(흑)", "미박뒷다리(흑)", "항정(흑)", "등심덧살(흑)", "갈매기(흑)"],
  HANDON_FROZEN: ["냉동롤삼겹(꽃삼겹)", "냉동삼겹", "냉동미박삼겹", "냉동목심", "냉동뒷다리", "냉동목심(수육용)", "냉동앞다리", "냉동미박앞다리", "냉동미박뒷다리", "냉동등심", "냉동안심", "냉동갈비", "냉동등갈비", "냉동항정", "냉동갈매기", "냉동등심덧살", "냉동잡육A", "냉동등뼈", "냉동돈피", "냉동앞장족", "냉동뒷장족", "냉동미박사태", "냉동미박앞사태", "냉동미박뒷사태", "냉동앞미니족", "냉동뒷미니족", "냉동사태", "냉동꼬리살", "냉동뒷고기", "냉동두항정", "냉동볼살+혀밑살", "냉동덜미살", "냉동막창", "전지연골", "냉동돈두롤"]
};

export function AllPricesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const initialAnimal = (searchParams.get('animalType') as AnimalType) || 'BEEF';
  const initialStorage = (searchParams.get('storageType') as StorageType) || 'CHILLED';

  const [animalType, setAnimalType] = useState<AnimalType>(initialAnimal);
  const [storageType, setStorageType] = useState<StorageType>(initialStorage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 카테고리 트리 상태 (SWR 캐싱 적용)
  // 💡 [한글 주석] 카테고리 트리 데이터 캐시 수명 30분 적용을 위한 키 및 시간 설정
  const CATEGORY_CACHE_KEY = 'gogisise:cache:category_tree';
  const CATEGORY_CACHE_TIME_KEY = 'gogisise:cache:category_tree_time';
  const CATEGORY_CACHE_TTL = 30 * 60 * 1000; // 30분

  const [categories, setCategories] = useState<CategoryNode[]>(() => {
    try {
      const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem(CATEGORY_CACHE_KEY);
    } catch {
      return true;
    }
  });

  const [error, setError] = useState<boolean>(false);

  const listTopRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 카테고리 로드
  // 💡 [한글 주석] force 매개변수가 false이고 캐시가 아직 유효(30분 이내)하다면 API 호출을 건너뜁니다.
  const fetchCategoryTree = async (force = false) => {
    try {
      const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
      const cachedTime = localStorage.getItem(CATEGORY_CACHE_TIME_KEY);
      
      if (!force && cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);
        if (age < CATEGORY_CACHE_TTL) {
          // 캐시가 아직 30분 지나지 않았으므로 로드 생략
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to check category cache age', e);
    }

    setLoading(() => {
      try {
        return !localStorage.getItem(CATEGORY_CACHE_KEY);
      } catch {
        return true;
      }
    });
    setError(false);
    try {
      const data = await marketService.getCategoryTree({ depth: 4 });
      setCategories(data);
      try {
        localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CATEGORY_CACHE_TIME_KEY, Date.now().toString());
      } catch (e) {
        console.warn('Failed to cache category tree', e);
      }
    } catch (e) {
      console.error('Failed to fetch category tree:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTree(false); // 마운트 시에는 캐시된 데이터를 우선 활용하도록 force=false
  }, []);

  // 📌 한국어 주석: 현재 선택된 축종/보관상태 탭에 따른 마스터 부위 배열을 확보합니다.
  const targetMasterList = useMemo(() => {
    if (animalType === 'BEEF' && storageType === 'CHILLED') return CATEGORY_MASTER.HANWOO_CHILLED;
    if (animalType === 'BEEF' && storageType === 'FROZEN') return CATEGORY_MASTER.HANWOO_FROZEN;
    if (animalType === 'PORK' && storageType === 'CHILLED') return CATEGORY_MASTER.HANDON_CHILLED;
    return CATEGORY_MASTER.HANDON_FROZEN;
  }, [animalType, storageType]);

  // 대분류/보관상태 및 검색어 기반 필터링
  const filteredCategories = useMemo(() => {
    // 1. 현재 대분류(한우 암소 / 돈육)에 매칭되는 API 노드들만 일차적으로 분류합니다.
    const apiFiltered = categories.filter((node) => {
      const path = node.path || '';
      const isBeef = path.includes('한우') && path.includes('암소');
      const isPork = path.includes('돈육');
      return animalType === 'BEEF' ? isBeef : isPork;
    });

    // 2. 마스터 딕셔너리에 명시된 136개 표준 순서를 기준으로 카드 목록을 조립합니다.
    // 한국어 주석: 매물이 0개인 것도 UI 뼈대를 그려내기 위해 매핑 처리를 가합니다.
    return targetMasterList
      .map((name) => {
        // API 노드 중 해당 이름과 매칭되는 노드를 탐색합니다.
        const matchedNode = apiFiltered.find((n) => n.name.trim() === name.trim());
        
        // 📌 한국어 주석: 백엔드가 데이터 분석을 위해 매칭하는 표준 화살표( > ) 형태의 categoryPath 규격으로 결합 경로를 일괄 통일합니다.
        const speciesPrefix = animalType === 'BEEF' ? '국내산 한우 > 국내산 한우 암소' : '국내산 돈육';
        const storagePrefix = storageType === 'CHILLED' ? '냉장' : '냉동';
        // 상세 조회는 공급처/브랜드 노드가 아니라 축종·보관상태·부위로만 식별합니다.
        // 같은 부위의 활성 매물을 모든 공급처에서 조회해야 하므로 카테고리 트리에서
        // 우연히 먼저 발견한 상위 노드를 경로에 포함하지 않습니다.
        const path = `${speciesPrefix} > ${storagePrefix} > ${name}`;
        
        let ctgNo = `virtual-${name}`;
        if (matchedNode) {
          ctgNo = matchedNode.ctgNo;
        }

        const displayName = name;

        return {
          ctgNo,
          name,
          displayName,
          path,
          hasApiData: !!matchedNode,
        };
      })
      .filter((item) => {
        // 3. 자음/모음 검색 지원
        return matchesSearch(item.displayName, searchQuery);
      });
  }, [categories, animalType, storageType, targetMasterList, searchQuery]);

  // 💡 [한글 주석] 사용자가 클릭하기 전 미리 5개 주요 부위의 데이터를 400ms 단위의 순차적(Sequential)인 시간차를 두고 선제적으로 로드하여
  // 서버 부하를 최소화하면서도 0초 진입 체감 속도를 확보합니다.
  useEffect(() => {
    if (!loading && filteredCategories.length > 0) {
      const activeTargets = filteredCategories.filter((c) => c.hasApiData).slice(0, 5);
      activeTargets.forEach((node, index) => {
        setTimeout(() => {
          prefetchPriceDetail(`path:${node.path}`);
        }, index * 400);
      });
    }
  }, [loading, filteredCategories]);

  const handleAnimalChange = (type: AnimalType) => {
    setAnimalType(type);
    setSearchQuery('');
  };

  const handleStorageChange = (type: StorageType) => {
    setStorageType(type);
    setSearchQuery('');
  };

  const isApiEmpty = !loading && categories.length === 0;
  const isFilterEmpty = !loading && categories.length > 0 && filteredCategories.length === 0;

  return (
    <PageLayout disableScroll>
      <Header title="전체 시세" />

      {/* 📌 스크롤바가 우측 가장자리 끝에 딱 붙되, 고정 헤더 아래(72px)부터 시작하고 푸터 위에서 끝나도록 내부 스크롤 영역 지정 */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex flex-col overflow-y-auto [scrollbar-gutter:stable] px-5 -mx-5 min-h-0"
      >
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

            {!loading && filteredCategories.length > 0 && filteredCategories.map((node) => {
              const hasData = node.hasApiData;
              const targetPath = `path:${node.path}`;
              return (
                <button
                  key={node.ctgNo}
                  disabled={!hasData}
                  onClick={() => hasData && setSelectedItemId(targetPath)}
                  onMouseEnter={() => hasData && prefetchPriceDetail(targetPath)} // 💡 [한글 주석] 마우스 호버 시 상세 데이터 미리 호출
                  onTouchStart={() => hasData && prefetchPriceDetail(targetPath)}  // 💡 [한글 주석] 터치 시 상세 데이터 즉시 미리 호출
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
      </div>

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

      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
      <Footer activeTab="all" />
    </PageLayout>
  );
}
