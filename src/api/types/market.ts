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
  displayName?: string; // 추가됨: 화면 표시용 이름
  grade?: string; // 추가됨: 등급 정보
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
  animalType?: 'BEEF' | 'PORK'; // 추가됨: 축종 필터링
}
