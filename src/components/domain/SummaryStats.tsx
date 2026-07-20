import type { MarketSummary } from '../../api';
import { getTrendIcon, getTrendColorClass, formatPrice } from '../../utils/formatter';
import { Badge } from '../common/Badge';


interface Props {
  summary: MarketSummary;
  onClickCard?: (animal: 'BEEF' | 'PORK') => void;
  activeAnimal?: 'BEEF' | 'PORK' | null;
}

export function SummaryStats({ summary, onClickCard, activeAnimal = null }: Props) {
  return (
    <section className="w-full pt-6 pb-6">
      <div className="flex flex-wrap items-center justify-start text-left w-full gap-4 mb-8">
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
          className={`relative w-full h-56 rounded-[var(--radius-2xl)] shadow-soft hover:shadow-medium active:shadow-sm transition-all duration-150 cursor-pointer ${
            activeAnimal === 'BEEF' 
              ? 'border-2 border-[var(--color-secondary)] bg-[var(--color-surface)] text-[var(--text-strong)]' 
              : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--text-muted)]'
          } ${onClickCard ? 'active:scale-[0.98]' : 'cursor-default'}`}
        >
          {/* 중앙 이모지 & 텍스트 */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2" aria-hidden="true">
            <span className="text-6xl leading-none">🐂</span>
            <span className="text-title font-bold text-[var(--text-strong)] mt-1">한우</span>
          </div>

          {/* 하단 가격 변동 수치 */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex items-center justify-center text-center gap-1 text-title-xl font-bold ${getTrendColorClass(summary.beefSummary.status, 'text')}`}>
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
          className={`relative w-full h-56 rounded-[var(--radius-2xl)] shadow-soft hover:shadow-medium active:shadow-sm transition-all duration-150 cursor-pointer ${
            activeAnimal === 'PORK' 
              ? 'border-2 border-[var(--color-secondary)] bg-[var(--color-surface)] text-[var(--text-strong)]' 
              : 'bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--text-muted)]'
          } ${onClickCard ? 'active:scale-[0.98]' : 'cursor-default'}`}
        >
          {/* 중앙 이모지 & 텍스트 */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2" aria-hidden="true">
            <span className="text-6xl leading-none">🐖</span>
            <span className="text-title font-bold text-[var(--text-strong)] mt-1">한돈</span>
          </div>

          {/* 하단 가격 변동 수치 */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex items-center justify-center text-center gap-1 text-title-xl font-bold ${getTrendColorClass(summary.porkSummary.status, 'text')}`}>
            {getTrendIcon(summary.porkSummary.status)}
            {formatPrice(summary.porkSummary.value)}
          </div>
        </button>
      </div>
    </section>
  );
}
