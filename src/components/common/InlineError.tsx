import { Button } from './Button';

interface Props {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function InlineError({ message, onRetry, isRetrying = false }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--color-surface-soft)] rounded-[var(--radius-xl)] border border-[var(--color-error)] text-center w-full">
      <span className="text-3xl mb-2" aria-hidden="true">⚠️</span>
      <p className="text-body text-[var(--color-error)] font-bold mb-3">{message}</p>
      
      {onRetry && (
        <Button 
          variant="secondary" 
          onClick={onRetry} 
          disabled={isRetrying}
          className="px-6 text-caption border-[var(--color-error)] text-[var(--color-error)]"
        >
          {isRetrying ? '다시 시도 중...' : '다시 시도'}
        </Button>
      )}
    </div>
  );
}
