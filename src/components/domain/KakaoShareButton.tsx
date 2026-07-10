import type { MarketSummary, PriceItem } from '../../api';
import { Button } from '../common/Button';

interface Props {
  summary: MarketSummary | null;
  items: PriceItem[];
}

export function KakaoShareButton({ summary, items }: Props) {
  const handleShare = () => {
    if (!summary) return;
    
    let message = `[고기시세] 오늘의 요약: ${summary.trendMessage}\n\n`;
    items.forEach(item => {
      message += `- ${item.name}: ${item.price.toLocaleString()}원\n`;
    });
    
    alert(`(Mock) 카카오톡으로 시세를 전송합니다.\n\n${message}`);
  };

  return (
    <div className="mt-8 px-5">
      <Button
        variant="kakao"
        onClick={handleShare}
        className="w-full gap-3"
      >
        <span className="text-3xl" aria-hidden="true">💬</span>
        카카오톡으로 오늘 시세 보내기
      </Button>
    </div>
  );
}
