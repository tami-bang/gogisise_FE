// src/components/domain/auth/MagicLinkForm.tsx

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { InlineError } from '../../common/InlineError';
import { Button } from '../../common/Button';
import { EmptyState } from '../../common/EmptyState';

interface Props {
  onSwitchToLogin: () => void;
}

export function MagicLinkForm({ onSwitchToLogin }: Props) {
  const { sendResetLink, isLoading, error, setError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError({ errorCode: 'INVALID_REQUEST_BODY', message: '이메일을 입력해 주세요.' });
      return;
    }

    const success = await sendResetLink(email);
    if (success) {
      setIsSent(true);
    }
  };

  if (isSent) {
    return (
      <div className="py-4">
        <EmptyState
          icon="📧"
          title="보안 링크 전송 완료"
          description={`${email}로 비밀번호 재설정 링크를 보내드렸습니다. 메일함을 확인해 주세요.`}
          actionLabel="로그인으로 돌아가기"
          onAction={onSwitchToLogin}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <InlineError message={error.message} />}

      <p className="text-body text-[var(--text-muted)] mb-2">
        가입하신 이메일을 입력하시면, 안전하게 비밀번호를 재설정할 수 있는 보안 링크를 보내드립니다.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-14 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-secondary)] focus:outline-none transition-colors"
          placeholder="example@email.com"
        />
      </div>

      <Button
        type="submit"
        variant={isLoading ? 'disabled' : 'primary'}
        disabled={isLoading}
        className="mt-2"
      >
        {isLoading ? '전송 중...' : '링크 받기'}
      </Button>

      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isLoading}
          className="text-label text-[var(--text-muted)] underline p-2"
        >
          취소하고 돌아가기
        </button>
      </div>
    </form>
  );
}
