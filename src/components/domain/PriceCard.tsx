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
      <div className="flex justify-between items-end">
        <div className="text-title-xl text-[var(--text-strong)] font-bold tracking-tight">
          {/* price가 null인 경우 "정보 없음" 표시 (명세: Nullable 허용) */}
          {item.price != null ? `${formatPrice(item.price)}원` : '정보 없음'}
        </div>
        {/* trendStatus/changeAmount: 명세 기준 필드명 */}
        <Badge status={item.trendStatus ?? 'UNCHANGED'} value={item.changeAmount ?? 0} />
      </div>
    </button>
  );
}
