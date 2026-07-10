import type { MarketSummary, PriceItem, MarketServiceConfig } from '../types/market';
import { mockMarketSummary, mockFavoritePrices } from '../mock/marketMock';

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

  getFavoritePrices: async (
    config?: MarketServiceConfig
  ): Promise<PriceItem[]> => {
    const data = config?.isEmpty ? [] : mockFavoritePrices;
    return simulateNetwork(data, config);
  },
};
