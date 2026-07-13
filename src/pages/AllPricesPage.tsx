// AllPricesPage.tsx
// 전체 시세 페이지 - "Zero-Delay" 실시간 검색 + useMemo 복합 필터링 + 초성 검색 지원

import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLayout } from '../components/common/PageLayout';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { AnimalSelect } from '../components/domain/AnimalSelect';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SearchInput } from '../components/common/SearchInput'; // 신규 추가된 검색 컴포넌트
import { PriceCard } from '../components/domain/PriceCard';
import { ListSkeleton } from '../components/common/ListSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { InlineError } from '../components/common/InlineError';
import { PriceDetailSheet } from '../components/domain/price-detail/PriceDetailSheet';
import { marketService } from '../api/services/marketService';
import type { PriceItem } from '../api/types/market';
import { matchesSearch } from '../utils/koreanSearch'; // 초성 검색 유틸리티

type AnimalType = 'BEEF' | 'PORK';
type StorageType = 'CHILLED' | 'FROZEN';
// 페이지 상태: 전체 데이터 로딩 중 / 성공 / 에러
type PageStatus = 'loading' | 'success' | 'error';

export function AllPricesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // 즐겨찾기 목록 등에서 '전체 시세에서 품목 찾기'로 넘어온 경우 쿼리 파라미터 적용
  const initialAnimal = (searchParams.get('animalType') as AnimalType) || 'BEEF';
  const initialStorage = (searchParams.get('storageType') as StorageType) || 'CHILLED';

  // ──────────────────────────────────────────────────────────────────────────
  // 📌 [State] 정의
  // State = "컴포넌트가 기억하는 값". 이 값이 바뀌면 화면이 자동으로 다시 그려집니다.
  // 마트 계산대 화면에 비유하면: 탭 선택 버튼, 검색창 값, 장바구니 목록이 각각 State입니다.
  // ──────────────────────────────────────────────────────────────────────────

  const [animalType, setAnimalType] = useState<AnimalType>(initialAnimal);     // 선택된 축종 탭
  const [storageType, setStorageType] = useState<StorageType>(initialStorage); // 선택된 보관 형태 탭
  const [searchQuery, setSearchQuery] = useState<string>('');                  // 검색창 입력값

  const [status, setStatus] = useState<PageStatus>('loading');                 // 전체 데이터 로딩 상태
  const [allItems, setAllItems] = useState<PriceItem[]>([]);                   // 서버에서 1회 로드한 전체 배열

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);   // 상세 시트에 표시할 품목 ID

  const listTopRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // 📡 [API 호출] 앱 진입 시 1회만 전체 데이터 로드 (Zero-Delay 전략의 핵심)
  // Async = "기다리는 일". 택배를 주문하고(API 요청) 받을 때까지(응답) 다른 일을 합니다.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setStatus('loading');
      try {
        // getAllItems: 서버에서 전체 배열을 딱 1번만 가져옵니다.
        // 이후 필터링은 서버를 치지 않고 메모리에서 처리합니다.
        const data = await marketService.getAllItems({ delay: 600 });
        setAllItems(data);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    fetchAll();
  }, []); // 빈 배열 = "처음 렌더링될 때 딱 1회만 실행"

  // ──────────────────────────────────────────────────────────────────────────
  // ⚡ [핵심 필터링 로직] useMemo로 AND 조건 복합 필터링 캐싱
  //
  // useMemo = "계산 결과를 기억해두는 메모". 의존성([])이 바뀔 때만 재계산합니다.
  // 비유: 식당 주방장이 메뉴판을 통째로 다시 쓰는 대신, 바뀐 부분만 수정하는 것.
  //
  // AND 조건:
  //  1. 축종 탭 (species === animalType)
  //  2. 보관 형태 탭 (storageType === storageType)
  //  3. 검색어 매칭 (searchKeywords.includes(query))
  // ──────────────────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // 조건 1: 선택된 축종과 일치하는가?
      const matchSpecies = item.species === animalType;

      // 조건 2: 선택된 보관 형태와 일치하는가?
      const matchStorage = item.storageType === storageType;

      // 조건 3: 초성 검색 포함 매칭
      // matchesSearch = 초성(ㅅㄱ→삼겹), 완성자(삼겹), 영문 혼합 모두 지원
      // 방어 코드: searchKeywords가 없어도 matchesSearch 내부에서 안전하게 처리
      const matchSearch = matchesSearch(item.searchKeywords || '', searchQuery);

      // AND: 세 조건이 모두 true여야 목록에 포함
      return matchSpecies && matchStorage && matchSearch;
    });
  }, [allItems, animalType, storageType, searchQuery]); // 이 4가지가 바뀔 때만 필터링 재계산

  // ──────────────────────────────────────────────────────────────────────────
  // 📌 [이벤트 핸들러] 탭 선택 및 아이템 클릭 처리
  // ──────────────────────────────────────────────────────────────────────────

  const handleAnimalChange = (type: AnimalType) => {
    setAnimalType(type);
    setSearchQuery(''); // 축종 탭 변경 시 검색어 초기화
    listTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStorageChange = (type: StorageType) => {
    setStorageType(type);
    setSearchQuery(''); // 보관 형태 탭 변경 시 검색어 초기화
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
  };

  const closeDetailSheet = () => {
    setSelectedItemId(null);
  };

  // 필터링 결과가 0개인지 확인 (에러/로딩이 아닌 경우에만)
  const isEmpty = status === 'success' && filteredItems.length === 0;

  return (
    <PageLayout>
      <Header title="전체 시세" />

        {/* ── 필터 영역 (탐색형 구조): 축종 탭 + 보관 형태 탭 + 검색창 ── */}
        <div className="w-full flex-shrink-0 flex flex-col pt-[var(--spacing-16)] pb-[var(--spacing-8)] gap-[var(--spacing-12)]">

          {/* 축종 선택 탭 (한우 / 한돈) */}
          <div className="flex-shrink-0 w-full">
            <AnimalSelect selectedType={animalType} onSelect={handleAnimalChange} hideHeader />
          </div>

          {/* 냉장 / 냉동 세그먼트 탭 */}
          <SegmentedControl
            options={[
              { label: '냉장', value: 'CHILLED' },
              { label: '냉동', value: 'FROZEN' },
            ]}
            selectedValue={storageType}
            onChange={(val) => handleStorageChange(val as StorageType)}
          />

          {/* 실시간 검색 입력창 - 타이핑 즉시 filteredItems 재계산 */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="품목명으로 검색 (예: 삼겹, 등심)"
          />

          {/* 검색 결과 카운터 배지 - 유저가 필터 상태를 한눈에 인지하게 돕는 UI */}
          {status === 'success' && (
            <div className="flex items-center justify-between">
              <span className="text-caption text-[var(--text-light)]">
                {searchQuery.trim()
                  ? `"${searchQuery.trim()}" 검색 결과`
                  : `전체 품목`}
              </span>
              <span
                className="text-caption font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: filteredItems.length > 0
                    ? 'rgba(59, 145, 200, 0.1)'  // --color-secondary 연한 배경
                    : 'rgba(209, 71, 52, 0.1)',   // 결과 없을 때 경고 빨강
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

        {/* ── 리스트 영역 (본문 스크롤 전담) ── */}
        <main className="w-full flex-1 flex flex-col pb-[var(--spacing-16)]">
          <div ref={listTopRef} />

          {/* 헤더 텍스트: 현재 탭 상태를 반영 */}
          <div className="flex justify-between items-end mb-[var(--spacing-16)]">
            <h3 className="text-title font-bold">
              {animalType === 'BEEF' ? '한우' : '한돈'} {storageType === 'CHILLED' ? '냉장' : '냉동'} 시세
            </h3>
            <span className="text-caption text-[var(--text-light)]">1kg 기준</span>
          </div>

          <div className="flex flex-col gap-[var(--spacing-12)]">

            {/* 전체 데이터 로딩 중 */}
            {status === 'loading' && <ListSkeleton count={5} />}

            {/* API 에러 */}
            {status === 'error' && (
              <div className="mt-8">
                <InlineError
                  message="시세 정보를 불러오지 못했습니다."
                  onRetry={() => {
                    // 재시도: 페이지를 다시 마운트하는 대신 상태만 리셋
                    setStatus('loading');
                    marketService.getAllItems({ delay: 600 })
                      .then((data) => { setAllItems(data); setStatus('success'); })
                      .catch(() => setStatus('error'));
                  }}
                />
              </div>
            )}

            {/* 필터 결과 없음 (빈 상태) */}
            {isEmpty && (
              <div className="mt-8">
                <EmptyState
                  title={searchQuery.trim() ? `"${searchQuery.trim()}"에 해당하는 품목이 없습니다.` : '조건에 맞는 시세 정보가 없습니다.'}
                  description={searchQuery.trim() ? '다른 검색어를 입력해 보세요.' : '다른 축종이나 보관 상태를 선택해 보세요.'}
                />
              </div>
            )}

            {/* 필터링된 품목 리스트 렌더링 */}
            {/* filteredItems = useMemo가 AND 조건으로 걸러낸 배열 */}
            {status === 'success' && !isEmpty && filteredItems.map((item) => (
              <PriceCard
                key={item.itemId}
                item={item}
                id={`price-card-${item.itemId}`}
                onClick={handleItemClick}
              />
            ))}

          </div>
        </main>

      {/* 상세 시트 (바텀 슬라이드 패널) */}
      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        onClose={closeDetailSheet}
      />
      <Footer activeTab="all" />
    </PageLayout>
  );
}
