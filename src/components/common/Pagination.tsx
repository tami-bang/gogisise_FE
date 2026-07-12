interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        className="text-[var(--text-strong)] font-bold text-body-lg disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed px-4 py-2"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
      >
        이전
      </button>
      <span className="text-[var(--text-default)] text-body">
        {currentPage} / {totalPages}
      </span>
      <button
        className="text-[var(--text-strong)] font-bold text-body-lg disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed px-4 py-2"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
      >
        다음
      </button>
    </div>
  );
}
