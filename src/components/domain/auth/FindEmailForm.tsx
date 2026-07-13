// src/components/domain/auth/FindEmailForm.tsx

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../common/Button';
import { validatePhone } from '../../../utils/validation';

interface Props {
  onSwitchToLogin: () => void;
}

export function FindEmailForm({ onSwitchToLogin }: Props) {
  const { isLoading, error, setError } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [foundEmail, setFoundEmail] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/[^0-9-]/g, ''));
    if (error) setError(null);
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phone));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const err = validatePhone(phone);
    setPhoneError(err);
    
    if (err || !phone) return;

    // TODO: 실 통신 로직 연결. 현재는 모의(Mock)로 무조건 실패 처리 후 하드코딩된 이메일 반환
    if (phone === '010-1234-5678') {
      setFoundEmail('user@example.com');
    } else {
      setError({ errorCode: 'USER_NOT_FOUND', message: '가입된 회원 정보가 없습니다.' });
    }
  };

  const hasErrors = !!phoneError || !phone;

  if (foundEmail) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-4">
        <div className="text-4xl">📧</div>
        <h3 className="text-title font-bold text-[var(--text-strong)]">이메일 찾기 완료</h3>
        <p className="text-body text-[var(--text-muted)] text-center">
          고객님의 이메일은<br/>
          <strong className="text-[var(--color-primary)]">{foundEmail}</strong> 입니다.
        </p>
        <Button onClick={onSwitchToLogin} className="w-full mt-4 h-14">
          로그인하러 가기
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-body text-[var(--text-muted)] mb-2">
        가입 시 등록하신 휴대폰 번호를 입력해 주세요.
      </p>

      {error && (
        <div className="text-sm font-bold text-[var(--color-error)] text-center">
          {error.message}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-label text-[var(--text-strong)] font-bold">휴대폰 번호</label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          disabled={isLoading}
          className={`h-14 px-4 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${phoneError ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
          placeholder="010-0000-0000"
        />
        {phoneError && <span className="text-xs text-[var(--color-error)] mt-1">{phoneError}</span>}
      </div>

      <Button
        type="submit"
        variant={isLoading || hasErrors ? 'disabled' : 'primary'}
        disabled={isLoading || hasErrors}
        className="mt-2 h-14 text-[16px] font-bold"
      >
        {isLoading ? '검색 중...' : '이메일 찾기'}
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
