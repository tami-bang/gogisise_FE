import type { ReactNode } from 'react';

// 메인 3단 레이아웃을 잡아주는 래퍼 컴포넌트입니다.
// 중앙 정렬된 모바일 뷰포트를 제공합니다.
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md min-h-screen bg-(--color-bg) relative flex flex-col overflow-hidden shadow-2xl">
      {children}
    </div>
  );
}
