import { Button } from '../common/Button';

interface Props {
  onOpenShare: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function KakaoShareButton({ onOpenShare }: Props) {
  return (
    <div className="mt-8 px-5">
      <Button
        variant="kakao"
        onClick={onOpenShare}
        className="w-full gap-3"
      >
        <span className="text-3xl" aria-hidden="true">💬</span>
        카카오톡으로 오늘 시세 보내기
      </Button>
    </div>
  );
}
