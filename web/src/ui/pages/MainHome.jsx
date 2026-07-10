import React, { useState, useEffect } from 'react';
import { getTextClasses } from '../utils/textStyle';
import { fetchTodayPriceSummary } from '../../api/priceApi';

function MainHome({ onGoDetail, category, selectedParts, textSize }) {
  const partsToRender = selectedParts.length > 0 ? selectedParts : (category === 'HANWOO' ? ['등심'] : ['삼겹살']);
  const isHanwoo = category === 'HANWOO';

  // API 호출을 통해 데이터를 가져오는 상태 관리
  const [summaryData, setSummaryData] = useState({ price: '', diff: '', isUp: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTodayPriceSummary(category);
        setSummaryData(data);
      } catch (error) {
        console.error("가격 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [category]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header 45% / Body 55% 분할을 위한 근사 레이아웃 적용 */}
      <header className="header-fixed flex items-center px-5 h-[72px] shrink-0 border-b border-divider">
        <span className="text-2xl mr-2">🏪</span>
        <h1 className={`${getTextClasses('titleXl', textSize)} font-bold text-text-strong`}>오늘의 암컷 축산물 도매 가격입니다</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-[96px] flex flex-col">
        {/* 상단 Viewing Zone (종합 지표) */}
        <div className="p-5 bg-white border-b border-border-light pb-8">
          <h2 className={`${getTextClasses('display', textSize)} font-extrabold text-text-strong mb-3`}>축산 시장 종합</h2>
          <div className="inline-flex items-center gap-1 bg-[#ffedea] text-brand-red px-3 py-1.5 rounded-lg mb-6 font-bold">
            <span className={getTextClasses('body', textSize)}>▲ 0.8% 상승</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] border border-border-light p-4 shadow-sm">
              <div className={`${getTextClasses('caption', textSize)} text-text-muted mb-1`}>한우 암컷</div>
              <div className={`${getTextClasses('title', textSize)} font-bold text-brand-red`}>▲ 1,200</div>
            </div>
            <div className="bg-white rounded-[20px] border border-border-light p-4 shadow-sm">
              <div className={`${getTextClasses('caption', textSize)} text-text-muted mb-1`}>한돈 암컷</div>
              <div className={`${getTextClasses('title', textSize)} font-bold text-brand-blue`}>▼ 350</div>
            </div>
          </div>
        </div>

        {/* 하단 Interaction Zone (즐겨찾기 카드 리스트) */}
        <div className="p-5 bg-surface-soft flex-1">
          <h3 className={`${getTextClasses('title', textSize)} font-bold text-text-strong mb-4`}>내 즐겨찾기 시세</h3>
          <div className="flex flex-col gap-[16px]">
            {partsToRender.map((part, idx) => {
              // 로딩 중일때의 표시 (스켈레톤 UI 느낌)
              if (isLoading) {
                 return (
                  <div key={idx} className="bg-white rounded-[20px] p-[20px] border border-border-light shadow-sm flex flex-col gap-3 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                 )
              }

              return (
                <div 
                  key={idx}
                  onClick={() => onGoDetail(part)}
                  className="bg-white rounded-[20px] p-[20px] border border-border-light shadow-sm btn-active cursor-pointer flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <span className={`${getTextClasses('title', textSize)} font-bold text-text-strong`}>
                      {isHanwoo ? '한우 암컷' : '한돈 암컷'} {part}
                    </span>
                    <div className={`flex items-center px-3 py-1.5 rounded-lg font-bold ${getTextClasses('label', textSize)} ${summaryData.isUp ? 'bg-[#ffedea] text-brand-red' : 'bg-[#edf6fc] text-brand-blue'}`}>
                      {summaryData.isUp ? '▲' : '▼'} {summaryData.diff}
                    </div>
                  </div>
                  <div className={`${getTextClasses('display', textSize)} font-extrabold text-text-strong`}>{summaryData.price}<span className={getTextClasses('bodyLg', textSize)}>원</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 영구 하단 앵커 내비게이션 (Footer 80px) */}
      <nav className="footer-fixed h-[80px] flex justify-around items-center border-t border-divider px-2">
        <div className="flex flex-col items-center justify-center text-brand-red">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className={`${getTextClasses('caption', textSize)} font-bold mt-1`}>홈</span>
        </div>
        <div className="flex flex-col items-center justify-center text-text-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <span className={`${getTextClasses('caption', textSize)} font-bold mt-1`}>즐겨찾기</span>
        </div>
        <div className="flex flex-col items-center justify-center text-text-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
          <span className={`${getTextClasses('caption', textSize)} font-bold mt-1`}>설정</span>
        </div>
      </nav>
    </div>
  );
}

export default MainHome;
