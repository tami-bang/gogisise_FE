import { useState, useEffect } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import type { PriceItem } from '../../api/types/market';
import { PriceCard } from './PriceCard';
import { PriceDetailSheet } from './price-detail/PriceDetailSheet';
import { ListSkeleton } from '../common/ListSkeleton';
import { useAuthContext } from '../../contexts/AuthContext'; // 💡 [한글 주석] 로그인 토큰 획득용 컨텍스트 임포트
import { favoriteService } from '../../api/services/favoriteService'; // 💡 [한글 주석] 서버 즐겨찾기 API 서비스 임포트
import { useMarketItems } from '../../hooks/useMarketItems'; // 💡 [한글 주석] 비로그인 시 로컬 조인용 마켓 데이터 훅 임포트
import { SERVER_FAVORITES_CHANGE_EVENT } from '../../hooks/useFavoritePrices'; // 💡 [한글 주석] 즐겨찾기 변경 이벤트 키 임포트

export function FavoriteManager() {
  const { accessToken, user } = useAuthContext();
  const isAuthenticated = Boolean(user && accessToken);
  const { items: marketItems } = useMarketItems({ enabled: !isAuthenticated });
  const { favorites: localFavorites, clearAllFavorites } = useFavorites();
  const { openAuthSheet } = useAuth();
  
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedInitialGrade, setSelectedInitialGrade] = useState<string | null>(null); // 💡 [한글 주석] 선택된 아이템의 초기 등급 상태

  // 💡 [한글 주석] 로그인 여부에 따라 서버/로컬 즐겨찾기 데이터를 조화롭게 불러와 상태 동기화
  useEffect(() => {
    let isMounted = true;

    const loadFavoritesData = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && accessToken) {
          // 로그인 사용자: 실제 서버 API로부터 데이터 로드
          const serverFavs = await favoriteService.getFavorites({ accessToken });
          if (isMounted) {
            setItems(serverFavs);
          }
        } else {
          // 비로그인 사용자: 로컬 스토리지 데이터와 마켓 아이템 목록 조인
          const marketById = new Map(marketItems.map((item) => [item.itemId, item]));
          const joinedFavs = localFavorites
            .map((fav) => {
              const item = marketById.get(fav.itemId);
              if (!item) return null;
              return { ...item, isFavorite: true };
            })
            .filter((item): item is PriceItem => Boolean(item));
          
          if (isMounted) {
            setItems(joinedFavs);
          }
        }
      } catch (e) {
        console.error('[FavoriteManager] Failed to load favorites:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFavoritesData();

    // 서버/로컬 즐겨찾기 실시간 갱신 이벤트 리스너 바인딩 (이벤트 즉시 새로고침 실현)
    const handleFavoritesChanged = () => {
      loadFavoritesData();
    };

    window.addEventListener(SERVER_FAVORITES_CHANGE_EVENT, handleFavoritesChanged);
    window.addEventListener('gogisise:favorites_changed', handleFavoritesChanged); // 로컬 이벤트 대응

    return () => {
      isMounted = false;
      window.removeEventListener(SERVER_FAVORITES_CHANGE_EVENT, handleFavoritesChanged);
      window.removeEventListener('gogisise:favorites_changed', handleFavoritesChanged);
    };
  }, [isAuthenticated, accessToken, marketItems, localFavorites]);

  const handleClearAll = () => {
    clearAllFavorites();
    setShowClearConfirm(false);
  };

  const handleItemClick = (id: string) => {
    // 💡 [한글 주석] 클릭된 아이템의 grade(등급)를 찾아 initialGrade 상태로 매핑
    const matchedItem = items.find(item => item.itemId === id);
    const initialGrade = matchedItem?.grade || null;
    setSelectedInitialGrade(initialGrade);
    setSelectedItemId(id);
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex justify-between items-end pt-[var(--spacing-8)] pb-[var(--spacing-16)]">
        <div className="flex flex-col gap-[var(--spacing-4)]">
          <h3 className="text-title font-bold text-[var(--text-strong)]">즐겨찾기 관리</h3>
          <span className="text-body text-[var(--text-muted)]">총 {items.length}개</span>
        </div>
        {!isAuthenticated && items.length > 0 && (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="text-label font-bold text-[var(--color-error)] active:opacity-70 transition-opacity"
          >
            전체 삭제
          </button>
        )}
      </div>

      <div className="flex-1 py-[var(--spacing-16)] overflow-y-auto">
        {!isAuthenticated && items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <EmptyState 
              title="로그인이 필요한 서비스입니다." 
              description="즐겨찾기를 이용하시려면 로그인을 진행해 주세요." 
              actionLabel="3초만에 로그인하기"
              onAction={openAuthSheet}
            />
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
        message={`등록된 ${localFavorites.length}개의 즐겨찾기를 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="전체 삭제"
        cancelText="취소"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      <PriceDetailSheet
        isOpen={selectedItemId !== null}
        itemId={selectedItemId}
        initialGrade={selectedInitialGrade} // 💡 [한글 주석] 모달창에 클릭한 품목의 등급 연동전달
        onClose={() => {
          setSelectedItemId(null);
          setSelectedInitialGrade(null);
        }}
        onFavoriteRemoved={() => {
          // 상세 시세에서 즐겨찾기 해제 시 목록을 즉시 서버에 재동기화
          if (isAuthenticated && accessToken) {
            favoriteService.getFavorites({ accessToken }).then(res => setItems(res));
          }
        }}
      />
    </div>
  );
}
