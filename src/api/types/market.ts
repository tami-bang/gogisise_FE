// market.ts — USER_SERVED_SPEC.md 기반 완전 정렬된 타입 정의
// 명세서의 필드명, Nullable 정책, enum 값을 그대로 반영합니다.

// ─────────────────────────────────────────────────────────────────
// TrendStatus: 가격 등락 추세 플래그
// 명세서 기준: "UP" | "DOWN" | "UNCHANGED"
// (이전 코드의 RISE/FALL/SAME에서 명세서 표준으로 전면 교체)
// ─────────────────────────────────────────────────────────────────
export type TrendStatus = 'UP' | 'DOWN' | 'UNCHANGED';

// 등급 포맷: 명세서 4.2항 엄수 — "1++", "1+", "1", "2", "3", "등외"
// 뒤에 '등급' 텍스트는 UI 렌더링 시 FE에서 붙입니다.
export type Grade = '1++' | '1+' | '1' | '2' | '3' | '등외';

// dataStatus: API 응답의 데이터 신선도 상태
export type DataStatus = 'CURRENT' | 'STALE' | 'UNAVAILABLE';

// ─────────────────────────────────────────────────────────────────
// MarketSummary: 메인 홈 화면 요약 카드용
// ─────────────────────────────────────────────────────────────────
export interface MarketSummary {
  trendStatus: TrendStatus;
  trendMessage: string;
  beefSummary: { value: number; status: TrendStatus };
  porkSummary: { value: number; status: TrendStatus };
}

// ─────────────────────────────────────────────────────────────────
// PriceItem: GET /api/v1/market/items 응답 배열의 단일 품목
// USER_SERVED_SPEC.md 데이터 딕셔너리(섹션 4)와 1:1 매핑
// ─────────────────────────────────────────────────────────────────
export interface PriceItem {
  // 식별자 — Nullable ❌
  itemId: string;       // 품목 고유 식별자 (명세: itemId)
  priceId?: string;     // 가격 레코드 식별자 (선택)

  // 분류 — Nullable ❌
  species: 'BEEF' | 'PORK';
  storageType: 'CHILLED' | 'FROZEN';
  category: string;                  // 부위 그룹명 (예: "안심")
  displayName: string;               // 정제된 화면 표시명 (예: "안심 1++", "삼겹(암)") — 필수
  grade: Grade | null;               // 등급 (한돈 부산물 등은 null 허용)

  // 검색 — Nullable ❌ (빈 문자열 "" 보장)
  searchKeywords: string;            // 클라이언트 검색 인덱스

  // 가격 — Nullable ✅ (데이터 부재 시 null)
  price: number | null;              // 가공 평균가
  previousPrice: number | null;     // 전일 가격 (전일 데이터 없으면 null)
  changeAmount: number | null;      // 전일 대비 변동액 (null 시 배지에 "— 0" 표시)
  trendStatus: TrendStatus | null;  // 추세 플래그 (null 시 UNCHANGED 처리)

  // 단위 — Nullable ❌
  currency: 'KRW';                   // 통화 ("KRW" 고정)
  priceUnit: 'KRW_PER_KG';          // 가격 단위 ("KRW_PER_KG" 고정)

  // FE 전용 (서버 응답에 없음, 로컬 상태로 관리)
  isFavorite: boolean;
}

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/market/items 전체 응답 래퍼
// ─────────────────────────────────────────────────────────────────
export interface MarketItemsResponse {
  dataStatus: DataStatus;
  marketDate: string;  // "YYYY-MM-DD"
  items: PriceItem[];
}

// ─────────────────────────────────────────────────────────────────
// Mock/Service 내부 설정용 (실제 API 연동 시 삭제)
// ─────────────────────────────────────────────────────────────────
export interface MarketServiceConfig {
  delay?: number;
  shouldFail?: boolean;
  isEmpty?: boolean;
  page?: number;
  limit?: number;
  storageType?: 'CHILLED' | 'FROZEN';
  animalType?: 'BEEF' | 'PORK';
}

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/market/items/{itemId}/calculations 응답 구조
// USER_SERVED_SPEC.md 섹션 1.2
// ─────────────────────────────────────────────────────────────────

// 원본 매물 단건 (금천미트에서 수집된 날것 레코드)
export interface SourcePriceRecord {
  // FE key 용도 (서버 응답에는 없으나 목록 렌더링에 필요)
  id: string;
  sourceName: string;          // 수집처 ("GEUMCHEON" 고정)
  rawProductName: string;      // 원본 상품명 전체
  price: number;               // 해당 원본 가격 (1kg/원)
  ageInMonths?: number | null; // 월령 (한우 암소만, 한돈은 null)
  collectedAt: string;         // ISO 8601 수집 시각
  includedInAverage: boolean;  // 평균 산출에 포함됐는지 여부
  exclusionReason?: string;    // 제외 사유 (포함된 경우 undefined)
  grade?: string | null;       // 등급 (예: "1++", "1+", "1")
  brand?: string | null;       // 브랜드명
}

// 금천미트 원본 상품 단건 (바로가기용)
export interface SourceItem {
  itemId: string;
  name: string;           // 상품명
  grade: string | null;   // 등급
  brand: string | null;   // 브랜드명
  detailUrl: string;      // 금천미트 상품 상세 URL
  price: number;          // 현재 가격
  ageInMonths?: number | null;
  manufacturedAt?: string | null;
  expiresAt?: string | null;
  weightKg?: number | null;
  salePrice?: number | null;
}

// 산출 세부 내역 응답 전체
export interface AggregatedPriceDetail {
  itemId: string;
  displayName: string;          // 화면 표시명 (명세: displayName)
  grade?: Grade | string | null; // 해당 품목 등급

  // 가격 지표
  averagePrice: number;
  changeAmount: number | null;  // 전일 대비 변동액 (null 허용)
  trendStatus: TrendStatus;

  highestPrice: number;         // 명세: highestPrice (이전: maxPrice)
  lowestPrice: number;          // 명세: lowestPrice  (이전: minPrice)
  participantCount: number;     // 명세: participantCount (이전: includedCount)

  // 원본 매물 리스트
  sourceRecords: SourcePriceRecord[];

  // 원본 MarketItem 리스트 (금천미트 바로가기용)
  sourceItems?: SourceItem[];

  // FE 표시용 추가 필드 (서버 제공 or FE 계산)
  animalType: 'BEEF' | 'PORK';  // FE 즐겨찾기 등록 시 필요
  storageType: 'CHILLED' | 'FROZEN';
  unit: string;                  // "1kg"
}

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/market/items/{itemId}/price-history 응답 구조
// USER_SERVED_SPEC.md 섹션 1.3
// ─────────────────────────────────────────────────────────────────
export interface PriceHistoryPoint {
  marketDate: string;   // "YYYY-MM-DD"
  price: number | null; // 해당일 가격 (데이터 없으면 null)
}

export interface PriceHistory {
  item: { itemId: string; displayName: string };
  points: PriceHistoryPoint[];
}
