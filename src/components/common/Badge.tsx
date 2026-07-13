import { getTrendIcon, getTrendColorClass, formatPrice } from '../../utils/formatter';

interface Props {
  status: 'UP' | 'DOWN' | 'UNCHANGED';  // 명세: UP/DOWN/UNCHANGED (이전: RISE/FALL/SAME)
  value?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export function Badge({ status, value, label, size = 'md' }: Props) {
  const bgClass = getTrendColorClass(status, 'bg');
  const textClass = getTrendColorClass(status, 'text');
  const icon = getTrendIcon(status);

  const radiusClass = size === 'sm' ? 'rounded-[var(--radius-sm)]' : 'rounded-[var(--radius-md)]';
  const textSzClass = size === 'sm' ? 'text-caption font-medium' : 'text-label font-bold';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 ${radiusClass} ${bgClass} ${textClass} ${textSzClass}`}>
      <span aria-hidden="true">{icon}</span>
      {label && <span>{label}</span>}
      {value !== undefined && <span>{formatPrice(value)}</span>}
    </span>
  );
}
