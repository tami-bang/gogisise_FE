
interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, selectedValue, onChange }: SegmentedControlProps) {
  return (
    <div className="flex bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-1 gap-1">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <button
            key={opt.value}
            className={`flex-1 py-3 text-center text-label rounded-[var(--radius-md)] transition-colors ${
              isSelected 
                ? 'border-2 border-[var(--color-secondary)] bg-[var(--color-surface)] text-[var(--text-strong)]' 
                : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--text-muted)]'
            }`}
            aria-pressed={isSelected}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
