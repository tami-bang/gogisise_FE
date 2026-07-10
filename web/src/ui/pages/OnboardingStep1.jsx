import React from 'react';
import { getTextClasses } from '../utils/textStyle';

function OnboardingStep1({ onNext, textSize, setTextSize }) {
  const getStyles = (size) => {
    return textSize === size 
      ? "bg-brand-primary text-white border-2 border-brand-primary font-bold"
      : "bg-white text-text-default border border-border-light font-medium";
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-5 overflow-y-auto">
        <h1 className={`${getTextClasses('titleXl', textSize)} font-bold text-text-strong mt-6 mb-8`}>
          가장 보기 편한 글자 크기를 골라주세요
        </h1>
        
        {/* 미리보기 카드 */}
        <div className="bg-white rounded-[20px] border border-border-light p-5 shadow-sm mb-10">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-text-muted">ℹ️</span>
            <span className={`${getTextClasses('caption', textSize)} text-text-muted`}>도매 시세 미리보기</span>
          </div>
          <h2 className={`${getTextClasses('bodyLg', textSize)} font-semibold text-text-strong mb-2`}>한우 암컷 등심 (1++ No.9)</h2>
          <div className={`${getTextClasses('display', textSize)} font-extrabold text-brand-red`}>
            98,500<span className={`${getTextClasses('bodyLg', textSize)} ml-1 text-text-strong`}>원</span>
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="flex flex-col gap-3">
          <button className={`w-full h-14 rounded-lg flex items-center justify-center btn-active ${getTextClasses('label', textSize)} ${getStyles('DEFAULT')}`} onClick={() => setTextSize('DEFAULT')}>
            보통
          </button>
          <button className={`w-full h-14 rounded-lg flex items-center justify-center btn-active ${getTextClasses('label', textSize)} ${getStyles('LARGE')}`} onClick={() => setTextSize('LARGE')}>
            크게
          </button>
          <button className={`w-full h-14 rounded-lg flex items-center justify-center btn-active ${getTextClasses('label', textSize)} ${getStyles('VERY_LARGE')}`} onClick={() => setTextSize('VERY_LARGE')}>
            매우 크게
          </button>
        </div>
        
        <p className={`${getTextClasses('body', textSize)} text-text-muted text-center mt-6`}>
          설정하신 크기는 앱 전반에 걸쳐 적용됩니다.
        </p>
      </div>
      
      <div className="footer-fixed h-[96px] flex items-center justify-center px-5 border-t border-divider">
        <button onClick={onNext} className={`w-full h-16 rounded-[20px] bg-brand-primary text-white ${getTextClasses('bodyLg', textSize)} font-semibold flex items-center justify-center gap-2 btn-active`}>
          다음으로 넘어가기 ➔
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep1;
