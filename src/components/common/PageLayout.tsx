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
        <div className="w-full bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-sm transition-all duration-300 hover:border-[rgba(245,158,11,0.4)] shrink-0 animate-fade-in">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center text-amber-500 font-bold animate-pulse">
            ⚠️
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <h4 className="text-sm font-semibold text-amber-700 leading-tight">
              임시 테스트 데이터 표시 중
            </h4>
            <p className="text-xs text-amber-600 leading-normal break-all whitespace-normal">
              인터넷 연결이 원활하지 않아 가짜 시세 데이터(더미 데이터)를 임시로 띄운 화면입니다.
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
