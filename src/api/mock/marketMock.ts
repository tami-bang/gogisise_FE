// marketMock.ts — USER_SERVED_SPEC.md 기반 목업 데이터
// TrendStatus: UP/DOWN/UNCHANGED, itemId, changeAmount, displayName 필수 등 명세 완전 반영

import type {
  MarketSummary,
  PriceItem,
  TrendStatus,
  Grade,
  SourcePriceRecord,
  AggregatedPriceDetail,
} from '../types/market';
import { calculateAveragePrice } from '../services/priceAggregationService';

// ─────────────────────────────────────────────────────────────────
// 홈 화면 요약 카드
// ─────────────────────────────────────────────────────────────────
export const mockMarketSummary: MarketSummary = {
  trendStatus: 'UP',           // 명세: UP (이전: RISE)
  trendMessage: '0.8% 상승',
  beefSummary: { value: 1200, status: 'UP' },
  porkSummary: { value: -350, status: 'DOWN' },
};

// 동적으로 생성되는 상세 내역 캐시
export const mockAggregatedDetails: Record<string, AggregatedPriceDetail> = {};

// ─────────────────────────────────────────────────────────────────
// 초성 추출 유틸 — searchKeywords 가공에 활용
// 예: "삼겹" → "ㅅㄱ"
// ─────────────────────────────────────────────────────────────────
const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function extractChosung(text: string): string {
  // 한글 음절 하나하나에서 초성만 뽑아냅니다.
  // 원리: 음절코드 = 0xAC00 + 초성*588 + 중성*28 + 종성
  //       → 초성index = Math.floor((code - 0xAC00) / 588)
  return [...text].map(char => {
    const code = char.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return char; // 한글 음절이 아니면 그대로
    return CHOSUNG[Math.floor(code / 588)];
  }).join('');
}

// ─────────────────────────────────────────────────────────────────
// searchKeywords 가공 함수 (BE 역할 시뮬레이션)
// USER_SERVED_SPEC Check 1/2/3 모두 반영
// ─────────────────────────────────────────────────────────────────
function buildSearchKeywords(
  category: string,
  displayName: string,
  species: 'BEEF' | 'PORK',
  grade: Grade | null,
): string {
  const tokens: string[] = [];

  // 기본 표시명과 카테고리
  tokens.push(category);
  tokens.push(displayName);

  // 초성 추출 (Check 1: 암퇘지 접미사 포함된 displayName에서 추출)
  const chosung = extractChosung(category);
  if (chosung !== category) tokens.push(chosung); // 초성이 원문과 다를 때만 추가

  // displayName에서도 초성 추출 (예: "삼겹(암)" → "ㅅㄱㅇ" 포함)
  const chosungDisplay = extractChosung(displayName.replace(/[()]/g, ''));
  if (chosungDisplay !== displayName) tokens.push(chosungDisplay);

  // 축종 관련 토큰
  if (species === 'BEEF') {
    tokens.push('한우', '소고기', '암소');
  } else {
    tokens.push('한돈', '돼지고기', '국내산');
    // Check 1: 암퇘지 관련 토큰
    if (displayName.includes('암') || displayName.includes('(암)')) {
      tokens.push('암퇘지', '암돼지');
    }
  }

  // Check 2: 등급 표기 정규화 및 초성 결합 토큰화 포함 (1pp, 1PP 포함)
  if (grade) {
    tokens.push(grade);  // "1++"
    if (grade === '1++') tokens.push('1pp', '1PP', '1플플');
    if (grade === '1+') tokens.push('1p', '1P', '1플');
    if (grade === '1') tokens.push('1등');
    tokens.push(`${grade}등급`); // "1++등급"

    // [초성/부위명 + 등급] 결합 토큰 추가 (예: ㅅㄱ1, 삼겹1, ㅇㅅ1++, 안심1pp)
    // 사장님들이 띄어쓰기 없이 붙여서 검색하는 경우 지원
    const gradeSuffixes = [grade];
    if (grade === '1++') gradeSuffixes.push('1pp', '1PP');
    if (grade === '1+') gradeSuffixes.push('1p', '1P');

    gradeSuffixes.forEach(suffix => {
      tokens.push(`${chosung}${suffix}`); // 예: ㅅㄱ1, ㅇㅅ1++
      tokens.push(`${category}${suffix}`); // 예: 삼겹1, 안심1++
      
      if (chosungDisplay && chosungDisplay !== chosung && chosungDisplay !== displayName) {
        tokens.push(`${chosungDisplay}${suffix}`); // 예: ㅅㄱㅇ1 (삼겹(암) 1등급의 경우)
      }
    });
  }

  // Check 3: Nullable ❌ — 빈 문자열 보장 (filter Boolean으로 안전 처리)
  return [...new Set(tokens)].filter(Boolean).join(' ').toLowerCase();
}

// ─────────────────────────────────────────────────────────────────
// 전체 품목 Mock 데이터 생성 (CATEGORIES.md 기반)
// ─────────────────────────────────────────────────────────────────
const generateMockPrices = (): PriceItem[] => {
  const items: PriceItem[] = [];

  // CATEGORIES.md 기준 실매물 카테고리
  const porkChilled = ['더좋은삼겹', '더좋은삼겹(암)', '삼겹', '삼겹(암)', '미박삼겹', '목심', '목심(암)', '앞다리', '등심', '안심', '등갈비', '항정', '갈매기', '사태'];
  const porkFrozen  = ['냉동롤삼겹(꽃삼겹)', '냉동삼겹', '냉동목심', '냉동뒷다리', '냉동등심', '냉동안심', '냉동갈비', '냉동등갈비', '냉동항정', '냉동갈매기', '냉동돈피', '냉동등뼈'];
  const beefChilled = ['안심', '등심', '윗등심', '채끝', '목심', '부채살', '치마살', '차돌박이(냉장)', '업진살', '사태', '갈비', '갈비살', '토시살', '설도', '우둔살'];
  const beefFrozen  = ['차돌박이', '사골', '우족', '잡뼈', '냉동사태', '냉동갈비', '냉동설깃', '냉동우둔'];

  let idCounter = 1;

  // 명세서 기준 등급 목록
  const beefGrades: Grade[] = ['1++', '1+', '1'];
  const porkGrades: Grade[] = ['1', '2', '등외'];

  const addItems = (
    species: 'BEEF' | 'PORK',
    storageType: 'CHILLED' | 'FROZEN',
    categories: string[],
    basePrice: number
  ) => {
    categories.forEach((cat, catIndex) => {
      const grades = species === 'BEEF' ? beefGrades : porkGrades;

      grades.forEach((grade, gradeIndex) => {
        // 랜덤 추세 (UP/DOWN/UNCHANGED)
        const roll = Math.random();
        let trendStatus: TrendStatus = 'UNCHANGED';
        let changeAmount: number | null = 0;

        if (roll < 0.35) {
          trendStatus = 'UP';
          changeAmount = Math.floor(Math.random() * 1500) + 100;
        } else if (roll < 0.65) {
          trendStatus = 'DOWN';
          changeAmount = -(Math.floor(Math.random() * 1000) + 100);
        } else {
          trendStatus = 'UNCHANGED';
          changeAmount = 0;
        }

        const calculatedBase = basePrice + (catIndex * 1200) + (gradeIndex * 500);

        // displayName: 명세서 규칙 적용
        // 한돈: "(암)" 접미사 처리
        // 한우: 등급 붙이기 (등급은 UI에서 "등급" 붙여 렌더링)
        let displayName = '';
        if (species === 'BEEF') {
          // 카테고리에 이미 "냉동" 등이 붙어있으면 그대로, 아니면 등급 추가
          displayName = cat.includes('냉동') ? `${cat} ${grade}` : `${cat} ${grade}`;
        } else {
          // 한돈: "(암)" 접미사가 있는 카테고리는 그대로 사용
          displayName = cat;
        }

        const itemId = `item-${String(idCounter).padStart(4, '0')}`;
        const priceId = `price-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(idCounter).padStart(6, '0')}`;
        idCounter++;

        // 원본 매물 생성 (금천미트 단일 소스)
        const sourceRecords: SourcePriceRecord[] = [];
        const sourceCount = Math.floor(Math.random() * 3) + 2; // 2~4건

        for (let j = 0; j < sourceCount; j++) {
          const isOutlier = Math.random() < 0.1;
          const randomDiff = Math.floor(Math.random() * 2000) - 1000;
          const sourcePrice = isOutlier
            ? Math.floor(calculatedBase * 0.5)     // 이상치: 절반 가격
            : calculatedBase + randomDiff;

          const ageInMonths = species === 'BEEF'
            ? Math.floor(Math.random() * 10) + 30  // 30~39개월 (40 미만만 수집)
            : null;

          sourceRecords.push({
            id: `src-${itemId}-${j}`,
            sourceName: 'GEUMCHEON',               // 명세: sourceName 고정 "GEUMCHEON"
            rawProductName: `[금천] ${displayName}`,
            price: sourcePrice,
            ageInMonths,                            // 한돈은 null
            collectedAt: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
            includedInAverage: !isOutlier,
            exclusionReason: isOutlier ? 'OUTLIER' : undefined,
          });
        }

        // 평균가 계산
        const { averagePrice, includedCount, minPrice, maxPrice } =
          calculateAveragePrice(sourceRecords);

        const previousPrice = averagePrice - (changeAmount ?? 0);

        // searchKeywords 가공 (BE 역할 시뮬레이션)
        const searchKeywords = buildSearchKeywords(cat, displayName, species, grade);

        // AggregatedPriceDetail 캐시 (상세 시트용)
        mockAggregatedDetails[itemId] = {
          itemId,
          displayName,
          animalType: species,
          storageType,
          grade,
          averagePrice,
          changeAmount,
          trendStatus,
          highestPrice: maxPrice,     // 명세: highestPrice
          lowestPrice: minPrice,      // 명세: lowestPrice
          participantCount: includedCount,  // 명세: participantCount
          sourceRecords,
          unit: '1kg',
        };

        items.push({
          itemId,                  // 명세: itemId (이전: id)
          priceId,
          species,
          storageType,
          category: cat,
          displayName,             // 필수 (이전: optional)
          grade,
          searchKeywords,          // Check 3: 빈 문자열 보장됨
          price: averagePrice,     // Nullable 허용이지만 mock은 항상 값 제공
          previousPrice,
          changeAmount,            // 명세: changeAmount (이전: changeValue)
          trendStatus,             // 명세: UP/DOWN/UNCHANGED (이전: RISE/FALL/SAME)
          currency: 'KRW',
          priceUnit: 'KRW_PER_KG',
          isFavorite: false,
        });
      });
    });
  };

  addItems('PORK', 'CHILLED', porkChilled, 14000);
  addItems('PORK', 'FROZEN',  porkFrozen,  9000);
  addItems('BEEF', 'CHILLED', beefChilled, 35000);
  addItems('BEEF', 'FROZEN',  beefFrozen,  25000);

  return items;
};

// 앱 시작 시 1회 생성되어 메모리에 상주하는 전체 배열
export const allMockPrices: PriceItem[] = generateMockPrices();
