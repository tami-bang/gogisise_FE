import type { PriceItem } from '../../api';
import { PriceCard } from './PriceCard';

interface Props {
  items: PriceItem[];
  onItemClick?: (id: string) => void;
}

export function FavoritePriceList({ items, onItemClick }: Props) {
  if (items.length === 0) {
    return null; // 빈 화면 표시는 상위 컴포넌트(MainPage)에서 EmptyState로 처리합니다.
  }

  return (
    <div className="flex flex-col">
      {/* Sticky List Header */}
      <div 
        id="price-list-header" 
        tabIndex={-1} 
        className="sticky top-[72px] bg-[var(--color-bg)] z-30 py-3 mb-2 flex justify-between items-center text-label text-[var(--text-muted)] font-bold border-b border-[var(--color-divider)] focus:outline-none"
      >
        <span>종류</span>
        <span>등급</span>
      </div>
      
      {/* List Items */}
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <PriceCard 
            key={item.id} 
            item={item} 
            onClick={onItemClick}
            id={`main-price-card-${item.id}`} 
          />
        ))}
      </div>
    </div>
  );
}
