import { useState, useEffect, useRef } from 'react';
import { usePriceDetail } from '../../../hooks/usePriceDetail';
import { useFavorites } from '../../../hooks/useFavorites';
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
  onFavoriteRemoved?: () => void; // 즐겨찾기에서 제거 시 부모 컴포넌트 콜백
}

export function PriceDetailSheet({
  isOpen,
  itemId,
  onClose,
  onFavoriteRemoved
}: PriceDetailSheetProps) {
  const { status, detail, refetch } = usePriceDetail(isOpen ? itemId : null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  const [confirmState, setConfirmState] = useState<'idle' | 'adding' | 'removing'>('idle');
  const sheetRef = useRef<HTMLDivElement>(null);
  
  const isFav = itemId ? isFavorite(itemId) : false;

  // ESC 및 Focus Trap 제어 (ConfirmDialog가 없을 때만 활성화)
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
  }, [isOpen, confirmState, onClose]);

  // 바디 스크롤 잠금
  useEffect(() => {
    if (isOpen || confirmState !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, confirmState]);

  if (!isOpen && confirmState === 'idle') return null;

  const handleExecuteAction = () => {
    if (isFav) {
      setConfirmState('removing');
    } else {
      setConfirmState('adding');
    }
  };

  const handleConfirmAction = () => {
    if (confirmState === 'adding' && detail) {
      addFavorite({
        itemId: detail.itemId,
        animalType: detail.animalType,
        storageType: detail.storageType,
      });
      // TODO: Toast 성공 알림 추가 가능
    } else if (confirmState === 'removing' && detail) {
      removeFavorite(detail.itemId);
      if (onFavoriteRemoved) onFavoriteRemoved();
    }
    setConfirmState('idle');
    onClose(); // 확인 후 시트도 같이 닫음
  };

  const handleCancelConfirm = () => {
    setConfirmState('idle');
    // ConfirmDialog가 닫히면 포커스는 ConfirmDialog 내부 로직에 의해 원래 요소로 복원됨
  };

  // Sheet 자체의 렌더링. ConfirmDialog가 떠 있으면 inert로 비활성화
  const isSheetInert = confirmState !== 'idle';

  return (
    <>
      {/* Dimmed Overlay */}
      <div 
        className={`fixed inset-0 z-[90] bg-black/50 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (confirmState === 'idle' && e.target === e.currentTarget) onClose();
        }}
        // @ts-ignore
        inert={isSheetInert ? "" : undefined}
      />
      
      {/* Sheet Container */}
      <div 
        className={`fixed inset-0 z-[100] flex justify-center items-end pointer-events-none ${isOpen ? '' : 'pointer-events-none'}`}
        // @ts-ignore
        inert={isSheetInert ? "" : undefined}
      >
        <div 
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          className={`relative w-full max-w-md max-h-[88dvh] pointer-events-auto bg-[var(--color-surface)] rounded-t-[var(--radius-2xl)] flex flex-col transform transition-transform duration-300 shadow-[var(--shadow-modal)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* 핸들 바 */}
          <div className="flex justify-center py-3 flex-shrink-0">
            <div className="w-12 h-1.5 bg-[var(--color-disabled)] rounded-full"></div>
          </div>

          {/* 콘텐츠 영역 (단일 스크롤) */}
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
                  description="나중에 다시 시도해주세요."
                />
              </div>
            )}

            {status === 'success' && detail && (
              <>
                <DetailHeader fullDisplayName={detail.displayName} />  {/* fullDisplayName → displayName */}
                <PriceSummaryCard 
                  averagePrice={detail.averagePrice}
                  changeAmount={detail.changeAmount}          /* Nullable 허용 */
                  trendStatus={detail.trendStatus}             /* 명세: trendStatus (UP/DOWN/UNCHANGED) */
                  lowestPrice={detail.lowestPrice}             /* 명세: lowestPrice */
                  highestPrice={detail.highestPrice}           /* 명수: highestPrice */
                  participantCount={detail.participantCount}   /* 명세: participantCount */
                  sourceRecordCount={detail.sourceRecords.length}
                  unit={detail.unit}
                />
                <SourceList records={detail.sourceRecords} />
              </>
            )}

            {/* 즐겨찾기 액션 및 닫기 버튼 */}
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
        title={confirmState === 'adding' ? '즐겨찾기에 추가' : '즐겨찾기에서 삭제'}
        message={`해당 ${detail?.displayName || '품목'}을 즐겨찾기에서 ${confirmState === 'adding' ? '추가' : '삭제'}하시겠습니까?`}
        confirmText="예"
        cancelText="아니오"
        isDestructive={confirmState === 'removing'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}
