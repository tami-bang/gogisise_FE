interface Props {
  onSelect: (animal: 'BEEF' | 'PORK') => void;
}

export function AnimalSelect({ onSelect }: Props) {
  return (
    <section className="h-full min-h-0 flex flex-col px-5 pt-12 pb-16">
      <div className="mb-10 text-left w-full">
        <h2 className="text-title-xl font-bold text-[var(--text-strong)] mb-2">즐겨찾기 시세</h2>
        <p className="text-body text-[var(--text-muted)]">확인할 축종을 선택하세요</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('BEEF')}
          className="relative w-full h-56 bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-divider)] shadow-soft hover:shadow-medium active:shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer"
          aria-label="한우 선택"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]" aria-hidden="true">
            <span className="text-6xl leading-none">🐄</span>
          </div>
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-title font-bold text-[var(--text-strong)] whitespace-nowrap">
            한우
          </span>
        </button>
        
        <button
          onClick={() => onSelect('PORK')}
          className="relative w-full h-56 bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-divider)] shadow-soft hover:shadow-medium active:shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer"
          aria-label="한돈 선택"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%]" aria-hidden="true">
            <span className="text-6xl leading-none">🐖</span>
          </div>
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-title font-bold text-[var(--text-strong)] whitespace-nowrap">
            한돈
          </span>
        </button>
      </div>
    </section>
  );
}
