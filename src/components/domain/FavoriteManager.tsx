import { useState, useEffect } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { marketService } from '../../api/services/marketService';
import type { PriceItem } from '../../api/types/market';
import { PriceCard } from './PriceCard';
import { PriceDetailSheet } from './price-detail/PriceDetailSheet';
import { ListSkeleton } from '../common/ListSkeleton';

export function FavoriteManager() {
  const { favorites, clearAllFavorites } = useFavorites();
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFavs = async () => {
      setLoading(true);
      try {
        const result = await marketService.getFavoritePrices(favorites.map(f => f.id));
        if (isMounted) setItems(result);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFavs();
    return () => { isMounted = false; };
  }, [favorites]);

  const handleClearAll = () => {
    clearAllFavorites();
    setShowClearConfirm(false);
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
  };

  return (
    <div className="flex flex-col bg-[var(--color-surface)] h-full">
      <div className="flex justify-between items-end px-[var(--spacing-20)] py-[var(--spacing-16)] border-b border-[var(--color-divider)]">
        <div className="flex flex-col gap-[var(--spacing-4)]">
          <h3 className="text-title font-bold text-[var(--text-strong)]">즐겨찾기 관리</h3>
          <span className="text-body text-[var(--text-muted)]">총 {favorites.length}개</span>
        </div>
        {favorites.length > 0 && (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="text-label font-bold text-[var(--color-error)] active:opacity-70 transition-opacity"
          >
            전체 삭제
          </button>
        )}
      </div>

      <div className="flex-1 px-[var(--spacing-20)] py-[var(--spacing-16)] overflow-y-auto">
        {loading ? (
          <ListSkeleton count={3} />
        ) : items.length === 0 ? (
          <EmptyState 
            title="등록된 즐겨찾기가 없습니다." 
            description="전체 시세에서 자주 보는 품목을 추가해 보세요." 
          />
        ) : (
          <div className="flex flex-col gap-[var(--spacing-12)]">
            {items.map(item => (
              <PriceCard 
                key={item.id} 
                item={item} 
                onClick={handleItemClick} 
                id={`fav-manage-card-${item.id}`}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="즐겨찾기 전체 삭제"
        message={`등록된 ${favorites.length}개의 즐겨찾기를 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="전체 삭제"
        cancelText="취소"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </div>
  );
}
