import React, { useState, useEffect } from 'react';
import { getTextClasses } from '../utils/textStyle';
import { chartData } from '../../data/mockData';
import { fetchPriceDetail, shareKakaoMock } from '../../api/priceApi';

function DetailPrice({ onBack, part, category, textSize }) {
  const isHanwoo = category === 'HANWOO';
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPriceDetail(category, part);
        setDetailData(data);
      } catch(error) {
        console.error("상세 가격 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [category, part]);

  const handleKakaoShare = async () => {
    if(!detailData) return;
    // API Mock 호출
    await shareKakaoMock(category, part, detailData.price);
    alert("카카오톡으로 공유되었습니다!\n(개발자 도구 콘솔에서 전송된 JSON 데이터를 확인하세요)");
  };

  return (
    <div className="flex flex-col h-screen bg-surface-soft">
      <header className="header-fixed flex items-center px-2 h-[72px] border-b border-divider">
        <button onClick={onBack} className="w-[48px] h-[48px] flex items-center justify-center btn-active rounded-full bg-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h1 className={`${getTextClasses('titleXl', textSize)} font-bold text-text-strong ml-2`}>
          {isHanwoo ? '한우 암소' : '한돈 암컷'} {part}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 pb-[120px]">
        {/* 오늘의 시세 히어로 카드 */}
        <section className="bg-white rounded-[20px] shadow-sm p-6 border border-border-light mb-6 text-center">
          <h2 className={`${getTextClasses('body', textSize)} font-medium text-text-default mb-2`}>오늘의 도매 시세</h2>
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <div className={`${getTextClasses('display', textSize)} font-extrabold text-text-strong mb-3`}>{detailData.price}원</div>
              
              <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] font-bold ${getTextClasses('label', textSize)} ${detailData.isUp ? 'bg-[#ffedea] text-brand-red' : 'bg-[#edf6fc] text-brand-blue'}`}>
                {detailData.isUp ? `▲ ${detailData.diff}원 (어제보다)` : `▼ ${detailData.diff}원 (어제보다)`}
              </div>
            </>
          )}
        </section>

        {/* 7일 차트 섹션 */}
        <section className="bg-white rounded-[20px] shadow-sm p-6 border border-border-light">
          <h2 className={`${getTextClasses('title', textSize)} font-bold text-text-strong mb-5`}>최근 7일 변동 추이</h2>
          
          <div className="flex items-end justify-between h-[160px] mt-5">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center w-[14%] gap-3">
                <div 
                  className={`w-[28px] rounded-t-[8px] transition-colors ${d.isToday ? 'bg-brand-primary' : 'bg-surface-soft'}`} 
                  style={{ height: d.h }}
                ></div>
                <span className={`${getTextClasses('caption', textSize)} ${d.isToday ? 'text-brand-primary font-bold' : 'text-text-muted font-medium'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer-fixed h-[96px] flex items-center justify-center px-5 border-t border-divider">
        <button onClick={handleKakaoShare} className="w-full h-[64px] rounded-[16px] bg-brand-yellow flex items-center justify-center gap-2 btn-active">
          <span className="text-[24px]">💬</span>
          <span className={`${getTextClasses('bodyLg', textSize)} font-semibold text-text-strong`}>카카오톡으로 오늘 시세 보내기</span>
        </button>
      </footer>
    </div>
  );
}

export default DetailPrice;
