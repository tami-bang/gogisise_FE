import { useState, useEffect } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { marketService } from '../../api/services/marketService';
import type { PriceItem } from '../../api/types/market';
import { PriceCard } from './PriceCard';
import { PriceDetailSheet } from './price-detail/PriceDetailSheet';
import { ListSkeleton } from '../common/ListSkeleton';

export function FavoriteManager() {
  const { favorites, clearAllFavorites } = useFavorites();
  const { isAuthenticated, openAuthSheet } = useAuth();
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Auth Guard 및 데이터 격리 규칙 적용
    if (!isAuthenticated) {
      if (isMounted) {
        setItems([]);
        setLoading(false);
      }
      return;
    }

    // 로그인된 유저: 기존 로컬 스토리지 무시, 철저하게 DB 기반 목록 로드 시뮬레이션
    const fetchFavs = async () => {
      setLoading(true);
      try {
        // TODO: 실제 DB 기반 유저별 즐겨찾기 API 연동 필요 (USER_SERVED_SPEC 2.1)
        // 가입 직후라면 빈 목록이므로 임시로 빈 배열을 반환합니다.
        const result: PriceItem[] = []; 
        if (isMounted) setItems(result);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFavs();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleClearAll = () => {
    clearAllFavorites();
    setShowClearConfirm(false);
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex justify-between items-end pt-[var(--spacing-8)] pb-[var(--spacing-16)]">
        <div className="flex flex-col gap-[var(--spacing-4)]">
          <h3 className="text-title font-bold text-[var(--text-strong)]">즐겨찾기 관리</h3>
          <span className="text-body text-[var(--text-muted)]">총 {isAuthenticated ? items.length : 0}개</span>
        </div>
        {isAuthenticated && items.length > 0 && (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="text-label font-bold text-[var(--color-error)] active:opacity-70 transition-opacity"
          >
            전체 삭제
          </button>
        )}
      </div>

      <div className="flex-1 py-[var(--spacing-16)] overflow-y-auto">
        {!isAuthenticated ? (
          <div className="h-full flex flex-col items-center justify-center gap-[var(--spacing-16)]">
            <EmptyState 
              title="로그인이 필요한 서비스입니다." 
              description="즐겨찾기를 이용하시려면 로그인을 진행해 주세요." 
            />
            <button
              onClick={openAuthSheet}
              className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-xl)] active:scale-95 transition-transform"
            >
              3초만에 로그인하기
            </button>
          </div>
        ) : loading ? (
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
                key={item.itemId}
                item={item} 
                onClick={handleItemClick} 
                id={`fav-manage-card-${item.itemId}`}
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
