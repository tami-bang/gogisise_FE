interface DetailHeaderProps {
  fullDisplayName: string;
}

export function DetailHeader({ fullDisplayName }: DetailHeaderProps) {
  return (
    <div className="flex flex-col gap-[var(--spacing-8)]">
      <h2 className="text-title-xl font-bold text-[var(--text-strong)]" id="price-detail-title">
        {fullDisplayName}
      </h2>
      <p className="text-body text-[var(--text-muted)]">
        오늘의 평균 시세 산출 내역을 확인하세요.
      </p>
    </div>
  );
}
