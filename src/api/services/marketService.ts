import type { MarketSummary, PriceItem, MarketServiceConfig } from '../types/market';
import { mockMarketSummary, allMockPrices } from '../mock/marketMock';

const DEFAULT_DELAY = 800;

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
  getMarketSummary: async (
    config?: MarketServiceConfig
  ): Promise<MarketSummary> => {
    return simulateNetwork(mockMarketSummary, config);
  },

  // 메인 페이지: 조건에 맞는 리스트를 페이징 처리하여 반환
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
    const limit = config?.limit ?? 15; // 기본값을 15로 수정

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const slicedItems = filtered.slice(startIndex, endIndex);
    const hasNextPage = endIndex < filtered.length;

    return simulateNetwork({ items: slicedItems, hasNextPage }, config);
  },

  // 즐겨찾기(관심부위) 조회용
  getFavoritePrices: async (
    favoriteIds: string[],
    config?: MarketServiceConfig
  ): Promise<PriceItem[]> => {
    if (config?.isEmpty || favoriteIds.length === 0) {
      return simulateNetwork([], config);
    }
    const data = allMockPrices.filter(i => favoriteIds.includes(i.id));
    return simulateNetwork(data, config);
  },

  // 시세 상세 조회
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
};
