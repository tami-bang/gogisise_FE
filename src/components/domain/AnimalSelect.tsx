interface Props {
  onSelect: (animal: 'BEEF' | 'PORK') => void;
}

export function AnimalSelect({ onSelect }: Props) {
  return (
    <section className="px-5 py-6">
      <div className="mb-6">
        <h2 className="text-title-xl font-bold text-[var(--text-strong)] mb-1">즐겨찾기 시세</h2>
        <p className="text-body text-[var(--text-muted)]">확인할 축종을 선택하세요</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('BEEF')}
          className="flex flex-col items-center justify-center py-10 bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-divider)] shadow-soft active:scale-95 transition-transform"
          aria-label="한우 선택"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center h-16" aria-hidden="true">
              <span className="text-6xl leading-none">🐄</span>
            </div>
            <span className="text-title font-bold text-[var(--text-strong)]">한우</span>
          </div>
        </button>
        
        <button
          onClick={() => onSelect('PORK')}
          className="flex flex-col items-center justify-center py-10 bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-divider)] shadow-soft active:scale-95 transition-transform"
          aria-label="한돈 선택"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center h-16" aria-hidden="true">
              <span className="text-6xl leading-none">🐖</span>
            </div>
            <span className="text-title font-bold text-[var(--text-strong)]">한돈</span>
          </div>
        </button>
      </div>
    </section>
  );
}
