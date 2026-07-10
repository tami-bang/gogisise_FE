export type TrendStatus = 'RISE' | 'FALL' | 'SAME';

export interface MarketSummary {
  trendStatus: TrendStatus;
  trendMessage: string;
  beefSummary: { value: number; status: TrendStatus };
  porkSummary: { value: number; status: TrendStatus };
}

export interface PriceItem {
  id: string;
  category: 'BEEF' | 'PORK';
  name: string;
  price: number;
  changeValue: number;
  status: TrendStatus;
}

export interface MarketServiceConfig {
  delay?: number;
  shouldFail?: boolean;
  isEmpty?: boolean;
}
