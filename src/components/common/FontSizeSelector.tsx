import { useSettings } from '../../hooks/useSettings';
import type { FontSize } from '../../hooks/useSettings';

export function FontSizeSelector() {
  const { settings, updateFontSize } = useSettings();

  const options: { label: string; value: FontSize }[] = [
    { label: '보통', value: 'normal' },
    { label: '크게', value: 'large' },
    { label: '가장 크게', value: 'xlarge' },
  ];

  return (
    <div className="w-full flex flex-col gap-[var(--spacing-16)] py-[var(--spacing-20)]">
      <div className="flex flex-col gap-[var(--spacing-8)]">
        <h3 className="text-title font-bold text-[var(--text-strong)]">화면 글자 크기</h3>
        <p className="text-body text-[var(--text-muted)]">
          앱 전체의 글자 크기를 조절합니다.
        </p>
      </div>

      <div className="flex gap-[var(--spacing-8)]">
        {options.map((opt) => {
          const isSelected = settings.fontSize === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => updateFontSize(opt.value)}
              className={`flex-1 py-[var(--spacing-12)] rounded-[var(--radius-md)] border text-label font-bold transition-all active:scale-[0.98] ${
                isSelected 
                  ? 'border-[var(--color-secondary)] bg-[var(--color-surface-soft)] text-[var(--color-secondary)]' 
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--text-muted)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
