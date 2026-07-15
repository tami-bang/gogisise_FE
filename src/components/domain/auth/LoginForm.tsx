// src/components/domain/auth/LoginForm.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../common/Button';
import { validateEmail } from '../../../utils/validation';

interface Props {
  onSwitchToSignup: () => void;
  onSwitchToMagicLink: () => void;
  onSwitchToFindEmail: () => void;
  onSuccess: () => void;
}

export function LoginForm({ onSwitchToSignup, onSwitchToMagicLink, onSwitchToFindEmail, onSuccess }: Props) {
  const { login, isLoading, error: apiError, setError: setApiError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);

  useEffect(() => {
    let timer: number;
    if (lockoutEndTime) {
      timer = window.setInterval(() => {
        const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutEndTime(null);
          setLoginAttempts(0);
          setLockRemainingSeconds(0);
        } else {
          setLockRemainingSeconds(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutEndTime]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (apiError) setApiError(null);
    if (emailError) {
      setEmailError(validateEmail(e.target.value));
    }
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (apiError) setApiError(null);
    if (passwordError && e.target.value) {
      setPasswordError('');
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('비밀번호를 입력해 주세요.');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutEndTime) return;
    
    const eErr = validateEmail(email);
    setEmailError(eErr);
    
    if (!password) {
      setPasswordError('비밀번호를 입력해 주세요.');
    }

    if (eErr || !password) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      setLoginAttempts(0);
      onSuccess();
    } else {
      setLoginAttempts(prev => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          setLockoutEndTime(Date.now() + 30 * 1000);
        }
        return newCount;
      });
    }
  };

  const isLocked = lockoutEndTime !== null;
  const hasErrors = !!emailError || !!passwordError || !email || !password;
  const isActuallyDisabled = isLoading || isLocked || hasErrors;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Logo & Title */}
      <div className="flex flex-col items-center justify-center pt-0 pb-2 gap-1">
        <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white mb-1 shadow-sm transition-transform hover:scale-105">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        </div>
        <h3 className="text-title-lg font-bold text-[var(--color-primary)] leading-tight">도매 시세</h3>
        <p className="text-caption text-[var(--text-muted)] text-center leading-normal">베테랑 사장님을 위한 실시간 고기 시세 서비스</p>
      </div>

      {apiError && !isLocked && (
        <div className="text-sm font-bold text-[var(--color-error)] text-center">
          {apiError.message}
        </div>
      )}
      
      {isLocked && (
        <div className="bg-[#ffedea] text-[var(--color-error)] p-2.5 rounded-[var(--radius-md)] text-sm font-bold text-center">
          비밀번호 5회 오류로 로그인 잠금<br/>
          {lockRemainingSeconds}초 후 다시 시도해 주세요.
        </div>
      )}

      {/* Inputs */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <label className="text-label text-[var(--text-strong)] font-bold">이메일</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            disabled={isLoading || isLocked}
            className={`h-12 px-4 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${emailError ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
            placeholder="example@domain.com"
          />
          {emailError && <span className="text-xs text-red-500 mt-0.5">{emailError}</span>}
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-label text-[var(--text-strong)] font-bold">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              disabled={isLoading || isLocked}
              className={`w-full h-12 px-4 pr-12 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${passwordError ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
              placeholder="비밀번호를 입력하세요"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-1 active:scale-95"
              aria-label="비밀번호 표시 토글"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          {passwordError && <span className="text-xs text-[var(--color-error)] mt-0.5">{passwordError}</span>}
          <div className="flex justify-center items-center mt-2 mb-1 gap-2 text-sm text-[var(--text-muted)]">
            <button type="button" onClick={onSwitchToFindEmail} className="hover:underline">이메일을 찾고 싶어요</button>
            <span className="text-[var(--color-divider)]">|</span>
            <button type="button" onClick={onSwitchToMagicLink} className="hover:underline">비밀번호를 찾고 싶어요</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        <Button
          type="submit"
          variant={isActuallyDisabled ? 'disabled' : 'primary'}
          disabled={isActuallyDisabled}
          className="h-12 text-[16px] font-bold"
        >
          {isLocked ? `${lockRemainingSeconds}초 후 다시 시도` : (isLoading ? '로그인 중...' : '로그인')}
        </Button>

        <div className="flex justify-center text-sm">
          <span className="text-[var(--text-muted)] mr-1">계정이 없으신가요?</span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            disabled={isLoading || isLocked}
            className="text-[var(--color-primary)] font-bold hover:underline"
          >
            회원가입
          </button>
        </div>
      </div>

      {/* 간편 로그인 */}
      <div className="mt-3 mb-0">
        <div className="relative flex items-center justify-center mb-3">
          <div className="absolute w-full border-t border-[var(--color-divider)]"></div>
          <span className="bg-[var(--color-bg)] px-4 text-xs text-[var(--text-muted)] relative z-10">간편 로그인</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => alert('준비 중입니다.')}
            className="flex-1 h-11 bg-[#FEE500] text-[#000000] rounded-[var(--radius-md)] flex items-center justify-center font-bold text-sm active:scale-95 transition-transform shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4C6.477 4 2 7.556 2 11.944C2 14.654 3.738 17.042 6.425 18.36L5.342 22.316C5.237 22.696 5.666 23.013 5.992 22.812L10.743 19.865C11.154 19.897 11.572 19.894 12 19.894C17.523 19.894 22 16.338 22 11.944C22 7.556 17.523 4 12 4Z" />
            </svg>
            카카오톡으로 로그인하기
          </button>
        </div>
      </div>
    </form>
  );
}
