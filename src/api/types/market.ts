export type TrendStatus = 'RISE' | 'FALL' | 'SAME';

export interface MarketSummary {
  trendStatus: TrendStatus;
  trendMessage: string;
  beefSummary: { value: number; status: TrendStatus };
  porkSummary: { value: number; status: TrendStatus };
}

export interface PriceItem {
  id: string;
  species: 'BEEF' | 'PORK';
  storageType: 'CHILLED' | 'FROZEN';
  category: string;
  detailName: string;
  price: number;
  changeValue: number;
  status: TrendStatus;
  isFavorite: boolean;
}

export interface MarketServiceConfig {
  delay?: number;
  shouldFail?: boolean;
  isEmpty?: boolean;
  page?: number;
  limit?: number;
  storageType?: 'CHILLED' | 'FROZEN';
}
