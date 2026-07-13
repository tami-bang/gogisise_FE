// marketService.ts — USER_SERVED_SPEC.md 기반으로 정렬된 서비스 레이어
// 규칙: UI 컴포넌트 내부에서 직접 fetch 호출 금지. 모든 통신은 이 파일을 통해서만 처리합니다.

import type { MarketSummary, PriceItem, MarketServiceConfig } from '../types/market';
import { mockMarketSummary, allMockPrices } from '../mock/marketMock';

const DEFAULT_DELAY = 800;

// 네트워크 지연 시뮬레이터 (실제 API 연동 전까지 사용)
const simulateNetwork = <T>(
  data: T,
  config?: MarketServiceConfig
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const delay = config?.delay ?? DEFAULT_DELAY;
    setTimeout(() => {
      if (config?.shouldFail) {
        reject(new Error('네트워크 요청에 실패했습니다.'));
        return;
      }
      resolve(data);
    }, delay);
  });
};

export const marketService = {
  // 홈 화면 요약 카드 데이터
  getMarketSummary: async (
    config?: MarketServiceConfig
  ): Promise<MarketSummary> => {
    return simulateNetwork(mockMarketSummary, config);
  },

  // ─────────────────────────────────────────────────────────────────
  // GET /api/v1/market/items (Zero-Delay 전체 배열 서빙)
  // USER_SERVED_SPEC 섹션 1.1 — 탭 필터·검색은 FE 메모리 단에서 처리
  // 서버는 페이징·검색 파라미터 없이 가공된 전체 플랫 배열을 통째로 반환합니다.
  // ─────────────────────────────────────────────────────────────────
  getAllItems: async (
    config?: MarketServiceConfig
  ): Promise<PriceItem[]> => {
    if (config?.isEmpty) {
      return simulateNetwork([], config);
    }
    // 실제 API 연동 시: GET /api/v1/market/items → response.data.items
    return simulateNetwork([...allMockPrices], config);
  },

  // ─────────────────────────────────────────────────────────────────
  // GET /api/v1/market/items/{itemId}/calculations
  // USER_SERVED_SPEC 섹션 1.2 — 카드 터치 시 산출 세부 내역 조회
  // ─────────────────────────────────────────────────────────────────
  getPriceDetail: async (
    itemId: string,
    config?: MarketServiceConfig
  ) => {
    // mockAggregatedDetails를 동적으로 불러오기 (순환참조 방지)
    const { mockAggregatedDetails } = await import('../mock/marketMock');
    const detail = mockAggregatedDetails[itemId];
    if (!detail) {
      return simulateNetwork(null, { ...config, shouldFail: true });
    }
    return simulateNetwork(detail, config);
  },

  // ─────────────────────────────────────────────────────────────────
  // 즐겨찾기 품목만 필터링 (FE 로컬 처리 — API 호출 없음)
  // USER_SERVED_SPEC 섹션 2.1: GET /api/v1/users/me/favorites
  // 실제 연동 시 이 함수를 서버 요청으로 교체합니다.
  // ─────────────────────────────────────────────────────────────────
  getFavoritePrices: async (
    favoriteIds: string[],
    config?: MarketServiceConfig
  ): Promise<PriceItem[]> => {
    if (config?.isEmpty || favoriteIds.length === 0) {
      return simulateNetwork([], config);
    }
    // allMockPrices에서 itemId 기준으로 필터링
    const data = allMockPrices.filter(i => favoriteIds.includes(i.itemId));
    return simulateNetwork(data, config);
  },

  // ─────────────────────────────────────────────────────────────────
  // 레거시 페이징 방식 (기존 코드 호환용 — 실제 API에서는 미사용)
  // Zero-Delay 전략으로 전환되어 getAllItems()로 대체됩니다.
  // ─────────────────────────────────────────────────────────────────
  getPrices: async (
    config?: MarketServiceConfig
  ): Promise<{ items: PriceItem[]; hasNextPage: boolean }> => {
    if (config?.isEmpty) {
      return simulateNetwork({ items: [], hasNextPage: false }, config);
    }

    let filtered = [...allMockPrices];

    if (config?.animalType) {
      filtered = filtered.filter(item => item.species === config.animalType);
    }
    if (config?.storageType) {
      filtered = filtered.filter(item => item.storageType === config.storageType);
    }

    const page = config?.page ?? 1;
    const limit = config?.limit ?? 15;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const slicedItems = filtered.slice(startIndex, endIndex);
    const hasNextPage = endIndex < filtered.length;

    return simulateNetwork({ items: slicedItems, hasNextPage }, config);
  },
};
