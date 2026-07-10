import type { MarketSummary, PriceItem } from '../types/market';

export const mockMarketSummary: MarketSummary = {
  trendStatus: 'RISE',
  trendMessage: '0.8% 상승',
  beefSummary: {
    value: 1200,
    status: 'RISE',
  },
  porkSummary: {
    value: 350,
    status: 'FALL',
  },
};

export const mockFavoritePrices: PriceItem[] = [
  {
    id: '1',
    category: 'BEEF',
    name: '한우 암컷 등심',
    price: 21500,
    changeValue: 1200,
    status: 'RISE',
  },
  {
    id: '2',
    category: 'PORK',
    name: '한돈 암컷 삼겹살',
    price: 18200,
    changeValue: 350,
    status: 'FALL',
  },
  {
    id: '3',
    category: 'BEEF',
    name: '한우 암컷 채끝',
    price: 23000,
    changeValue: 0,
    status: 'SAME',
  },
];
