import { selectableStateClass } from '../../utils/styles';

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
              isSelected ? selectableStateClass.active : selectableStateClass.inactive
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
