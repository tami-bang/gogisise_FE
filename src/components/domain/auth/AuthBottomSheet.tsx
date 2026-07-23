// src/components/domain/auth/AuthBottomSheet.tsx

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 💡 [한글 주석] 바텀시트 전체를 body 하위로 이관해 렌더링하기 위한 Portal 임포트
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { MagicLinkForm } from './MagicLinkForm';
import { FindEmailForm } from './FindEmailForm';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'magicLink' | 'findEmail';

export function AuthBottomSheet({ isOpen, onClose }: Props) {
  const { user } = useAuthContext();
  const { setError: setAuthError } = useAuth(); // 💡 [한글 주석] 로그인 실패 에러 메세지 리셋을 위한 useAuth 연동
  const [mode, setMode] = useState<AuthMode>('login');

  // 💡 [한글 주석] 모달의 열림 상태(isOpen)가 false로 변하는 시점(닫힐 때)에 내부 서브뷰 상태를 'login'으로 자동 초기화
  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setAuthError(null);
    }
  }, [isOpen, setAuthError]);

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

  const handleClose = () => {
    setAuthError(null);
    setMode('login');
    onClose();
  };

  const handleBack = () => {
    setMode('login');
  };

  return createPortal(
    <>
      {/* Backdrop (스크롤 차단 역할 포함) */}
      <div 
        className="fixed inset-0 bg-black/50 z-[99] animate-fade-in" 
        onClick={handleClose} // 💡 [한글 주석] 어두운 배경 클릭 시에도 안전하게 닫기/리셋 처리 작동
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[calc(100dvh-72px)] bg-[var(--color-bg)] rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-[100] animate-slide-up flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-bottom-sheet-title"
      >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--color-divider)]">
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
              onClick={handleClose}
              className="p-2 -mr-2 text-[var(--text-muted)] hover:bg-[var(--color-surface-soft)] rounded-full transition-colors"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* Content (스크롤 영역) */}
          <div className="overflow-y-auto p-5 pb-10">
            <div className="w-full">
              {mode === 'login' && (
                <LoginForm 
                  onSwitchToSignup={() => setMode('signup')}
                  onSwitchToMagicLink={() => setMode('magicLink')}
                  onSwitchToFindEmail={() => setMode('findEmail')}
                  onSuccess={handleClose}
                />
              )}
              {mode === 'signup' && (
                <SignupForm 
                  onSwitchToLogin={() => setMode('login')}
                  onSuccess={handleClose}
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
    </>,
    document.body
  );
}
