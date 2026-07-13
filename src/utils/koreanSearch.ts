// koreanSearch.ts
// ─────────────────────────────────────────────────────────────────────────────
// 한글 초성 검색 유틸리티 (외부 라이브러리 없이 순수 TypeScript 구현)
//
// 📚 한글 유니코드 원리 (교육용 설명):
//   한글 음절은 유니코드 0xAC00(가) ~ 0xD7A3(힣) 사이에 배치됩니다.
//   각 음절 = 초성(19종) × 중성(21종) × 종성(28종) = 11,172자
//
//   공식: 음절코드 = 0xAC00 + (초성index × 21 × 28) + (중성index × 28) + 종성index
//
//   예: '삼' = 0xAC00 + (9×588) + (0×28) + 1 = 0xC0BC
//   → ㅅ의 초성 범위: 0xC0BC(삼) ~ 0xC3B4(싷, ㅅ블록 마지막)
//
// 이 원리를 이용해 'ㅅ'이라는 초성 하나를 입력받으면,
// [사-싷] 범위를 커버하는 정규식 문자 클래스로 변환합니다.
// ─────────────────────────────────────────────────────────────────────────────

// 한글 초성 19자 (순서 중요: 유니코드 초성 인덱스와 1:1 대응)
const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

// 중성 21개 × 종성 28개 = 한 초성당 포함하는 글자 수
const JUNGSUNG_COUNT = 21;
const JONGSUNG_COUNT = 28;
const BLOCK_SIZE = JUNGSUNG_COUNT * JONGSUNG_COUNT; // 588

// 한글 음절 시작 코드 (가 = 0xAC00)
const HANGUL_START = 0xAC00;

/**
 * 초성 문자(ㄱ, ㄴ, … ㅎ)를 받아 해당 초성으로 시작하는
 * 모든 한글 음절 범위를 커버하는 정규식 문자 클래스 문자열을 반환합니다.
 *
 * 예: 'ㅅ' → '사-싷'  (사, 삭, 삼, 상, 새, ... 싷 전부 포함)
 */
function chosungToRange(chosung: string): string {
  const index = CHOSUNG_LIST.indexOf(chosung as typeof CHOSUNG_LIST[number]);
  if (index === -1) return ''; // 초성이 아닌 경우 빈 문자열 반환

  // 해당 초성 블록의 첫 번째 글자 코드
  const start = HANGUL_START + index * BLOCK_SIZE;
  // 해당 초성 블록의 마지막 글자 코드
  const end = start + BLOCK_SIZE - 1;

  // 예: String.fromCharCode(0xC0BC) = '삼', String.fromCharCode(0xC3B4) = '싷'
  return `${String.fromCharCode(start)}-${String.fromCharCode(end)}`;
}

/**
 * 입력된 검색어(query)를 분석하여 초성·완성자·영문이 혼합된
 * 정규식 패턴 문자열을 반환합니다.
 *
 * 처리 규칙:
 *  - 초성(ㄱ~ㅎ)  → [가-깋] 같은 유니코드 범위로 변환
 *  - 완성된 한글  → 그대로 사용 (includes와 동일 동작)
 *  - 영문/숫자    → 그대로 사용 (대소문자 구분 없이 'i' 플래그 적용)
 *  - 특수문자     → 정규식 특수 의미 제거(이스케이프)
 *
 * 예: 'ㅅㄱ' → 정규식 /[사-싷][가-깋]/i  → '삼겹', '설깃', '사골' 등 매칭
 * 예: '삼겹' → 정규식 /삼겹/i             → '삼겹', '미박삼겹' 등 매칭
 * 예: 'ㄷ심'  → 정규식 /[다-딯]심/i      → '등심', '도심' 등 매칭
 */
function buildSearchRegex(query: string): RegExp | null {
  if (!query) return null; // 빈 쿼리는 null 반환

  // 정규식 특수 문자 이스케이프 함수
  // (사용자가 '.' '(' ')' 등을 입력해도 에러 없이 처리)
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let pattern = '';
  for (const char of query) {
    const range = chosungToRange(char);

    if (range) {
      // 초성: [가-깋] 같은 범위 클래스로 변환
      pattern += `[${range}]`;
    } else {
      // 완성 한글, 영문, 숫자, 특수문자: 그대로 이스케이프 처리
      pattern += escapeRegex(char);
    }
  }

  try {
    // 'i' 플래그: 대소문자 구분 없음 (영문 검색 시 Beef = beef)
    return new RegExp(pattern, 'i');
  } catch {
    // 혹시라도 잘못된 패턴이 생성되면 null로 안전하게 반환
    return null;
  }
}

/**
 * 메인 검색 매처 함수
 * searchKeywords 문자열이 query와 매칭되는지 여부를 반환합니다.
 *
 * @param keywords - 검색 대상 문자열 (item.searchKeywords)
 * @param query    - 사용자가 입력한 검색어 (초성/완성자/영문 혼합 가능)
 * @returns boolean - 매칭 여부
 *
 * 예시:
 *   matchesSearch('삼겹 한돈 냉장 1등급', 'ㅅㄱ') → true  (삼겹 매칭)
 *   matchesSearch('등심 한우 냉장 1등급', 'ㄷㅅ') → true  (등심 매칭)
 *   matchesSearch('삼겹 한돈 냉장 1등급', '등심') → false
 */
export function matchesSearch(keywords: string, query: string): boolean {
  if (!query.trim()) return true; // 검색어 없으면 항상 매칭 (탭 필터만 적용)

  const regex = buildSearchRegex(query.trim().toLowerCase());
  if (!regex) return true; // 정규식 생성 실패 시 안전하게 통과 처리

  // 방어 코드: keywords가 undefined/null이어도 에러 없이 처리
  return regex.test(keywords || '');
}
