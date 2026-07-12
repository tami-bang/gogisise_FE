import { Button } from './Button';

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, icon = '📭' }: Props) {
  return (
    <div className="py-12 px-5 flex flex-col items-center justify-center text-center bg-[var(--color-surface-soft)] rounded-[var(--radius-xl)] border border-[var(--color-divider)]">
      <span className="text-5xl mb-4" aria-hidden="true">{icon}</span>
      <h3 className="text-title text-[var(--text-strong)] font-bold mb-2">{title}</h3>
      <p className="text-body text-[var(--text-muted)] mb-6 whitespace-pre-line">{description}</p>
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
