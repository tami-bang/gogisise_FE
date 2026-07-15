import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * @description docs/design/pages/BASE.md 명세를 반영하여 
 * 애플리케이션 전체 페이지의 가로폭과 패딩을 한곳에서 통제하는 싱글 소스 컴포넌트
 */
export const PageLayout = ({ children }: PageLayoutProps) => {
  const isMockMode = typeof window !== 'undefined' && window.sessionStorage 
    ? window.sessionStorage.getItem('gogisise:is_mock_mode') === 'true' 
    : false;

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[var(--color-bg)] px-5 pt-[72px] pb-[96px] box-border flex flex-col relative overflow-x-hidden overflow-y-scroll [scrollbar-gutter:stable] shadow-2xl">
      {isMockMode && (
        <div className="w-full bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] rounded-2xl py-3 pl-5 pr-4 mt-12 mb-4 flex items-center gap-3 shadow-sm transition-all duration-300 hover:border-[rgba(245,158,11,0.4)] shrink-0 animate-fade-in">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700 leading-snug break-all whitespace-normal">
              인터넷 연결이 원활하지 않아, 임시로 띄운 화면입니다.
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
