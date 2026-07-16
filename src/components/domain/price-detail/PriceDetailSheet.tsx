import { useEffect, useRef, useState } from 'react';
import { usePriceDetail } from '../../../hooks/usePriceDetail';
import { useFavoriteMutation } from '../../../hooks/useFavoriteMutation';
import { useFavoritePrices } from '../../../hooks/useFavoritePrices';
import { useViewLog } from '../../../hooks/useViewLog';
import { DetailHeader } from './DetailHeader';
import { PriceSummaryCard } from './PriceSummaryCard';
import { SourceList } from './SourceList';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { InlineError } from '../../common/InlineError';
import { ListSkeleton } from '../../common/ListSkeleton';
import { EmptyState } from '../../common/EmptyState';

interface PriceDetailSheetProps {
  isOpen: boolean;
  itemId: string | null;
  onClose: () => void;
  onFavoriteRemoved?: () => void;
}

export function PriceDetailSheet({
  isOpen,
  itemId,
  onClose,
  onFavoriteRemoved,
}: PriceDetailSheetProps) {
  const { status, detail, refetch } = usePriceDetail(isOpen ? itemId : null);
  useViewLog({ itemId, isOpen });
  const { favoriteItemIds, refetch: refetchFavorites } = useFavoritePrices({
    animalType: null,
    storageType: 'CHILLED',
    page: 1,
    limit: 9999,
  });
  const { addFavorite, removeFavorite, isMutating } = useFavoriteMutation({
    onSuccess: refetchFavorites,
  });

  const [confirmState, setConfirmState] = useState<'idle' | 'adding' | 'removing'>('idle');
  const sheetRef = useRef<HTMLDivElement>(null);
  const isFav = itemId ? favoriteItemIds.includes(itemId) : false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || confirmState !== 'idle') return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [confirmState, isOpen, onClose]);

  useEffect(() => {
    if (isOpen || confirmState !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [confirmState, isOpen]);

  if (!isOpen && confirmState === 'idle') return null;

  const handleExecuteAction = () => {
    setConfirmState(isFav ? 'removing' : 'adding');
  };

  const handleConfirmAction = async () => {
    if (!detail) {
      setConfirmState('idle');
      return;
    }

    if (confirmState === 'adding') {
      const success = await addFavorite({
        itemId: detail.itemId,
        animalType: detail.animalType,
        storageType: detail.storageType,
      });
      if (!success) {
        setConfirmState('idle');
        return;
      }
    }

    if (confirmState === 'removing') {
      const success = await removeFavorite(detail.itemId);
      if (!success) {
        setConfirmState('idle');
        return;
      }
      onFavoriteRemoved?.();
    }

    setConfirmState('idle');
    onClose();
  };

  const isSheetInert = confirmState !== 'idle';

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/50 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (confirmState === 'idle' && e.target === e.currentTarget) onClose();
        }}
        // @ts-ignore
        inert={isSheetInert ? '' : undefined}
      />

      <div
        className={`fixed inset-0 z-[100] flex justify-center items-end pointer-events-none ${isOpen ? '' : 'pointer-events-none'}`}
        // @ts-ignore
        inert={isSheetInert ? '' : undefined}
      >
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          className={`relative w-full max-w-md max-h-[88dvh] pointer-events-auto bg-[var(--color-surface)] rounded-t-[var(--radius-2xl)] flex flex-col transform transition-transform duration-300 shadow-[var(--shadow-modal)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-12 h-1.5 bg-[var(--color-disabled)] rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto px-[var(--spacing-20)] pb-[var(--spacing-32)] flex flex-col gap-[var(--spacing-32)]">
            {status === 'loading' && (
              <div className="pt-4"><ListSkeleton count={4} /></div>
            )}

            {status === 'error' && (
              <div className="pt-8">
                <InlineError message="평균 산출 정보를 불러오지 못했습니다. 다시 시도해 주세요." onRetry={refetch} />
              </div>
            )}

            {status === 'empty' && (
              <div className="pt-8">
                <EmptyState
                  title="상세 정보가 아직 준비되지 않았습니다."
                  description="잠시 후 다시 시도해 주세요."
                />
              </div>
            )}

            {status === 'success' && detail && (
              <>
                <DetailHeader fullDisplayName={detail.displayName} />
                <PriceSummaryCard
                  averagePrice={detail.averagePrice}
                  changeAmount={detail.changeAmount}
                  trendStatus={detail.trendStatus}
                  lowestPrice={detail.lowestPrice}
                  highestPrice={detail.highestPrice}
                  participantCount={detail.participantCount}
                  sourceRecordCount={detail.sourceRecords.length}
                  unit={detail.unit}
                />
                <SourceList records={detail.sourceRecords} sourceItems={detail.sourceItems} />
              </>
            )}

            {status === 'success' && detail && (
              <div className="flex gap-[var(--spacing-12)] mt-auto pt-4 border-t border-[var(--color-divider)]">
                <button
                  onClick={onClose}
                  className="flex-1 py-[var(--spacing-16)] rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] text-[var(--text-default)] font-bold text-label active:scale-[0.98] transition-transform"
                >
                  닫기
                </button>
                <button
                  onClick={handleExecuteAction}
                  disabled={isMutating}
                  className={`flex-1 py-[var(--spacing-16)] rounded-[var(--radius-lg)] font-bold text-label text-white active:scale-[0.98] transition-transform ${
                    isFav ? 'bg-[var(--color-disabled)] text-[var(--text-strong)]' : 'bg-[var(--color-secondary)]'
                  }`}
                >
                  {isFav ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState !== 'idle'}
        title={confirmState === 'adding' ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'}
        message={`해당 ${detail?.displayName || '품목'}을 즐겨찾기에서 ${confirmState === 'adding' ? '추가' : '제거'}하시겠습니까?`}
        confirmText="예"
        cancelText="아니오"
        isDestructive={confirmState === 'removing'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState('idle')}
      />
    </>
  );
}
