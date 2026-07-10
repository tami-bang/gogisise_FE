import type { PriceItem } from '../../api';
import { getTrendIcon, getTrendColorClass, formatPrice } from '../../utils/formatter';

interface Props {
  item: PriceItem;
}

export function PriceCard({ item }: Props) {
  const trendBg = getTrendColorClass(item.status, 'bg');
  const trendText = getTrendColorClass(item.status, 'text');
  const trendIcon = getTrendIcon(item.status);

  return (
    <button 
      className="w-full text-left bg-(--color-surface) p-5 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft active:scale-[0.98] active:bg-[#f5f5f5] transition-transform duration-200"
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-title text-(--text-default) font-bold">{item.name}</h3>
        {item.status !== 'SAME' && (
          <span className={`px-2 py-1 rounded-[var(--radius-sm)] ${trendBg} ${trendText} text-label font-bold flex items-center gap-1`}>
            {trendIcon} {formatPrice(item.changeValue)}
          </span>
        )}
      </div>
      <div className="text-display text-(--text-strong) font-bold">
        {formatPrice(item.price)}원
      </div>
    </button>
  );
}
