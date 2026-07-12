import { useNavigate } from 'react-router-dom';

interface FooterProps {
  activeTab?: 'favorite' | 'all' | 'settings';
}

export function Footer({ activeTab = 'favorite' }: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[var(--color-surface)] h-[80px] z-[60] shadow-footer flex items-center justify-around px-2 pb-safe">
      <button 
        onClick={() => navigate('/favorites')}
        className={`flex flex-col items-center justify-center gap-1 w-full h-full active:scale-[0.98] transition-transform duration-200 ${activeTab === 'favorite' ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`}
      >
        <span className={`text-2xl ${activeTab === 'favorite' ? '' : 'opacity-50'}`} aria-hidden="true">★</span>
        <span className={`text-caption ${activeTab === 'favorite' ? 'font-bold' : ''}`}>즐겨찾기</span>
      </button>
      <button 
        onClick={() => navigate('/all-prices')}
        className={`flex flex-col items-center justify-center gap-1 w-full h-full active:scale-[0.98] transition-transform duration-200 ${activeTab === 'all' ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`}
      >
        <span className={`text-2xl ${activeTab === 'all' ? '' : 'opacity-50'}`} aria-hidden="true">📈</span>
        <span className={`text-caption ${activeTab === 'all' ? 'font-bold' : ''}`}>전체 시세</span>
      </button>
      <button 
        onClick={() => navigate('/settings')}
        className={`flex flex-col items-center justify-center gap-1 w-full h-full active:scale-[0.98] transition-transform duration-200 ${activeTab === 'settings' ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`}
      >
        <span className={`text-2xl ${activeTab === 'settings' ? '' : 'opacity-50'}`} aria-hidden="true">⚙️</span>
        <span className={`text-caption ${activeTab === 'settings' ? 'font-bold' : ''}`}>설정</span>
      </button>
    </footer>
  );
}
