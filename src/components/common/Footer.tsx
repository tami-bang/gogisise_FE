// 화면 최하단에 고정되는 푸터(내비게이션) 컴포넌트입니다.
export function Footer() {
  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[var(--color-surface)] h-[80px] z-[60] shadow-footer flex items-center justify-around px-2 pb-safe">
      <button className="flex flex-col items-center justify-center gap-1 w-full h-full text-[var(--color-primary)] active:scale-[0.98] transition-transform duration-200">
        <span className="text-2xl" aria-hidden="true">★</span>
        <span className="text-caption font-bold">즐겨찾기</span>
      </button>
      <button className="flex flex-col items-center justify-center gap-1 w-full h-full text-[var(--text-muted)] active:scale-[0.98] transition-transform duration-200">
        <span className="text-2xl opacity-50" aria-hidden="true">📈</span>
        <span className="text-caption">전체 시세</span>
      </button>
      <button className="flex flex-col items-center justify-center gap-1 w-full h-full text-[var(--text-muted)] active:scale-[0.98] transition-transform duration-200">
        <span className="text-2xl opacity-50" aria-hidden="true">⚙️</span>
        <span className="text-caption">설정</span>
      </button>
    </footer>
  );
}
