import type { MarketSummary, PriceItem, TrendStatus } from '../types/market';

export const mockMarketSummary: MarketSummary = {
  trendStatus: 'RISE',
  trendMessage: '0.8% 상승',
  beefSummary: { value: 1200, status: 'RISE' },
  porkSummary: { value: -350, status: 'FALL' },
};

// 동적으로 실매물 데이터를 생성합니다. (CATEGORIES.md 기반)
const generateMockPrices = (): PriceItem[] => {
  const items: PriceItem[] = [];
  
  const porkChilled = ['더좋은삼겹', '삼겹', '목심', '앞다리', '등심', '안심', '등갈비', '항정', '갈매기'];
  const porkFrozen = ['냉동삼겹', '냉동목심', '냉동뒷다리', '냉동등갈비', '냉동항정', '냉동돈피'];
  const beefChilled = ['안심', '등심', '채끝', '부채살', '치마살', '업진살', '사태', '갈비살', '토시살'];
  const beefFrozen = ['차돌박이', '사골', '우족', '잡뼈', '냉동사태', '냉동갈비'];

  let idCounter = 1;

  const addItems = (
    species: 'BEEF' | 'PORK', 
    storageType: 'CHILLED' | 'FROZEN', 
    categories: string[], 
    basePrice: number
  ) => {
    categories.forEach((cat, index) => {
      // 품목당 여러 개의 세부 품목 생성
      for (let i = 1; i <= 3; i++) {
        const trendValue = Math.floor(Math.random() * 3);
        let status: TrendStatus = 'SAME';
        let change = 0;
        
        if (trendValue === 1) {
          status = 'RISE';
          change = Math.floor(Math.random() * 1500) + 100;
        } else if (trendValue === 2) {
          status = 'FALL';
          change = -(Math.floor(Math.random() * 1000) + 100);
        }

        const price = basePrice + (index * 1200) + (i * 300) + change;
        
        items.push({
          id: String(idCounter++),
          species,
          storageType,
          category: cat,
          detailName: species === 'BEEF' ? `한우 암소 ${cat} ${i}등급` : `한돈 암퇘지 ${cat} 스펙${i}`,
          price,
          changeValue: change,
          status,
          // 테스트용: 일부 항목을 즐겨찾기로 설정
          isFavorite: idCounter % 8 === 0 || idCounter === 2 || idCounter === 3,
        });
      }
    });
  };

  addItems('PORK', 'CHILLED', porkChilled, 14000);
  addItems('PORK', 'FROZEN', porkFrozen, 9000);
  addItems('BEEF', 'CHILLED', beefChilled, 35000);
  addItems('BEEF', 'FROZEN', beefFrozen, 25000);

  return items;
};

// 수십 개의 목업 데이터 배열 전체
export const allMockPrices: PriceItem[] = generateMockPrices();
