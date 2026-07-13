// src/components/domain/auth/SignupForm.tsx

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../common/Button';
import {
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
  validatePhone
} from '../../../utils/validation';

interface Props {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export function SignupForm({ onSwitchToLogin, onSuccess }: Props) {
  const { signup, isLoading, error: apiError, setError: setApiError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const [isAgreed, setIsAgreed] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    phone: ''
  });

  const handleBlur = (field: keyof typeof errors) => {
    validateField(field);
  };

  const validateField = (field: keyof typeof errors, valueOverride?: { [key: string]: string }) => {
    setErrors(prev => {
      const next = { ...prev };
      const currentEmail = valueOverride?.email ?? email;
      const currentNickname = valueOverride?.nickname ?? nickname;
      const currentPassword = valueOverride?.password ?? password;
      const currentConfirm = valueOverride?.passwordConfirm ?? passwordConfirm;
      const currentPhone = valueOverride?.phone ?? phone;

      if (field === 'email') next.email = validateEmail(currentEmail);
      if (field === 'nickname') next.nickname = validateNickname(currentNickname);
      if (field === 'password') {
        next.password = validatePassword(currentPassword);
        if (currentConfirm) next.passwordConfirm = validatePasswordConfirm(currentPassword, currentConfirm);
      }
      if (field === 'passwordConfirm') next.passwordConfirm = validatePasswordConfirm(currentPassword, currentConfirm);
      if (field === 'phone') next.phone = validatePhone(currentPhone);
      return next;
    });
  };

  const handleChange = (field: keyof typeof errors, value: string) => {
    if (apiError) setApiError(null);
    if (field === 'email') setEmail(value);
    if (field === 'nickname') setNickname(value);
    
    if (field === 'phone') {
      // 숫자만 추출 후 하이픈 자동 포매팅
      const raw = value.replace(/[^0-9]/g, '');
      let formatted = raw;
      if (raw.length > 3 && raw.length <= 7) {
        formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
      } else if (raw.length > 7) {
        formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
      }
      setPhone(formatted);
      if (errors.phone) validateField('phone', { phone: formatted });
      return;
    }

    if (field === 'password') {
      setPassword(value);
      // 비밀번호가 변경되면 비밀번호 확인도 실시간으로 다시 검사해야 함
      if (errors.password || passwordConfirm) {
        validateField('password', { password: value });
      }
      return;
    }

    if (field === 'passwordConfirm') {
      setPasswordConfirm(value);
      // 확인창 타이핑 시 에러가 있거나 비밀번호가 이미 입력되어 있으면 실시간 검사
      if (errors.passwordConfirm || password) {
        validateField('passwordConfirm', { passwordConfirm: value });
      }
      return;
    }

    // 만약 이미 에러가 떠있던 필드라면, 타이핑할 때마다 실시간으로 에러를 지워주기 위해 검사
    if (errors[field]) {
      validateField(field, { [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiError) setApiError(null);

    const emailErr = validateEmail(email);
    const nicknameErr = validateNickname(nickname);
    const passErr = validatePassword(password);
    const confirmErr = validatePasswordConfirm(password, passwordConfirm);
    const phoneErr = validatePhone(phone);

    setErrors({
      email: emailErr,
      nickname: nicknameErr,
      password: passErr,
      passwordConfirm: confirmErr,
      phone: phoneErr
    });

    if (emailErr || nicknameErr || passErr || confirmErr || phoneErr || !isAgreed) {
      if (!isAgreed) {
        setApiError({ errorCode: 'TERMS_NOT_AGREED', message: '이용약관에 동의해 주세요.' });
      }
      return;
    }

    const success = await signup(email, password, nickname, phone);
    if (success) {
      onSuccess();
    }
  };

  const hasErrors = !!errors.email || !!errors.nickname || !!errors.password || !!errors.passwordConfirm || !!errors.phone || !email || !nickname || !password || !passwordConfirm || !phone;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Top Profile Icon */}
      <div className="flex justify-center pt-2 pb-6">
        <div className="w-20 h-20 bg-[#FEE4E1] rounded-full flex items-center justify-center text-[var(--color-primary)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      {apiError && (
        <div className="text-sm font-bold text-[var(--color-error)] text-center mb-2">
          {apiError.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-label text-[var(--text-strong)] font-bold">이메일 주소</label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            disabled={isLoading}
            className={`h-14 px-4 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${errors.email ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
            placeholder="example@email.com"
          />
          {errors.email && <span className="text-xs text-[var(--color-error)] mt-1">{errors.email}</span>}
        </div>

        {/* Nickname */}
        <div className="flex flex-col gap-1">
          <label className="text-label text-[var(--text-strong)] font-bold">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            onBlur={() => handleBlur('nickname')}
            disabled={isLoading}
            className={`h-14 px-4 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${errors.nickname ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
            placeholder="고기왕사장님"
          />
          {errors.nickname && <span className="text-xs text-[var(--color-error)] mt-1">{errors.nickname}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-label text-[var(--text-strong)] font-bold">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              className={`w-full h-14 px-4 pr-12 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${errors.password ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
              placeholder="비밀번호를 입력하세요"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-1 active:scale-95"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          {errors.password ? (
            <span className="text-xs text-[var(--color-error)] mt-1">{errors.password}</span>
          ) : (
            <span className="text-xs text-[var(--text-muted)] mt-1 font-medium">8자 이상, 영문 및 숫자 조합</span>
          )}
        </div>

        {/* Password Confirm */}
        <div className="flex flex-col gap-1">
          <label className="text-label text-[var(--text-strong)] font-bold">비밀번호 확인</label>
          <div className="relative">
            <input
              type={showPasswordConfirm ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => handleChange('passwordConfirm', e.target.value)}
              onBlur={() => handleBlur('passwordConfirm')}
              disabled={isLoading}
              className={`w-full h-14 px-4 pr-12 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${errors.passwordConfirm ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
              placeholder="비밀번호를 한 번 더 입력하세요"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-1 active:scale-95"
            >
              {showPasswordConfirm ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
          {errors.passwordConfirm && <span className="text-xs text-[var(--color-error)] mt-1">{errors.passwordConfirm}</span>}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-label text-[var(--text-strong)] font-bold">휴대폰 번호</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            disabled={isLoading}
            className={`h-14 px-4 rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-body transition-colors focus:outline-none ${errors.phone ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'}`}
            placeholder="010-0000-0000"
          />
          {errors.phone && <span className="text-xs text-[var(--color-error)] mt-1">{errors.phone}</span>}
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 mt-4 mb-2 p-4 bg-[var(--color-surface-soft)] rounded-[var(--radius-md)]">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-[var(--color-bg)] cursor-pointer"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="terms-checkbox" className="text-sm font-bold text-[var(--text-strong)] cursor-pointer">
            전체 약관에 동의합니다
          </label>
          <button type="button" className="text-xs text-[var(--text-muted)] underline text-left mt-1 w-fit">
            이용약관 및 개인정보 처리방침 보기
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          variant={isLoading || !isAgreed || hasErrors ? 'disabled' : 'primary'}
          disabled={isLoading || !isAgreed || hasErrors}
          className="h-14 text-[16px] font-bold"
        >
          {isLoading ? '가입 처리 중...' : '회원가입 완료'}
        </Button>

        <div className="flex justify-center text-sm mb-4">
          <span className="text-[var(--text-muted)] mr-1">이미 계정이 있으신가요?</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="text-[var(--color-primary)] font-bold hover:underline"
          >
            로그인
          </button>
        </div>
      </div>
    </form>
  );
}
