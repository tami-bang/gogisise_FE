import type { PriceItem } from '../../api';
import { formatPrice } from '../../utils/formatter';
import { Badge } from '../common/Badge';

interface Props {
  item: PriceItem;
  onClick?: (id: string) => void;
  id?: string;
}

export function PriceCard({ item, onClick, id }: Props) {
  // 등급 표시: 명세 포맷(1++, 1+, 1, 등외)에 "등급" 텍스트를 UI에서 붙입니다.
  const gradeDisplay = item.grade ? `${item.grade}등급` : '-';
  // displayName이 명세상 필수 필드이므로 폴백 없이 직접 사용
  const nameDisplay = item.displayName;
  const expiryDate = item.expiresAt ? new Date(item.expiresAt) : null;
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000)
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  
  return (
    <button 
      id={id}
      onClick={() => onClick && onClick(item.itemId)}  // itemId: 명세 기준 식별자
      className="w-full text-left bg-[var(--color-surface)] p-5 rounded-[var(--radius-xl)] border border-[var(--color-divider)] shadow-soft active:scale-[0.98] active:bg-[#f5f5f5] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-body-lg text-[var(--text-default)] font-bold">{nameDisplay}</span>
        <span className="text-label text-[var(--text-muted)]">{gradeDisplay}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3" aria-label="상품 부가 정보">
        {item.weightKg != null && (
          <span className="text-caption px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-soft)] text-[var(--text-muted)]">
            중량 {item.weightKg}kg
          </span>
        )}
        {item.species === 'BEEF' && item.ageMonths != null && (
          <span className="text-caption px-2 py-1 rounded-[var(--radius-sm)] bg-[#edf6fc] text-[var(--color-secondary)]">
            {item.ageMonths}개월
          </span>
        )}
        {isExpiringSoon && (
          <span className="text-caption font-bold px-2 py-1 rounded-[var(--radius-sm)] bg-[#ffedea] text-[var(--color-text-red)]">
            ⚠ 소비기한 임박
          </span>
        )}
      </div>
      <div className="flex justify-between items-end">
        <div className="text-title-xl text-[var(--text-strong)] font-bold tracking-tight">
          {/* price가 null인 경우 "정보 없음" 표시 (명세: Nullable 허용) */}
          {item.price != null ? `${formatPrice(item.price)}원` : '정보 없음'}
        </div>
        <div className="text-right">
          <p className="text-caption text-[var(--text-muted)]">판매가</p>
          <p className="text-body-lg font-bold text-[var(--color-text-red)]">
            {item.salePrice != null ? `${formatPrice(item.salePrice)}원` : '정보 없음'}
          </p>
          <Badge status={item.trendStatus ?? 'UNCHANGED'} value={item.changeAmount ?? 0} />
        </div>
      </div>
    </button>
  );
}
