// src/components/domain/auth/AuthBottomSheet.tsx

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { MagicLinkForm } from './MagicLinkForm';
import { useAuthContext } from '../../../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'magicLink';

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
    }
  };

  return (
    <>
      {/* Backdrop (스크롤 차단 역할 포함) */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 max-w-screen-md mx-auto bg-[var(--color-bg)] rounded-t-[var(--radius-2xl)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-[51] transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-bottom-sheet-title"
      >
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--color-divider)]">
            <h2 id="auth-bottom-sheet-title" className="text-title font-bold text-[var(--text-strong)]">
              {renderHeaderTitle()}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-[var(--text-muted)] hover:bg-[var(--color-surface-soft)] rounded-full transition-colors"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* Content (스크롤 영역) */}
          <div className="overflow-y-auto p-5 pb-safe">
            <div className="max-w-md mx-auto w-full">
              {mode === 'login' && (
                <LoginForm 
                  onSwitchToSignup={() => setMode('signup')}
                  onSwitchToMagicLink={() => setMode('magicLink')}
                  onSuccess={onClose}
                />
              )}
              {mode === 'signup' && (
                <SignupForm 
                  onSwitchToLogin={() => setMode('login')}
                  onSuccess={() => {
                    // 가입 완료 후 자동 로그인 처리 (authService 모의 로직상 로그인 됨)
                    onClose();
                  }}
                />
              )}
              {mode === 'magicLink' && (
                <MagicLinkForm 
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
