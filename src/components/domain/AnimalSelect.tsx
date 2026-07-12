interface Props {
  onSelect: (animal: 'BEEF' | 'PORK') => void;
  selectedType?: 'BEEF' | 'PORK' | null;
  hideHeader?: boolean;
}

export function AnimalSelect({ onSelect, selectedType, hideHeader }: Props) {
  return (
    <section className={`flex flex-col ${hideHeader ? '' : 'h-full min-h-0 px-5 pt-12 pb-16'}`}>
      {!hideHeader && (
        <div className="mb-10 text-left w-full">
          <h2 className="text-title-xl font-bold text-[var(--text-strong)] mb-2">즐겨찾기 시세</h2>
          <p className="text-body text-[var(--text-muted)]">확인할 축종을 선택하세요</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('BEEF')}
          className={`relative w-full h-56 rounded-[var(--radius-2xl)] border shadow-soft hover:shadow-medium active:shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer ${
            selectedType === 'BEEF'
              ? 'bg-[var(--color-surface-soft)] border-[var(--color-secondary)] text-[var(--color-secondary)]'
              : 'bg-[var(--color-surface)] border-[var(--color-divider)] text-[var(--text-strong)]'
          }`}
          aria-label="한우 선택"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]" aria-hidden="true">
            <span className="text-6xl leading-none">🐄</span>
          </div>
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-title font-bold whitespace-nowrap">
            한우
          </span>
        </button>
        
        <button
          onClick={() => onSelect('PORK')}
          className={`relative w-full h-56 rounded-[var(--radius-2xl)] border shadow-soft hover:shadow-medium active:shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer ${
            selectedType === 'PORK'
              ? 'bg-[var(--color-surface-soft)] border-[var(--color-secondary)] text-[var(--color-secondary)]'
              : 'bg-[var(--color-surface)] border-[var(--color-divider)] text-[var(--text-strong)]'
          }`}
          aria-label="한돈 선택"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]" aria-hidden="true">
            <span className="text-6xl leading-none">🐖</span>
          </div>
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-title font-bold whitespace-nowrap">
            한돈
          </span>
        </button>
      </div>
    </section>
  );
}
