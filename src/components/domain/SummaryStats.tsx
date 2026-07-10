import type { MarketSummary } from '../../api';
import { getTrendIcon, getTrendColorClass, formatPrice } from '../../utils/formatter';
import { Badge } from '../common/Badge';

interface Props {
  summary: MarketSummary;
}

export function SummaryStats({ summary }: Props) {
  return (
    <section className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-center gap-2 mb-6">
        <h2 className="text-display text-[var(--text-strong)] tracking-tight">축산 시장 종합</h2>
        <Badge status={summary.trendStatus} label={summary.trendMessage} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 한우 스택 */}
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl" aria-hidden="true">🐄</span>
            <h3 className="text-body-lg text-[var(--text-strong)] font-bold">한우</h3>
          </div>
          <div className={`text-display font-bold flex items-center gap-1 ${getTrendColorClass(summary.beefSummary.status, 'text')}`}>
            {getTrendIcon(summary.beefSummary.status)}
            {formatPrice(summary.beefSummary.value)}
          </div>
        </div>

        {/* 한돈 스택 */}
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl" aria-hidden="true">🐖</span>
            <h3 className="text-body-lg text-[var(--text-strong)] font-bold">한돈</h3>
          </div>
          <div className={`text-display font-bold flex items-center gap-1 ${getTrendColorClass(summary.porkSummary.status, 'text')}`}>
            {getTrendIcon(summary.porkSummary.status)}
            {formatPrice(summary.porkSummary.value)}
          </div>
        </div>
      </div>
    </section>
  );
}
