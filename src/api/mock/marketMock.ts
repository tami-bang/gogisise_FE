import type { MarketSummary, PriceItem, TrendStatus, SourcePriceRecord, AggregatedPriceDetail } from '../types/market';
import { calculateAveragePrice } from '../services/priceAggregationService';

export const mockMarketSummary: MarketSummary = {
  trendStatus: 'RISE',
  trendMessage: '0.8% 상승',
  beefSummary: { value: 1200, status: 'RISE' },
  porkSummary: { value: -350, status: 'FALL' },
};

export const mockAggregatedDetails: Record<string, AggregatedPriceDetail> = {};

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

        const calculatedBase = basePrice + (index * 1200) + (i * 300) + change;
        
        let grade = undefined;
        let detailName = '';
        if (species === 'BEEF') {
            grade = i === 1 ? '1++등급' : (i === 2 ? '1+등급' : '1등급');
            detailName = `한우 암소 ${cat}`;
        } else {
            grade = i === 1 ? '1등급' : (i === 2 ? '2등급' : '등외');
            detailName = `한돈 암퇘지 ${cat}`;
        }
        
        const fullDisplayName = `${species === 'BEEF' ? '한우 암소' : '한돈 암퇘지'} ${storageType === 'CHILLED' ? '냉장' : '냉동'} ${cat} ${grade || ''}`.trim();
        const id = String(idCounter++);
        
        // 원본 데이터(SourcePriceRecord) 생성
        const sourceRecords: SourcePriceRecord[] = [];
        const sourceCount = Math.floor(Math.random() * 5) + 3; // 3~7곳
        const sourceNames = ['금천미트', '미트박스', '협신식품', '도드람', '선진포크', '목우촌', '하이포크'];
        
        for (let j = 0; j < sourceCount; j++) {
          const isOutlier = Math.random() < 0.1;
          const isIncluded = !isOutlier;
          const randomDiff = Math.floor(Math.random() * 2000) - 1000;
          let sourcePrice = calculatedBase + randomDiff;
          
          if (isOutlier) {
             sourcePrice = sourcePrice * 0.5; // 이상치
          }
          
          sourceRecords.push({
            id: `src-${id}-${j}`,
            sourceName: sourceNames[j % sourceNames.length],
            originalProductName: fullDisplayName,
            price: sourcePrice,
            unit: '1kg',
            collectedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
            includedInAverage: isIncluded,
            exclusionReason: isIncluded ? undefined : 'OUTLIER',
          });
        }
        
        const { averagePrice, includedCount, excludedCount, sourceRecordCount, minPrice, maxPrice } = calculateAveragePrice(sourceRecords);
        const aggregationVersion = 'v1.0.0';

        mockAggregatedDetails[id] = {
          itemId: id,
          fullDisplayName,
          animalType: species,
          storageType,
          grade,
          averagePrice,
          previousAveragePrice: averagePrice - change,
          changeAmount: change,
          status,
          aggregationVersion,
          calculatedAt: new Date().toISOString(),
          sourceRecordCount,
          includedCount,
          excludedCount,
          unit: '1kg',
          currency: 'KRW',
          minPrice,
          maxPrice,
          sourceRecords
        };

        items.push({
          id,
          species,
          storageType,
          category: cat,
          detailName,
          displayName: cat,
          grade,
          price: averagePrice, // priceAggregationService 에서 나온 값으로 정합성 100% 일치
          changeValue: change,
          status,
          isFavorite: false, // 즐겨찾기 값은 useFavorites 에서 전역 관리하므로 초기값 false
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
