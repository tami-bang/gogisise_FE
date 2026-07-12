import { Button } from './Button';

interface Props {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ 
  title, 
  description, 
  retryLabel = '다시 시도', 
  onRetry, 
  isRetrying = false 
}: Props) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg)] px-5">
      <div className="flex flex-col items-center text-center gap-4">
        <span className="text-6xl mb-2" aria-hidden="true">⚠️</span>
        <h2 className="text-title-xl text-[var(--text-strong)] font-bold">{title}</h2>
        <p className="text-body text-[var(--text-muted)]">{description}</p>
        
        {onRetry && (
          <Button 
            variant="primary" 
            onClick={onRetry} 
            disabled={isRetrying}
            className="mt-4 px-8"
          >
            {isRetrying ? '다시 시도하는 중...' : retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
