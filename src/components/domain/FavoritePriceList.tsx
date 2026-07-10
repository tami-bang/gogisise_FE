import type { PriceItem } from '../../api';
import { PriceCard } from './PriceCard';

interface Props {
  items: PriceItem[];
}

export function FavoritePriceList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-(--text-muted) text-body-lg">
        즐겨찾기 항목이 없습니다.
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
