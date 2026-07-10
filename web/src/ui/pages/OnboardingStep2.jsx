import React from 'react';
import { getTextClasses } from '../utils/textStyle';

function OnboardingStep2({ onNext, category, setCategory, textSize }) {
  const getCardStyle = (targetCategory) => {
    if (category === targetCategory) {
      return "border-2 border-brand-primary bg-[#ffedea]";
    }
    return "border border-border-light bg-white shadow-sm";
  };

  return (
    <div className="flex flex-col h-screen relative">
      {/* 반투명 마켓 일러스트 레이어 (더미 패턴으로 연출) */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gray-200 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
      
      <div className="flex-1 p-5 overflow-y-auto relative z-10">
        {/* 오렌지색 인디케이터 바 */}
        <div className="w-16 h-2 bg-brand-primary rounded-full mb-6 mt-4"></div>
        
        <h1 className={`${getTextClasses('titleXl', textSize)} font-bold text-text-strong mb-3`}>
          조회하실 고기 종류를 선택해 주세요
        </h1>
        <p className={`${getTextClasses('body', textSize)} text-text-muted mb-10`}>
          자주 확인하시는 축종을 선택하면 맞춤 정보를 먼저 보여드립니다.
        </p>

        <div className="flex flex-col gap-4">
          {/* 한우 암컷 카드 */}
          <div 
            className={`w-full rounded-[20px] p-5 flex items-center justify-between cursor-pointer btn-active ${getCardStyle('HANWOO')}`}
            onClick={() => setCategory('HANWOO')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center text-3xl">🐄</div>
              <span className={`${getTextClasses('title', textSize)} font-bold text-text-strong`}>한우 암컷 시세보기</span>
            </div>
            <span className="text-text-muted text-xl">❯</span>
          </div>

          {/* 한돈 암컷 카드 */}
          <div 
            className={`w-full rounded-[20px] p-5 flex items-center justify-between cursor-pointer btn-active ${getCardStyle('HANDON')}`}
            onClick={() => setCategory('HANDON')}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center text-3xl">🐖</div>
              <span className={`${getTextClasses('title', textSize)} font-bold text-text-strong`}>한돈 암컷 시세보기</span>
            </div>
            <span className="text-text-muted text-xl">❯</span>
          </div>
        </div>
      </div>

      <div className="footer-fixed h-[96px] flex items-center justify-center px-5 border-t border-divider">
        <button 
          onClick={category ? onNext : null} 
          className={`w-full h-[64px] rounded-[16px] font-semibold flex items-center justify-center gap-2 transition-colors btn-active
            ${category ? 'bg-brand-primary text-white' : 'bg-disabled text-white pointer-events-none'}
            ${getTextClasses('bodyLg', textSize)}`}
        >
          {category ? '✓ 선택 완료하기' : '선택을 완료해 주세요'}
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep2;
