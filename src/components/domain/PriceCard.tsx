import type { PriceItem } from '../../api';
import { formatPrice } from '../../utils/formatter';
import { Badge } from '../common/Badge';

interface Props {
  item: PriceItem;
}

export function PriceCard({ item }: Props) {
  return (
    <button 
      className="w-full text-left bg-[var(--color-surface)] p-5 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft active:scale-[0.98] active:bg-[#f5f5f5] transition-transform duration-200"
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-title text-[var(--text-default)] font-bold">{item.detailName}</h3>
        <Badge status={item.status} value={item.changeValue} />
      </div>
      <div className="text-display text-[var(--text-strong)] font-bold">
        {formatPrice(item.price)}원
      </div>
    </button>
  );
}
