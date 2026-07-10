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

    if (config?.storageType) {
      filtered = filtered.filter(item => item.storageType === config.storageType);
    }

    const page = config?.page ?? 1;
    const limit = config?.limit ?? 20;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const slicedItems = filtered.slice(startIndex, endIndex);
    const hasNextPage = endIndex < filtered.length;

    return simulateNetwork({ items: slicedItems, hasNextPage }, config);
  },

  // 즐겨찾기(관심부위) 조회용: isFavorite === true 인 항목만 반환 (페이징 없이)
  getFavoritePrices: async (
    config?: MarketServiceConfig
  ): Promise<PriceItem[]> => {
    const data = config?.isEmpty ? [] : allMockPrices.filter(i => i.isFavorite);
    return simulateNetwork(data, config);
  },
};
