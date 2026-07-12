import { useEffect, useRef } from 'react';
import { Button } from '../common/Button';

interface Props {
  isOpen: boolean;
  isSharing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function FavoriteShareSheet({ isOpen, isSharing, onClose, onConfirm }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap basic implementation
      sheetRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSharing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSharing, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col justify-end items-center bg-black/50 sm:justify-center"
      onClick={() => {
        if (!isSharing) onClose();
      }}
    >
      {/* Bottom Sheet Container */}
      <div 
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
        className="bg-[var(--color-surface)] w-full max-w-md rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] p-6 pt-8 pb-safe shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 text-center">
          <h2 id="share-sheet-title" className="text-title-xl font-bold text-[var(--text-strong)] mb-2">즐겨찾기 시세 공유</h2>
          <p className="text-body text-[var(--text-muted)]">
            한우·한돈의 냉장·냉동 즐겨찾기 시세를 모두 공유합니다.
          </p>
        </div>
        
        <div className="bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-4 mb-8 text-center">
          <p className="text-body-lg font-bold text-[var(--text-strong)]">
            한우 냉장 · 한우 냉동 · 한돈 냉장 · 한돈 냉동
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            variant="kakao" 
            onClick={onConfirm}
            disabled={isSharing}
            className="w-full gap-2 py-4"
          >
            {isSharing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                공유 준비 중
              </>
            ) : (
              <>
                <span className="text-2xl" aria-hidden="true">💬</span>
                카카오톡으로 공유
              </>
            )}
          </Button>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isSharing}
            className="w-full py-4 bg-[var(--color-surface-soft)] text-[var(--text-strong)] border border-[var(--color-divider)]"
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
