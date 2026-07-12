interface PriceSummaryCardProps {
  averagePrice: number;
  changeAmount: number;
  status: 'RISE' | 'FALL' | 'SAME';
  minPrice: number;
  maxPrice: number;
  includedCount: number;
  sourceRecordCount: number;
  unit: string;
}

export function PriceSummaryCard({
  averagePrice,
  changeAmount,
  status,
  minPrice,
  maxPrice,
  includedCount,
  sourceRecordCount,
  unit,
}: PriceSummaryCardProps) {
  const isRise = status === 'RISE';
  const isFall = status === 'FALL';

  return (
    <div className="bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-[var(--spacing-20)] flex flex-col gap-[var(--spacing-16)]">
      {/* 평균 시세 메인 표시 */}
      <div className="flex flex-col items-center justify-center text-center gap-[var(--spacing-4)]">
        <span className="text-body text-[var(--text-muted)] font-medium">오늘 평균 시세 ({unit})</span>
        <div className="flex items-center gap-[var(--spacing-8)]">
          <span className="text-display font-bold text-[var(--text-strong)]">
            {averagePrice.toLocaleString()}원
          </span>
        </div>
        <div className={`text-label font-bold flex items-center gap-1 ${
          isRise ? 'text-[var(--color-error)]' : isFall ? 'text-[var(--color-secondary)]' : 'text-[var(--text-muted)]'
        }`}>
          {isRise && '▲'}
          {isFall && '▼'}
          {status === 'SAME' && '-'}
          {Math.abs(changeAmount).toLocaleString()}원
        </div>
      </div>

      {/* 요약 대시보드 */}
      <div className="grid grid-cols-3 gap-[var(--spacing-8)] pt-[var(--spacing-16)] border-t border-[var(--color-border)]">
        <div className="flex flex-col items-center text-center">
          <span className="text-caption text-[var(--text-light)]">최저가</span>
          <span className="text-body font-bold text-[var(--color-secondary)]">{minPrice.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-[var(--color-border)]">
          <span className="text-caption text-[var(--text-light)]">최고가</span>
          <span className="text-body font-bold text-[var(--color-error)]">{maxPrice.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-caption text-[var(--text-light)]">산출 업체</span>
          <span className="text-body font-bold text-[var(--text-strong)]">{includedCount}곳</span>
        </div>
      </div>
      
      {sourceRecordCount > includedCount && (
        <p className="text-center text-caption text-[var(--text-light)] mt-2">
          * 총 수집된 {sourceRecordCount}곳 중 이상치/품절 {sourceRecordCount - includedCount}곳 제외
        </p>
      )}
    </div>
  );
}
