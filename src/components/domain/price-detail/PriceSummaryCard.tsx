interface PriceSummaryCardProps {
  averagePrice: number | null;
  changeAmount: number | null;
  trendStatus: 'UP' | 'DOWN' | 'UNCHANGED';
  lowestPrice: number | null;
  highestPrice: number | null;
  participantCount: number | null;
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
  const safeAveragePrice = averagePrice ?? 0;
  const safeLowestPrice = lowestPrice ?? 0;
  const safeHighestPrice = highestPrice ?? 0;
  const safeParticipantCount = participantCount ?? 0;

  return (
    <div className="bg-[var(--color-surface-soft)] rounded-[var(--radius-lg)] p-[var(--spacing-20)] flex flex-col gap-[var(--spacing-16)]">
      <div className="flex flex-col items-center justify-center text-center gap-[var(--spacing-4)]">
        <span className="text-body text-[var(--text-muted)] font-medium">오늘 평균 시세 ({unit})</span>
        <div className="flex items-center gap-[var(--spacing-8)]">
          <span className="text-display font-bold text-[var(--text-strong)]">
            {safeAveragePrice > 0 ? `${safeAveragePrice.toLocaleString()}원` : '정보 없음'}
          </span>
        </div>
        <div className={`text-label font-bold flex items-center gap-1 ${
          isRise ? 'text-[var(--color-error)]' : isFall ? 'text-[var(--color-secondary)]' : 'text-[var(--text-muted)]'
        }`}>
          {isRise && '▲'}
          {isFall && '▼'}
          {trendStatus === 'UNCHANGED' && '-'}
          {Math.abs(changeAmount ?? 0).toLocaleString()}원
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[var(--spacing-8)] pt-[var(--spacing-16)] border-t border-[var(--color-border)]">
        <div className="flex flex-col items-center text-center">
          <span className="text-caption text-[var(--text-light)]">최저가</span>
          <span className="text-body font-bold text-[var(--color-secondary)]">{safeLowestPrice.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-[var(--color-border)]">
          <span className="text-caption text-[var(--text-light)]">최고가</span>
          <span className="text-body font-bold text-[var(--color-error)]">{safeHighestPrice.toLocaleString()}원</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-caption text-[var(--text-light)]">산출 업체</span>
          <span className="text-body font-bold text-[var(--text-strong)]">{safeParticipantCount}곳</span>
        </div>
      </div>

      {sourceRecordCount > safeParticipantCount && (
        <p className="text-center text-caption text-[var(--text-light)] mt-2">
          * 전체 수집 {sourceRecordCount}곳 중 {sourceRecordCount - safeParticipantCount}곳 제외
        </p>
      )}
    </div>
  );
}
