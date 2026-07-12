export function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse px-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-full bg-[var(--color-surface)] p-5 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft">
          <div className="flex justify-between items-center mb-3">
            <div className="h-6 bg-[var(--color-surface-soft)] rounded w-1/3"></div>
            <div className="h-6 bg-[var(--color-surface-soft)] rounded w-16"></div>
          </div>
          <div className="h-8 bg-[var(--color-surface-soft)] rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
