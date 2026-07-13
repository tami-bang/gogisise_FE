// src/components/domain/auth/SignupForm.tsx

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { InlineError } from '../../common/InlineError';
import { Button } from '../../common/Button';

interface Props {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export function SignupForm({ onSwitchToLogin, onSuccess }: Props) {
  const { signup, isLoading, error, setError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !passwordConfirm) {
      setError({ errorCode: 'INVALID_REQUEST_BODY', message: '모든 필드를 입력해 주세요.' });
      return;
    }
    if (password !== passwordConfirm) {
      setError({ errorCode: 'INVALID_REQUEST_BODY', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    const success = await signup(email, password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <InlineError message={error.message} />}

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-14 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-secondary)] focus:outline-none transition-colors"
          placeholder="가입할 이메일 주소"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="h-14 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-secondary)] focus:outline-none transition-colors"
          placeholder="8자 이상 특수문자 포함"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">비밀번호 확인</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={isLoading}
          className="h-14 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-secondary)] focus:outline-none transition-colors"
          placeholder="비밀번호 한 번 더 입력"
        />
      </div>

      <Button
        type="submit"
        variant={isLoading ? 'disabled' : 'primary'}
        disabled={isLoading}
        className="mt-2"
      >
        {isLoading ? '가입 처리 중...' : '가입하기'}
      </Button>

      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="text-label text-[var(--color-secondary)] underline p-2"
        >
          이미 계정이 있으신가요? 로그인
        </button>
      </div>
    </form>
  );
}
