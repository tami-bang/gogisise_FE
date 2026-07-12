import type { SourcePriceRecord } from '../types/market';

/**
 * 주어진 원본 가격 배열에서 유효한 항목을 골라내어 평균을 계산합니다.
 * 계산은 Math.round(합계 / 개수) 원칙을 따릅니다.
 */
export function calculateAveragePrice(records: SourcePriceRecord[]): {
  averagePrice: number;
  includedCount: number;
  excludedCount: number;
  sourceRecordCount: number;
  minPrice: number;
  maxPrice: number;
  validRecords: SourcePriceRecord[];
} {
  const sourceRecordCount = records.length;
  const validRecords = records.filter(r => r.includedInAverage);
  const includedCount = validRecords.length;
  const excludedCount = sourceRecordCount - includedCount;

  if (includedCount === 0) {
    return {
      averagePrice: 0,
      includedCount,
      excludedCount,
      sourceRecordCount,
      minPrice: 0,
      maxPrice: 0,
      validRecords: [],
    };
  }

  const sum = validRecords.reduce((acc, r) => acc + r.price, 0);
  const averagePrice = Math.round(sum / includedCount);
  const minPrice = Math.min(...validRecords.map(r => r.price));
  const maxPrice = Math.max(...validRecords.map(r => r.price));

  return {
    averagePrice,
    includedCount,
    excludedCount,
    sourceRecordCount,
    minPrice,
    maxPrice,
    validRecords,
  };
}

/**
 * 프론트엔드 검증용 헬퍼 함수
 * Mock이나 API 응답에서 받은 공식 평균 가격과, 원본 데이터로 재계산한 가격이 일치하는지 검증합니다.
 */
export function verifyAggregationMatch(
  officialAverage: number,
  records: SourcePriceRecord[],
  contextId: string
): void {
  const { averagePrice, includedCount } = calculateAveragePrice(records);
  
  if (includedCount > 0 && averagePrice !== officialAverage) {
    console.error(`[Aggregation Mismatch] Item ID: ${contextId}
      Official Average: ${officialAverage}
      Calculated Average: ${averagePrice}
      Included Count: ${includedCount}
    `);
  }
}
