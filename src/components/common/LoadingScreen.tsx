export function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-4">
        {/* 앱 로고 (이모지로 임시 대체) */}
        <span className="text-6xl animate-bounce" aria-hidden="true">🥩</span>
        
        {/* 로딩 인디케이터 텍스트 */}
        <div className="flex items-center gap-2 text-[var(--color-primary)] text-title-xl font-bold">
          <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          시세 불러오는 중...
        </div>
      </div>
    </div>
  );
}
