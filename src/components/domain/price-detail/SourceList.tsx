import { useState } from 'react';
import type { SourcePriceRecord, SourceItem } from '../../../api/types/market';

interface SourceListProps {
  records: SourcePriceRecord[];
  sourceItems?: SourceItem[];
}

export function SourceList({ records, sourceItems }: SourceListProps) {
  const [showAll, setShowAll] = useState(false);
  const safeRecords = Array.isArray(records) ? records : [];
  const safeItems = Array.isArray(sourceItems) ? sourceItems : [];
  const displayCount = showAll ? safeRecords.length : 10;
  const visibleRecords = safeRecords.slice(0, displayCount);
  const hasMore = safeRecords.length > 10;

  return (
    <div className="flex flex-col gap-[var(--spacing-16)]">
      {/* ── 평균 산출 원본 ────────────────────────────── */}
      <div className="flex justify-between items-end border-b border-[var(--color-divider)] pb-[var(--spacing-8)]">
        <h3 className="text-title font-bold text-[var(--text-strong)]">평균 산출 원본</h3>
        {safeRecords.length > 0 && (
          <span className="text-caption text-[var(--text-light)]">최근 수집순</span>
        )}
      </div>

      {safeRecords.length === 0 ? (
        <p className="text-body text-[var(--text-muted)]">표시할 원본 데이터가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-[var(--spacing-12)]">
          {visibleRecords.map((record, index) => (
            <div
              key={record.id || `${record.sourceName}-${index}`}
              className={`flex justify-between items-center py-[var(--spacing-8)] ${!record.includedInAverage ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-body font-bold text-[var(--text-strong)]">
                  {record.sourceName || '-'}
                  {record.grade && (
                    <span className="ml-2 text-caption font-normal text-[var(--text-muted)]">
                      ({record.grade}등급)
                    </span>
                  )}
                </span>
                <span className="text-caption text-[var(--text-muted)]">
                  {record.collectedAt ? new Date(record.collectedAt).toLocaleDateString() : '-'} 수집
                  {record.ageInMonths != null && ` · ${record.ageInMonths}개월`}
                  {!record.includedInAverage && ` · 제외됨${record.exclusionReason ? ` (${record.exclusionReason})` : ''}`}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-body font-bold ${!record.includedInAverage ? 'text-[var(--text-muted)]' : 'text-[var(--text-strong)]'}`}>
                  {typeof record.price === 'number' ? `${record.price.toLocaleString()}원` : '정보 없음'}
                </span>
                <span className="text-caption text-[var(--text-light)]">/ 1kg</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-[var(--spacing-8)] w-full py-[var(--spacing-12)] text-center text-body font-bold text-[var(--color-secondary)] bg-[var(--color-surface-soft)] rounded-[var(--radius-md)] active:scale-[0.98] transition-transform"
        >
          {safeRecords.length - 10}개 더 보기
        </button>
      )}

      {/* ── 금천미트 상품 바로가기 ─────────────────────── */}
      {safeItems.length > 0 && (
        <>
          <div className="flex justify-between items-end border-b border-[var(--color-divider)] pb-[var(--spacing-8)] mt-[var(--spacing-8)]">
            <h3 className="text-title font-bold text-[var(--text-strong)]">금천미트 상품 목록</h3>
            <span className="text-caption text-[var(--text-light)]">가격 낮은 순</span>
          </div>

          <div className="flex flex-col gap-[var(--spacing-8)]">
            {safeItems.map((si) => (
              <button
                key={si.itemId}
                onClick={() => window.open(si.detailUrl, '_blank', 'noopener,noreferrer')}
                className="w-full flex justify-between items-center py-[var(--spacing-10)] px-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] border border-[var(--color-divider)] hover:border-[var(--color-secondary)] active:scale-[0.98] transition-all text-left group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-body font-bold text-[var(--text-strong)] group-hover:text-[var(--color-secondary)] transition-colors">
                    {si.name}
                    {si.grade && (
                      <span className="ml-2 text-caption font-normal text-[var(--text-muted)]">
                        ({si.grade}등급)
                      </span>
                    )}
                  </span>
                  {si.brand && (
                    <span className="text-caption text-[var(--text-light)]">{si.brand}</span>
                  )}
                </div>
                <div className="flex items-center gap-[var(--spacing-8)]">
                  <div className="flex flex-col items-end">
                    <span className="text-body font-bold text-[var(--color-secondary)]">
                      {typeof si.price === 'number' ? `${si.price.toLocaleString()}원` : '-'}
                    </span>
                    <span className="text-caption text-[var(--text-light)]">/ 1kg</span>
                  </div>
                  {/* 외부 링크 아이콘 */}
                  <svg
                    className="w-4 h-4 text-[var(--text-light)] group-hover:text-[var(--color-secondary)] transition-colors flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
