interface PriceSummaryCardProps {
  averagePrice: number;
  changeAmount: number | null;     // 명세: Nullable 허용
  trendStatus: 'UP' | 'DOWN' | 'UNCHANGED';  // 명세: UP/DOWN/UNCHANGED
  lowestPrice: number;             // 명세: lowestPrice  (이전: minPrice)
  highestPrice: number;            // 명세: highestPrice (이전: maxPrice)
  participantCount: number;        // 명세: participantCount (이전: includedCount)
  sourceRecordCount: number;
  unit: string;
}

export function PriceSummaryCard({
  averagePrice,
  changeAmount,
  trendStatus,
  lowestPrice,
  highestPrice,
  participantCount,
  sourceRecordCount,
  unit,
}: PriceSummaryCardProps) {
  const isRise = trendStatus === 'UP';
  const isFall = trendStatus === 'DOWN';

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
          {trendStatus === 'UNCHANGED' && '-'}
          {/* changeAmount null 별 대응: 0 표시 */}
          {Math.abs(changeAmount ?? 0).toLocaleString()}원
        </div>
      </div>

      {/* 요약 대시보드 */}
      <div className="grid grid-cols-3 gap-[var(--spacing-8)] pt-[var(--spacing-16)] border-t border-[var(--color-border)]">
        <div className="flex flex-col items-center text-center">
          <span className="text-caption text-[var(--text-light)]">최저가</span>
          <span className="text-body font-bold text-[var(--color-secondary)]">{lowestPrice.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-[var(--color-border)]">
          <span className="text-caption text-[var(--text-light)]">최고가</span>
          <span className="text-body font-bold text-[var(--color-error)]">{highestPrice.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-caption text-[var(--text-light)]">산출 업체</span>
          <span className="text-body font-bold text-[var(--text-strong)]">{participantCount}곳</span>
        </div>
      </div>
      
      {sourceRecordCount > participantCount && (
        <p className="text-center text-caption text-[var(--text-light)] mt-2">
          * 전체 수집 {sourceRecordCount}곳 중 {sourceRecordCount - participantCount}곳 제외
        </p>
      )}
    </div>
  );
}
