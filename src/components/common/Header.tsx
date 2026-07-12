interface HeaderProps {
  title?: string;
  rightAction?: 'share' | null;
  onActionClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onBack?: () => void;
}

// 화면 최상단에 고정되는 헤더 컴포넌트입니다.
export function Header({ title = '고기시세', rightAction = null, onActionClick, onBack }: HeaderProps) {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between h-[72px] px-5 bg-[var(--color-surface)] border-b border-[var(--color-divider)]">
      <div className="flex items-center gap-2">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 active:scale-95 transition-transform"
            aria-label="뒤로가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {title === '고기시세' && !onBack && <span className="text-3xl" aria-hidden="true">🥩</span>}
        <h1 className="text-title-xl text-[var(--text-strong)] tracking-tight">
          {title}
        </h1>
      </div>
      
      {rightAction === 'share' && (
        <button 
          onClick={onActionClick}
          className="text-body text-[var(--color-primary)] font-bold p-2 -mr-2 active:scale-95 transition-transform"
          aria-label="공유하기"
        >
          공유
        </button>
      )}
    </header>
  );
}
