export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

export const getTrendIcon = (status: 'UP' | 'DOWN' | 'UNCHANGED') => {
  switch (status) {
    case 'UP':   return '▲';  // 명세: UP (이전: RISE)
    case 'DOWN': return '▼';  // 명세: DOWN (이전: FALL)
    default:     return '—';  // UNCHANGED
  }
};

export const getTrendColorClass = (status: 'UP' | 'DOWN' | 'UNCHANGED', type: 'text' | 'bg' = 'text') => {
  if (type === 'text') {
    switch (status) {
      case 'UP':   return 'text-[var(--color-text-red)]';   // 상승: 빨간
      case 'DOWN': return 'text-[var(--color-secondary)]';  // 하락: 파란
      default:     return 'text-[var(--text-muted)]';       // 보합
    }
  } else {
    switch (status) {
      case 'UP':   return 'bg-[#ffedea]';
      case 'DOWN': return 'bg-[#edf6fc]';
      default:     return 'bg-[var(--color-surface-soft)]';
    }
  }
};
