import type { PriceItem } from '../../api';
import { PriceCard } from './PriceCard';

interface Props {
  items: PriceItem[];
}

export function FavoritePriceList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center bg-[var(--color-surface-soft)] rounded-[var(--radius-xl)] border border-[var(--color-divider)]">
        <span className="text-4xl mb-3" aria-hidden="true">⭐</span>
        <h3 className="text-title text-[var(--text-strong)] font-bold mb-1">관심 부위가 없어요</h3>
        <p className="text-body text-[var(--text-muted)]">자주 찾는 부위를 추가해 보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map(item => (
        <PriceCard key={item.id} item={item} />
      ))}
    </div>
  );
}
