import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * @description docs/design/pages/BASE.md 명세를 반영하여 
 * 애플리케이션 전체 페이지의 가로폭과 패딩을 한곳에서 통제하는 싱글 소스 컴포넌트
 */
export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[var(--color-bg)] px-5 pt-[72px] pb-[96px] box-border flex flex-col relative overflow-x-hidden overflow-y-scroll [scrollbar-gutter:stable] shadow-2xl">
      {children}
    </div>
  );
};
