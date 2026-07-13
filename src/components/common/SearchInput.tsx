// SearchInput.tsx
// 실시간 검색 입력 컴포넌트 - 돋보기 아이콘 + X 버튼 포함
// BASE.md 디자인 토큰(--color-secondary, --radius-md 등)을 준수합니다.

interface SearchInputProps {
  value: string;                      // 현재 검색어 (부모가 State로 관리)
  onChange: (query: string) => void;  // 타이핑할 때마다 부모 State를 업데이트
  placeholder?: string;              // 입력창 힌트 텍스트
}

export function SearchInput({ value, onChange, placeholder = '품목명을 검색하세요' }: SearchInputProps) {
  return (
    // 검색창 래퍼: 돋보기 아이콘 + Input + X버튼을 가로로 배치
    <div
      className="flex items-center w-full gap-2 px-5 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] border border-[var(--color-border)] transition-colors focus-within:border-[var(--color-secondary)] focus-within:bg-white"
      style={{ minHeight: '48px' }}
    >
      {/* 돋보기 아이콘 - 검색 상태 힌트 */}
      <svg
        width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        className="flex-shrink-0 text-[var(--text-light)]"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* 실제 입력 필드 */}
      <input
        id="search-input-market"
        type="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}  // 타이핑 즉시 부모 State 업데이트
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-label text-[var(--text-default)] placeholder:text-[var(--text-light)]"
        aria-label="품목 검색"
      />

      {/* X 버튼: 검색어가 있을 때만 노출 (조건부 렌더링) */}
      {value && (
        <button
          onClick={() => onChange('')}       // 검색어 초기화
          className="flex-shrink-0 p-1 rounded-full text-[var(--text-light)] hover:text-[var(--text-muted)] hover:bg-[var(--color-border)] transition-colors active:scale-[0.95]"
          aria-label="검색어 지우기"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
