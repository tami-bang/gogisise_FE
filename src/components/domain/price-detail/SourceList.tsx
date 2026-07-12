import { useState } from 'react';
import type { SourcePriceRecord } from '../../../api/types/market';

interface SourceListProps {
  records: SourcePriceRecord[];
}

export function SourceList({ records }: SourceListProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayCount = showAll ? records.length : 10;
  const visibleRecords = records.slice(0, displayCount);
  const hasMore = records.length > 10;

  return (
    <div className="flex flex-col gap-[var(--spacing-16)]">
      <div className="flex justify-between items-end border-b border-[var(--color-divider)] pb-[var(--spacing-8)]">
        <h3 className="text-title font-bold text-[var(--text-strong)]">평균 산출 원본</h3>
        <span className="text-caption text-[var(--text-light)]">최근 수집순</span>
      </div>

      <div className="flex flex-col gap-[var(--spacing-12)]">
        {visibleRecords.map((record) => (
          <div 
            key={record.id} 
            className={`flex justify-between items-center py-[var(--spacing-8)] ${!record.includedInAverage ? 'opacity-50' : ''}`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-body font-bold text-[var(--text-strong)]">{record.sourceName}</span>
              <span className="text-caption text-[var(--text-muted)]">
                {new Date(record.collectedAt).toLocaleDateString()} 수집
                {!record.includedInAverage && ` · 제외됨 (${record.exclusionReason})`}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-body font-bold ${!record.includedInAverage ? 'text-[var(--text-muted)]' : 'text-[var(--text-strong)]'}`}>
                {record.price.toLocaleString()}원
              </span>
              <span className="text-caption text-[var(--text-light)]">/ {record.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-[var(--spacing-8)] w-full py-[var(--spacing-12)] text-center text-body font-bold text-[var(--color-secondary)] bg-[var(--color-surface-soft)] rounded-[var(--radius-md)] active:scale-[0.98] transition-transform"
        >
          {records.length - 10}개 더 보기
        </button>
      )}
    </div>
  );
}
