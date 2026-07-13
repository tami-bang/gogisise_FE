// src/components/domain/auth/LoginForm.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { InlineError } from '../../common/InlineError';
import { Button } from '../../common/Button';

interface Props {
  onSwitchToSignup: () => void;
  onSwitchToMagicLink: () => void;
  onSuccess: () => void;
}

export function LoginForm({ onSwitchToSignup, onSwitchToMagicLink, onSuccess }: Props) {
  const { login, isLoading, error, setError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Brute Force Defense State
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutEndTime) return;
    if (!email || !password) {
      setError({ errorCode: 'INVALID_REQUEST_BODY', message: '이메일과 비밀번호를 모두 입력해 주세요.' });
      return;
    }

    const success = await login(email, password);
    if (success) {
      setLoginAttempts(0);
      onSuccess();
    } else {
      setLoginAttempts(prev => {
        const newCount = prev + 1;
        console.debug('[LoginForm] Login attempts:', newCount);
        if (newCount >= 5) {
          setLockoutEndTime(Date.now() + 30 * 1000); // Lock for 30 seconds
        }
        return newCount;
      });
    }
  };

  const isLocked = lockoutEndTime !== null;
  const isActuallyDisabled = isLoading || isLocked;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && !isLocked && (
        <InlineError message={error.message} />
      )}
      
      {isLocked && (
        <div className="bg-[#ffedea] text-[var(--color-text-red)] p-3 rounded-[var(--radius-md)] text-sm font-bold text-center">
          비밀번호 5회 오류로 로그인 잠금<br/>
          {lockRemainingSeconds}초 후 다시 시도해 주세요.
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isActuallyDisabled}
          className="h-14 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-body focus:border-[var(--color-secondary)] focus:outline-none transition-colors"
          placeholder="example@email.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isActuallyDisabled}
          className="h-14 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-body focus:border-[var(--color-secondary)] focus:outline-none transition-colors"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <Button
        type="submit"
        variant={isActuallyDisabled ? 'disabled' : 'primary'}
        disabled={isActuallyDisabled}
        className="mt-2"
      >
        {isLocked ? `${lockRemainingSeconds}초 후 다시 시도` : (isLoading ? '로그인 중...' : '로그인')}
      </Button>

      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={onSwitchToSignup}
          disabled={isActuallyDisabled}
          className="text-label text-[var(--color-secondary)] underline p-2"
        >
          회원가입
        </button>
        <button
          type="button"
          onClick={onSwitchToMagicLink}
          disabled={isActuallyDisabled}
          className="text-label text-[var(--text-muted)] underline p-2"
        >
          비밀번호를 잊으셨나요?
        </button>
      </div>
    </form>
  );
}
