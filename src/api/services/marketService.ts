import { apiClient } from '../apiClient';
import type {
  AggregatedPriceDetail,
  MarketItemsResponse,
  MarketSummary,
  PriceHistory,
  PriceItem,
  SourcePriceRecord,
  TrendStatus,
} from '../types/market';
import type { ApiRequestOptions } from '../types/common';

const MARKET_PATH = '/api/v1/market';

export interface MarketServiceRequestOptions {
  accessToken?: string | null;
  signal?: AbortSignal;
}

type MarketItemsPayload = MarketItemsResponse | PriceItem[];

const normalizeTrendStatus = (value: unknown): TrendStatus | null => {
  return value === 'UP' || value === 'DOWN' || value === 'UNCHANGED' ? value : null;
};

const normalizeSourceRecord = (record: SourcePriceRecord, index: number): SourcePriceRecord => ({
  ...record,
  id: record.id || `${record.sourceName || 'source'}-${record.rawProductName || index}-${index}`,
  sourceName: record.sourceName || '-',
  rawProductName: record.rawProductName || '',
  price: typeof record.price === 'number' ? record.price : 0,
  collectedAt: record.collectedAt || new Date().toISOString(),
  includedInAverage: Boolean(record.includedInAverage),
});

const normalizePriceItem = (item: PriceItem): PriceItem => ({
  ...item,
  searchKeywords: item.searchKeywords ?? '',
  price: item.price ?? null,
  previousPrice: item.previousPrice ?? null,
  changeAmount: item.changeAmount ?? null,
  trendStatus: normalizeTrendStatus(item.trendStatus),
  currency: item.currency ?? 'KRW',
  priceUnit: item.priceUnit ?? 'KRW_PER_KG',
  isFavorite: item.isFavorite ?? false,
});

const normalizeMarketItemsResponse = (payload: MarketItemsPayload): MarketItemsResponse => {
  if (Array.isArray(payload)) {
    return {
      dataStatus: 'CURRENT',
      marketDate: new Date().toISOString().slice(0, 10),
      items: payload.map(normalizePriceItem),
    };
  }

  return {
    dataStatus: payload.dataStatus ?? 'CURRENT',
    marketDate: payload.marketDate ?? new Date().toISOString().slice(0, 10),
    items: Array.isArray(payload.items) ? payload.items.map(normalizePriceItem) : [],
  };
};

const normalizePriceDetail = (detail: AggregatedPriceDetail): AggregatedPriceDetail => ({
  ...detail,
  averagePrice: detail.averagePrice ?? 0,
  changeAmount: detail.changeAmount ?? null,
  trendStatus: normalizeTrendStatus(detail.trendStatus) ?? 'UNCHANGED',
  highestPrice: detail.highestPrice ?? 0,
  lowestPrice: detail.lowestPrice ?? 0,
  participantCount: detail.participantCount ?? 0,
  sourceRecords: Array.isArray(detail.sourceRecords)
    ? detail.sourceRecords.map(normalizeSourceRecord)
    : [],
  animalType: detail.animalType ?? 'BEEF',
  storageType: detail.storageType ?? 'CHILLED',
  unit: detail.unit ?? '1kg',
});

const toApiOptions = (options?: MarketServiceRequestOptions): ApiRequestOptions => ({
  accessToken: options?.accessToken,
  signal: options?.signal,
});

const sumChanges = (items: PriceItem[], species: 'BEEF' | 'PORK') => {
  return items
    .filter((item) => item.species === species && typeof item.changeAmount === 'number')
    .reduce((sum, item) => sum + (item.changeAmount ?? 0), 0);
};

const toTrendStatus = (value: number): TrendStatus => {
  if (value > 0) return 'UP';
  if (value < 0) return 'DOWN';
  return 'UNCHANGED';
};

const buildMarketSummary = (items: PriceItem[]): MarketSummary => {
  const beefValue = sumChanges(items, 'BEEF');
  const porkValue = sumChanges(items, 'PORK');
  const totalValue = beefValue + porkValue;
  const trendStatus = toTrendStatus(totalValue);

  return {
    trendStatus,
    trendMessage: trendStatus === 'UP' ? '상승세' : trendStatus === 'DOWN' ? '하락세' : '변동 없음',
    beefSummary: { value: beefValue, status: toTrendStatus(beefValue) },
    porkSummary: { value: porkValue, status: toTrendStatus(porkValue) },
  };
};

export const marketService = {
  getMarketItemsResponse: async (
    options?: MarketServiceRequestOptions
  ): Promise<MarketItemsResponse> => {
    const payload = await apiClient.get<MarketItemsPayload>(
      `${MARKET_PATH}/items`,
      toApiOptions(options)
    );
    return normalizeMarketItemsResponse(payload);
  },

  getAllItems: async (
    options?: MarketServiceRequestOptions
  ): Promise<PriceItem[]> => {
    const response = await marketService.getMarketItemsResponse(options);
    return response.items;
  },

  getMarketSummary: async (
    options?: MarketServiceRequestOptions
  ): Promise<MarketSummary> => {
    const items = await marketService.getAllItems(options);
    return buildMarketSummary(items);
  },

  getPriceDetail: async (
    itemId: string,
    options?: MarketServiceRequestOptions
  ): Promise<AggregatedPriceDetail> => {
    const detail = await apiClient.get<AggregatedPriceDetail>(
      `${MARKET_PATH}/items/${encodeURIComponent(itemId)}/calculations`,
      toApiOptions(options)
    );
    return normalizePriceDetail(detail);
  },

  getPriceHistory: async (
    itemId: string,
    options?: MarketServiceRequestOptions
  ): Promise<PriceHistory> => {
    return apiClient.get<PriceHistory>(
      `${MARKET_PATH}/items/${encodeURIComponent(itemId)}/price-history`,
      toApiOptions(options)
    );
  },

  getFavoritePrices: async (
    favoriteIds: string[],
    options?: MarketServiceRequestOptions
  ): Promise<PriceItem[]> => {
    if (favoriteIds.length === 0) {
      return [];
    }

    const items = await marketService.getAllItems(options);
    return favoriteIds
      .map((id) => items.find((item) => item.itemId === id))
      .filter((item): item is PriceItem => Boolean(item));
  },

  getPrices: async (
    options?: MarketServiceRequestOptions & {
      page?: number;
      limit?: number;
      storageType?: 'CHILLED' | 'FROZEN';
      animalType?: 'BEEF' | 'PORK';
    }
  ): Promise<{ items: PriceItem[]; hasNextPage: boolean }> => {
    let filtered = await marketService.getAllItems(options);

    if (options?.animalType) {
      filtered = filtered.filter((item) => item.species === options.animalType);
    }
    if (options?.storageType) {
      filtered = filtered.filter((item) => item.storageType === options.storageType);
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 15;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      items: filtered.slice(startIndex, endIndex),
      hasNextPage: endIndex < filtered.length,
    };
  },
};
