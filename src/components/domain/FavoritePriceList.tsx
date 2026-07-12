import type { PriceItem } from '../../api';
import { PriceCard } from './PriceCard';

interface Props {
  items: PriceItem[];
}

export function FavoritePriceList({ items }: Props) {
  if (items.length === 0) {
    return null; // 빈 화면 표시는 상위 컴포넌트(MainPage)에서 EmptyState로 처리합니다.
  }

  return (
    <div className="flex flex-col">
      {/* Sticky List Header */}
      <div className="sticky top-0 bg-[var(--color-bg)] z-40 py-3 mb-2 flex justify-between items-center text-label text-[var(--text-muted)] font-bold border-b border-[var(--color-divider)]">
        <span>종류</span>
        <span>등급</span>
      </div>
      
      {/* List Items */}
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <PriceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
