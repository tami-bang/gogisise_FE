import type { PriceItem } from '../../api';
import { formatPrice } from '../../utils/formatter';
import { Badge } from '../common/Badge';

interface Props {
  item: PriceItem;
  onClick?: (id: string) => void;
  id?: string;
}

export function PriceCard({ item, onClick, id }: Props) {
  const gradeDisplay = item.grade || '-';
  const nameDisplay = item.displayName ?? item.detailName;
  
  return (
    <button 
      id={id}
      onClick={() => onClick && onClick(item.id)}
      className="w-full text-left bg-[var(--color-surface)] p-5 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft active:scale-[0.98] active:bg-[#f5f5f5] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-body-lg text-[var(--text-default)] font-bold">{nameDisplay}</span>
        <span className="text-label text-[var(--text-muted)]">{gradeDisplay}</span>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-title-xl text-[var(--text-strong)] font-bold tracking-tight">
          {formatPrice(item.price)}원
        </div>
        <Badge status={item.status} value={item.changeValue} />
      </div>
    </button>
  );
}
