import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClosed?: () => void; // 닫힌 후 포커스 복원용
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '예',
  cancelText = '아니오',
  isDestructive = false,
  onConfirm,
  onCancel,
  onClosed,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      // Focus trap setup: focus the dialog container or first button
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    } else {
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
        if (onClosed) onClosed();
      }
    }
  }, [isOpen, onClosed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
      
      // Simple focus trap
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          const firstElement = focusable[0] as HTMLElement;
          const lastElement = focusable[focusable.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true); // true for capturing phase
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] w-full max-w-sm p-[var(--spacing-24)] shadow-[var(--shadow-medium)] flex flex-col gap-[var(--spacing-16)]">
        <h2 id="confirm-dialog-title" className="text-title font-bold">
          {title}
        </h2>
        
        {message && (
          <p className="text-body text-[var(--text-muted)]">
            {message}
          </p>
        )}
        
        <div className="flex gap-[var(--spacing-8)] mt-[var(--spacing-8)]">
          <button
            onClick={onCancel}
            className="flex-1 py-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[var(--text-default)] font-bold text-label active:scale-[0.98] transition-transform"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-[var(--spacing-12)] rounded-[var(--radius-md)] font-bold text-label active:scale-[0.98] transition-transform text-white ${
              isDestructive ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
