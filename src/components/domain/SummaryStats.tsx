import type { MarketSummary } from '../../api';
import { getTrendIcon, getTrendColorClass, formatPrice } from '../../utils/formatter';

interface Props {
  summary: MarketSummary;
}

export function SummaryStats({ summary }: Props) {
  const trendBg = getTrendColorClass(summary.trendStatus, 'bg');
  const trendText = getTrendColorClass(summary.trendStatus, 'text');
  const trendIcon = getTrendIcon(summary.trendStatus);

  return (
    <section className="px-5 pt-6 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-display text-(--text-strong) tracking-tight">축산 시장 종합</h2>
        <span className={`px-2 py-1 rounded-[var(--radius-sm)] ${trendBg} ${trendText} text-label font-bold flex items-center gap-1`}>
          {trendIcon} {summary.trendMessage}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 한우 암컷 스택 */}
        <div className="bg-(--color-surface) p-4 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl" aria-hidden="true">🐄</span>
            <h3 className="text-body-lg text-(--text-strong)">한우 암컷</h3>
          </div>
          <div className={`text-title-xl font-bold flex items-center gap-1 ${getTrendColorClass(summary.beefSummary.status, 'text')}`}>
            {getTrendIcon(summary.beefSummary.status)}
            {formatPrice(summary.beefSummary.value)}
          </div>
        </div>

        {/* 한돈 암컷 스택 */}
        <div className="bg-(--color-surface) p-4 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl" aria-hidden="true">🐖</span>
            <h3 className="text-body-lg text-(--text-strong)">한돈 암컷</h3>
          </div>
          <div className={`text-title-xl font-bold flex items-center gap-1 ${getTrendColorClass(summary.porkSummary.status, 'text')}`}>
            {getTrendIcon(summary.porkSummary.status)}
            {formatPrice(summary.porkSummary.value)}
          </div>
        </div>
      </div>
    </section>
  );
}
