import type { MarketSummary } from '../../api';
import { getTrendIcon, getTrendColorClass, formatPrice } from '../../utils/formatter';
import { Badge } from '../common/Badge';
import { selectableStateClass } from '../../utils/styles';

interface Props {
  summary: MarketSummary;
  onClickCard?: (animal: 'BEEF' | 'PORK') => void;
  activeAnimal?: 'BEEF' | 'PORK' | null;
}

export function SummaryStats({ summary, onClickCard, activeAnimal = null }: Props) {
  return (
    <section className="px-5 pt-6 pb-6">
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <h2 className="text-title text-[var(--text-strong)] tracking-tight font-bold">오늘의 시세 요약</h2>
        <Badge status={summary.trendStatus} label={summary.trendMessage} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 한우 스택 */}
        <button 
          onClick={() => onClickCard?.('BEEF')}
          disabled={!onClickCard}
          aria-pressed={activeAnimal === 'BEEF'}
          aria-label="한우 시세 요약"
          className={`px-4 pt-8 pb-6 rounded-[var(--radius-xl)] shadow-soft flex flex-col items-center justify-center transition-colors ${
            activeAnimal === 'BEEF' ? selectableStateClass.active : selectableStateClass.inactive
          } ${onClickCard ? 'active:scale-95' : 'cursor-default'}`}
        >
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center justify-center h-12" aria-hidden="true">
              <span className="text-[40px] leading-none">🐄</span>
            </div>
            <h3 className="text-body-lg font-bold">한우</h3>
          </div>
          <div className={`text-title-xl font-bold flex items-center gap-1 ${getTrendColorClass(summary.beefSummary.status, 'text')}`}>
            {getTrendIcon(summary.beefSummary.status)}
            {formatPrice(summary.beefSummary.value)}
          </div>
        </button>

        {/* 한돈 스택 */}
        <button 
          onClick={() => onClickCard?.('PORK')}
          disabled={!onClickCard}
          aria-pressed={activeAnimal === 'PORK'}
          aria-label="한돈 시세 요약"
          className={`px-4 pt-8 pb-6 rounded-[var(--radius-xl)] shadow-soft flex flex-col items-center justify-center transition-colors ${
            activeAnimal === 'PORK' ? selectableStateClass.active : selectableStateClass.inactive
          } ${onClickCard ? 'active:scale-95' : 'cursor-default'}`}
        >
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center justify-center h-12" aria-hidden="true">
              <span className="text-[40px] leading-none">🐖</span>
            </div>
            <h3 className="text-body-lg font-bold">한돈</h3>
          </div>
          <div className={`text-title-xl font-bold flex items-center gap-1 ${getTrendColorClass(summary.porkSummary.status, 'text')}`}>
            {getTrendIcon(summary.porkSummary.status)}
            {formatPrice(summary.porkSummary.value)}
          </div>
        </button>
      </div>
    </section>
  );
}
