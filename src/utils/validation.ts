// src/utils/validation.ts

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  // 영문자, 숫자, 특수문자가 각각 최소 1개 이상 포함된 8자 이상 20자 이하
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
  return passwordRegex.test(password);
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // 010-XXXX-XXXX 또는 010XXXXXXXX 형식 검증
  const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

// 기존 함수들 하위 호환 유지 (폼 컴포넌트 실시간 검사 에러 반환용)
export const validateEmail = (email: string): string => {
  if (!email) return '';
  if (!isValidEmail(email)) return '올바른 이메일 형식을 입력해 주세요.';
  return '';
};

export const validateNickname = (nickname: string): string => {
  if (!nickname) return '';
  if (nickname.length < 2 || nickname.length > 10) return '닉네임은 2~10자 사이여야 합니다.';
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return '';
  if (!isValidPassword(password)) return '8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.';
  return '';
};

export const validatePasswordConfirm = (password: string, confirm: string): string => {
  if (!confirm) return '';
  if (password !== confirm) return '비밀번호가 일치하지 않습니다.';
  return '';
};

export const validatePhone = (phone: string): string => {
  if (!phone) return '';
  if (!isValidPhone(phone)) return '올바른 휴대폰 번호 형식을 입력해 주세요.';
  return '';
};
