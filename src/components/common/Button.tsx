import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'kakao' | 'disabled';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', disabled, ...props }: Props) {
  let variantClass = '';
  // 명세: 최소 56px, 반경 radius-lg(16px), 텍스트 text-body-lg 이상, active:scale-[0.98]
  const baseClass = 'min-h-[56px] min-w-[56px] px-4 rounded-[var(--radius-lg)] text-body-lg flex items-center justify-center font-bold active:scale-[0.98] transition-transform duration-200';

  const isActuallyDisabled = disabled || variant === 'disabled';

  if (isActuallyDisabled) {
    variantClass = 'bg-[var(--color-disabled)] text-white pointer-events-none';
  } else {
    switch (variant) {
      case 'primary':
        variantClass = 'bg-[var(--color-primary)] text-[var(--text-inverse)] active:bg-[#d13916]';
        break;
      case 'secondary':
        variantClass = 'bg-[#ffedea] text-[var(--color-primary)] border border-[var(--color-primary)]';
        break;
      case 'kakao':
        variantClass = 'bg-[var(--color-point-yellow)] text-[var(--text-strong)]';
        break;
    }
  }

  return (
    <button
      className={`${baseClass} ${variantClass} ${className}`}
      disabled={isActuallyDisabled}
      {...props}
    >
      {children}
    </button>
  );
}
