import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  rightAction?: 'share' | null;
  onActionClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onBack?: () => void;
}

// 화면 최상단에 고정되는 헤더 컴포넌트입니다.
export function Header({ title = '고기시세', rightAction = null, onActionClick, onBack }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/settings');
  };

  const getFirstLetter = () => {
    if (!user || !user.nickname) return '';
    return user.nickname.trim().charAt(0).toUpperCase();
  };

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
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {title === '고기시세' && !onBack && <span className="text-3xl" aria-hidden="true">🥩</span>}
        <h1 className="text-title-xl text-[var(--text-strong)] tracking-tight whitespace-nowrap">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {rightAction === 'share' && (
          <button
            onClick={onActionClick}
            className="text-body text-[var(--color-primary)] font-bold p-2 -mr-2 active:scale-95 transition-transform"
            aria-label="공유하기"
          >
            공유
          </button>
        )}

        {/* 💡 [한글 주석] 프로필 아바타: 로그인 시 닉네임 첫 자, 로그아웃 시 기본 실루엣 SVG 출력 및 클릭 시 설정 라우팅 연동 */}
        <button
          onClick={handleProfileClick}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border)] shadow-soft active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          style={{
            backgroundColor: isAuthenticated ? 'rgba(59, 145, 200, 0.1)' : 'var(--color-surface-soft)',
            color: isAuthenticated ? 'var(--color-secondary)' : 'var(--text-light)',
          }}
          aria-label="설정 페이지로 이동"
        >
          {isAuthenticated && getFirstLetter() ? (
            <span className="text-body font-black select-none">{getFirstLetter()}</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
