export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

export const getTrendIcon = (status: 'RISE' | 'FALL' | 'SAME') => {
  switch (status) {
    case 'RISE':
      return '▲';
    case 'FALL':
      return '▼';
    default:
      return '—';
  }
};

export const getTrendColorClass = (status: 'RISE' | 'FALL' | 'SAME', type: 'text' | 'bg' = 'text') => {
  if (type === 'text') {
    switch (status) {
      case 'RISE':
        return 'text-[var(--color-text-red)]';
      case 'FALL':
        return 'text-[var(--color-secondary)]';
      default:
        return 'text-[var(--text-muted)]';
    }
  } else {
    // badge background colors
    switch (status) {
      case 'RISE':
        return 'bg-[#ffedea]';
      case 'FALL':
        return 'bg-[#edf6fc]';
      default:
        return 'bg-[var(--color-surface-soft)]';
    }
  }
};
