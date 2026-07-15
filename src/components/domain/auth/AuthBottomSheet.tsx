// src/components/domain/auth/AuthBottomSheet.tsx

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { MagicLinkForm } from './MagicLinkForm';
import { FindEmailForm } from './FindEmailForm';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'magicLink' | 'findEmail';

export function AuthBottomSheet({ isOpen, onClose }: Props) {
  const { user } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>('login');

  if (!isOpen) return null;

  // 이미 로그인 상태라면 바텀시트를 자동으로 닫음 (혹은 열리지 않음)
  if (user) {
    onClose();
    return null;
  }

  const renderHeaderTitle = () => {
    switch (mode) {
      case 'login': return '로그인';
      case 'signup': return '회원가입';
      case 'magicLink': return '비밀번호 찾기';
      case 'findEmail': return '이메일 찾기';
    }
  };

  const handleBack = () => {
    setMode('login');
  };

  return (
    <>
      {/* Backdrop (스크롤 차단 역할 포함) */}
      <div 
        className="fixed inset-0 bg-black/50 z-[99] transition-opacity" 
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-fit max-h-[85vh] bg-[var(--color-bg)] rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-[100] transition-transform duration-300 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-bottom-sheet-title"
      >
          {/* Header */}
          <div className="flex items-center justify-between py-3 px-5 border-b border-[var(--color-divider)]">
            <div className="flex items-center gap-3">
              {mode !== 'login' && (
                <button 
                  onClick={handleBack}
                  className="p-1 -ml-1 text-[var(--text-strong)] hover:bg-[var(--color-surface-soft)] rounded-full transition-colors"
                  aria-label="뒤로가기"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <h2 id="auth-bottom-sheet-title" className="text-title font-bold text-[var(--text-strong)]">
                {renderHeaderTitle()}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-[var(--text-muted)] hover:bg-[var(--color-surface-soft)] rounded-full transition-colors"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* Content (스크롤 영역) */}
          <div className="overflow-y-auto px-5 pt-3 pb-6">
            <div className="w-full">
              {mode === 'login' && (
                <LoginForm 
                  onSwitchToSignup={() => setMode('signup')}
                  onSwitchToMagicLink={() => setMode('magicLink')}
                  onSwitchToFindEmail={() => setMode('findEmail')}
                  onSuccess={onClose}
                />
              )}
              {mode === 'signup' && (
                <SignupForm 
                  onSwitchToLogin={() => setMode('login')}
                  onSuccess={onClose}
                />
              )}
              {mode === 'magicLink' && (
                <MagicLinkForm 
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
              {mode === 'findEmail' && (
                <FindEmailForm 
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
            </div>
          </div>
      </div>
    </>
  );
}
