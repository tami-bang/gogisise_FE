import type { PriceItem } from '../../api';
import { formatPrice } from '../../utils/formatter';

interface Props {
  item: PriceItem;
  onClick?: (id: string) => void;
  id?: string;
}

const formatDate = (value?: string | null) => value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '-';

export function PriceCard({ item, onClick, id }: Props) {
  const gradeDisplay = item.grade ?? '-';
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
      <div className="grid grid-cols-3 border-b border-[var(--color-divider)] pb-3">
        <div className="col-span-2 min-w-0 pr-3 border-r border-[var(--color-divider)]">
          <p className="text-caption text-[var(--text-light)] mb-1">상품명</p>
          <p className="text-label font-bold leading-snug break-words text-[var(--text-strong)]">{nameDisplay}</p>
        </div>
        <div className="min-w-0 overflow-hidden pl-3 text-right">
          <p className="text-caption text-[var(--text-light)] mb-1">제조일</p>
          <p className="w-full truncate text-base font-bold tabular-nums text-[var(--text-strong)]" title={formatDate(item.manufacturedAt)}>
            {formatDate(item.manufacturedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-[var(--color-divider)] py-3">
        <div className="min-w-0 pr-3 border-r border-[var(--color-divider)]">
          <p className="text-caption text-[var(--text-light)] mb-1">등급</p>
          <p className="text-label font-bold text-[var(--text-strong)]">{gradeDisplay}</p>
        </div>
        <div className="min-w-0 px-3 border-r border-[var(--color-divider)]">
          <p className="text-caption text-[var(--text-light)] mb-1">월령</p>
          {item.species === 'BEEF' && item.ageMonths != null ? (
            <span className="inline-block px-2 py-0.5 rounded-[var(--radius-sm)] bg-[#edf6fc] text-caption font-bold whitespace-nowrap text-[var(--color-secondary)]">
              {item.ageMonths}개월
            </span>
          ) : (
            <span className="text-label text-[var(--text-strong)]">-</span>
          )}
        </div>
        <div className="min-w-0 overflow-hidden pl-3 text-right">
          <p className="text-caption text-[var(--text-light)] mb-1">소비기한</p>
          <p
            className={`w-full truncate text-base font-bold tabular-nums ${isExpiringSoon ? 'text-[var(--color-text-red)]' : 'text-[var(--text-strong)]'}`}
            title={formatDate(item.expiresAt)}
          >
            {isExpiringSoon ? '⚠ ' : ''}{formatDate(item.expiresAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 pt-4">
        <div className="pr-3 border-r border-[var(--color-divider)]">
          <p className="text-caption text-[var(--text-light)] mb-1">kg당 단가</p>
          <p className="text-label font-bold text-[var(--text-strong)]">
            {item.price != null ? `${formatPrice(item.price)}원` : '정보 없음'}
          </p>
        </div>
        <div className="px-3 border-r border-[var(--color-divider)] text-center">
          <p className="text-caption text-[var(--text-light)] mb-1">중량</p>
          <p className="text-label font-bold text-[var(--text-strong)]">{item.weightKg != null ? `${item.weightKg}kg` : '-'}</p>
        </div>
        <div className="pl-3 text-right">
          <p className="text-caption text-[var(--text-light)] mb-1">판매가</p>
          <p className="text-xl font-black tracking-tight tabular-nums text-[var(--color-text-red)]">
            {item.salePrice != null ? `${formatPrice(item.salePrice)}원` : '정보 없음'}
          </p>
        </div>
      </div>
    </button>
  );
}
