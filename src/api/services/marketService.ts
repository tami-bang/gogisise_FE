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
  ageMonths: item.ageMonths ?? null,
  weightKg: item.weightKg ?? null,
  salePrice: item.salePrice ?? null,
  manufacturedAt: item.manufacturedAt ?? null,
  expiresAt: item.expiresAt ?? null,
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
  lastCollectedAt: detail.lastCollectedAt ?? null,
  sourceRecords: Array.isArray(detail.sourceRecords)
    ? detail.sourceRecords.map(normalizeSourceRecord)
    : [],
  sourceItems: Array.isArray(detail.sourceItems)
    ? detail.sourceItems.map((item) => ({
        ...item,
        ageInMonths: item.ageInMonths ?? null,
        weightKg: item.weightKg ?? null,
        salePrice: item.salePrice ?? null,
        manufacturedAt: item.manufacturedAt ?? null,
        expiresAt: item.expiresAt ?? null,
      }))
    : [],
  animalType: detail.animalType ?? 'BEEF',
  storageType: detail.storageType ?? 'CHILLED',
  unit: detail.unit ?? '1kg',
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * apiClient가 성공 래퍼를 중앙에서 제거하지만, 배포 버전 차이로 상세 응답이
 * `{ data: detail }` 또는 `{ data: { items: [...] } }` 형태로 한 번 더 감싸져도
 * 실제 상세 객체와 매물 배열을 잃지 않도록 서비스 경계에서 최종 정규화합니다.
 */
const normalizePriceDetailPayload = (payload: unknown): AggregatedPriceDetail => {
  let detailPayload = payload;

  while (isRecord(detailPayload) && 'data' in detailPayload && isRecord(detailPayload.data)) {
    detailPayload = detailPayload.data;
  }

  const detail = detailPayload as AggregatedPriceDetail & { items?: AggregatedPriceDetail['sourceItems'] };
  return normalizePriceDetail({
    ...detail,
    sourceItems: Array.isArray(detail.sourceItems)
      ? detail.sourceItems
      : Array.isArray(detail.items)
        ? detail.items
        : [],
  });
};

const toApiOptions = (options?: MarketServiceRequestOptions): ApiRequestOptions => ({
  accessToken: options?.accessToken,
  // signal: options?.signal, // AbortError 원천 차단을 위해 signal 연결 해제
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

const MOCK_ITEMS: PriceItem[] = [
  {
    itemId: 'beef-tenderloin-1pp-chilled',
    priceId: 'price-mock-001',
    species: 'BEEF',
    storageType: 'CHILLED',
    category: '안심',
    displayName: '안심 1++',
    searchKeywords: '안심 ㅇㅅ 안심1++ 한우암소안심 ㅇㅅ1++ ㅇㅅ1pp ㅇㅅ1PP 안심1pp 안심1PP',
    grade: '1++',
    price: 38000,
    previousPrice: 36800,
    changeAmount: 1200,
    trendStatus: 'UP',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  },
  {
    itemId: 'beef-sirloin-1p-chilled',
    priceId: 'price-mock-002',
    species: 'BEEF',
    storageType: 'CHILLED',
    category: '등심',
    displayName: '등심 1+',
    searchKeywords: '등심 ㄷㅅ 등심1+ 한우암소등심 ㄷㅅ1+ ㄷㅅ1p 등심1p 등심1P',
    grade: '1+',
    price: 32000,
    previousPrice: 33000,
    changeAmount: -1000,
    trendStatus: 'DOWN',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  },
  {
    itemId: 'beef-brisket-1-chilled',
    priceId: 'price-mock-003',
    species: 'BEEF',
    storageType: 'CHILLED',
    category: '차돌박이',
    displayName: '차돌박이 1등급',
    searchKeywords: '차돌박이 차돌 ㅊㄷ 차돌박이1 한우차돌박이 ㅊㄷ1 차돌1',
    grade: '1',
    price: 28000,
    previousPrice: 28000,
    changeAmount: 0,
    trendStatus: 'UNCHANGED',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  },
  {
    itemId: 'beef-ribs-frozen',
    priceId: 'price-mock-004',
    species: 'BEEF',
    storageType: 'FROZEN',
    category: '갈비',
    displayName: 'LA갈비',
    searchKeywords: 'LA갈비 라갈비 갈비 ㄱㅂ 냉동갈비',
    grade: null,
    price: 24000,
    previousPrice: 23500,
    changeAmount: 500,
    trendStatus: 'UP',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  },
  {
    itemId: 'pork-belly-chilled',
    priceId: 'price-mock-005',
    species: 'PORK',
    storageType: 'CHILLED',
    category: '삼겹',
    displayName: '삼겹(암)',
    searchKeywords: '삼겹 ㅅㄱ 삼겹암 국내산한돈삼겹 삼겹살암 ㅅㄱㅇ 삼겹살',
    grade: null,
    price: 21000,
    previousPrice: 21000,
    changeAmount: 0,
    trendStatus: 'UNCHANGED',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  },
  {
    itemId: 'pork-shoulder-chilled',
    priceId: 'price-mock-006',
    species: 'PORK',
    storageType: 'CHILLED',
    category: '목살',
    displayName: '목살',
    searchKeywords: '목살 ㅁㅅ 국내산한돈목살 돼지목살 목심 ㅁㅅ',
    grade: null,
    price: 19500,
    previousPrice: 19000,
    changeAmount: 500,
    trendStatus: 'UP',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  },
  {
    itemId: 'pork-belly-frozen',
    priceId: 'price-mock-007',
    species: 'PORK',
    storageType: 'FROZEN',
    category: '삼겹',
    displayName: '냉동 삼겹',
    searchKeywords: '냉동삼겹 냉삼 삼겹 ㅅㄱ 냉삼겹',
    grade: null,
    price: 12000,
    previousPrice: 12500,
    changeAmount: -500,
    trendStatus: 'DOWN',
    currency: 'KRW',
    priceUnit: 'KRW_PER_KG',
    isFavorite: false
  }
];

const MOCK_DETAILS: Record<string, AggregatedPriceDetail> = {
  'beef-tenderloin-1pp-chilled': {
    itemId: 'beef-tenderloin-1pp-chilled',
    displayName: '안심 1++',
    averagePrice: 38000,
    changeAmount: 1200,
    trendStatus: 'UP',
    highestPrice: 42000,
    lowestPrice: 35000,
    participantCount: 2,
    sourceRecords: [
      {
        id: 'mock-source-1',
        sourceName: 'GEUMCHEON',
        rawProductName: '[금천] 한우 암소 안심 1++ (38개월)',
        price: 38500,
        ageInMonths: 38,
        collectedAt: new Date().toISOString(),
        includedInAverage: true
      },
      {
        id: 'mock-source-2',
        sourceName: 'GEUMCHEON',
        rawProductName: '[금천] 한우 암소 안심 1++ (36개월)',
        price: 37500,
        ageInMonths: 36,
        collectedAt: new Date().toISOString(),
        includedInAverage: true
      }
    ],
    animalType: 'BEEF',
    storageType: 'CHILLED',
    grade: '1++',
    unit: '1kg'
  },
  'pork-belly-chilled': {
    itemId: 'pork-belly-chilled',
    displayName: '삼겹(암)',
    averagePrice: 21000,
    changeAmount: 0,
    trendStatus: 'UNCHANGED',
    highestPrice: 22000,
    lowestPrice: 20000,
    participantCount: 2,
    sourceRecords: [
      {
        id: 'mock-source-3',
        sourceName: 'GEUMCHEON',
        rawProductName: '[금천] 한돈 암퇘지 삼겹살',
        price: 21500,
        collectedAt: new Date().toISOString(),
        includedInAverage: true
      },
      {
        id: 'mock-source-4',
        sourceName: 'GEUMCHEON',
        rawProductName: '[금천] 한돈 삼겹살(암)',
        price: 20500,
        collectedAt: new Date().toISOString(),
        includedInAverage: true
      }
    ],
    animalType: 'PORK',
    storageType: 'CHILLED',
    grade: null,
    unit: '1kg'
  }
};

const getFallbackDetail = (itemId: string, item?: PriceItem): AggregatedPriceDetail => {
  const matched = item || MOCK_ITEMS.find((i) => i.itemId === itemId);
  const avg = matched?.price ?? 20000;
  return {
    itemId: itemId,
    displayName: matched?.displayName ?? '알 수 없는 품목',
    averagePrice: avg,
    changeAmount: matched?.changeAmount ?? 0,
    trendStatus: (matched?.trendStatus as TrendStatus) ?? 'UNCHANGED',
    highestPrice: Math.round(avg * 1.1),
    lowestPrice: Math.round(avg * 0.9),
    participantCount: 1,
    sourceRecords: [
      {
        id: `mock-source-${itemId}`,
        sourceName: 'GEUMCHEON',
        rawProductName: `[금천] ${matched?.displayName ?? '가짜 품목'} 임시 데이터`,
        price: avg,
        collectedAt: new Date().toISOString(),
        includedInAverage: true
      }
    ],
    animalType: matched?.species ?? 'BEEF',
    storageType: matched?.storageType ?? 'CHILLED',
    grade: matched?.grade ?? null,
    unit: '1kg'
  };
};

const getFallbackHistory = (itemId: string): PriceHistory => {
  const matched = MOCK_ITEMS.find((i) => i.itemId === itemId);
  const basePrice = matched?.price ?? 20000;
  const displayName = matched?.displayName ?? '알 수 없는 품목';
  
  const points = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().slice(0, 10);
    const variation = Math.round((Math.sin(i) * 0.05 + 0.02) * basePrice);
    points.push({
      marketDate: dateString,
      price: basePrice - variation
    });
  }
  
  return {
    item: { itemId, displayName },
    points
  };
};

const setMockModeFlag = (isMock: boolean) => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem('gogisise:is_mock_mode', isMock ? 'true' : 'false');
  }
};

export const marketService = {
  getMarketItemsResponse: async (
    options?: MarketServiceRequestOptions
  ): Promise<MarketItemsResponse> => {
    try {
      const payload = await apiClient.get<MarketItemsPayload>(
        `${MARKET_PATH}/items`,
        toApiOptions(options)
      );
      setMockModeFlag(false);
      return normalizeMarketItemsResponse(payload);
    } catch (error) {
      console.warn('[MarketService] API request failed. Falling back to MOCK data:', error);
      setMockModeFlag(true);
      return {
        dataStatus: 'CURRENT',
        marketDate: new Date().toISOString().slice(0, 10),
        items: MOCK_ITEMS
      };
    }
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
    if (itemId.startsWith('path:')) {
      const categoryPath = itemId.substring(5);
      return await marketService.getCategoryCalculations(categoryPath, options);
    }
    try {
      const detail = await apiClient.get<unknown>(
        `${MARKET_PATH}/items/${encodeURIComponent(itemId)}/calculations`,
        toApiOptions(options)
      );
      setMockModeFlag(false);
      return normalizePriceDetailPayload(detail);
    } catch (error) {
      console.warn(`[MarketService] API detail request failed for ${itemId}. Falling back to MOCK data:`, error);
      setMockModeFlag(true);
      const matched = MOCK_ITEMS.find((i) => i.itemId === itemId);
      return MOCK_DETAILS[itemId] || getFallbackDetail(itemId, matched);
    }
  },

  getPriceHistory: async (
    itemId: string,
    options?: MarketServiceRequestOptions
  ): Promise<PriceHistory> => {
    try {
      const res = await apiClient.get<PriceHistory>(
        `${MARKET_PATH}/items/${encodeURIComponent(itemId)}/price-history`,
        toApiOptions(options)
      );
      setMockModeFlag(false);
      return res;
    } catch (error) {
      console.warn(`[MarketService] API history request failed for ${itemId}. Falling back to MOCK data:`, error);
      setMockModeFlag(true);
      return getFallbackHistory(itemId);
    }
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

  getCategoryTree: async (
    options?: MarketServiceRequestOptions & { depth?: number }
  ): Promise<any[]> => {
    let path = `${MARKET_PATH}/items/categories`;
    if (options?.depth !== undefined) {
      path += `?depth=${options.depth}`;
    }
    return await apiClient.get<any[]>(path, toApiOptions(options));
  },

  getCategoryCalculations: async (
    categoryPath: string,
    options?: MarketServiceRequestOptions
  ): Promise<AggregatedPriceDetail> => {
    try {
      const detail = await apiClient.get<unknown>(
        `${MARKET_PATH}/items/calculations?categoryPath=${encodeURIComponent(categoryPath)}`,
        toApiOptions(options)
      );
      setMockModeFlag(false);
      return normalizePriceDetailPayload(detail);
    } catch (error) {
      console.warn(`[MarketService] API category calculations request failed for ${categoryPath}. falling back:`, error);
      setMockModeFlag(true);
      // Fallback
      return {
        itemId: `cat-${categoryPath}`,
        displayName: categoryPath.split(' > ').pop() || '',
        grade: null,
        averagePrice: 120000,
        changeAmount: 0,
        trendStatus: 'UNCHANGED',
        highestPrice: 130000,
        lowestPrice: 110000,
        participantCount: 5,
        sourceRecords: [],
        sourceItems: [],
        animalType: categoryPath.includes('돈육') ? 'PORK' : 'BEEF',
        storageType: categoryPath.includes('냉장') ? 'CHILLED' : 'FROZEN',
        unit: '1kg',
      };
    }
  },
};
