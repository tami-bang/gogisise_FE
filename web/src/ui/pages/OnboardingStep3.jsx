import React, { useState } from 'react';
import { getTextClasses } from '../utils/textStyle';
import { hanwooParts, handonParts } from '../../data/mockData';

function OnboardingStep3({ onNext, category, selectedParts, setSelectedParts, textSize }) {
  const [search, setSearch] = useState("");
  
  const currentList = category === 'HANWOO' ? hanwooParts : handonParts;
  const filteredList = currentList.filter(p => p.includes(search));

  const togglePart = (part) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter(p => p !== part));
    } else {
      setSelectedParts([...selectedParts, part]);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 상시 고정 검색 영역 */}
      <div className="header-fixed px-5 pt-4 pb-4 border-b border-divider flex flex-col justify-end">
        <div className="inline-flex items-center px-3 py-1 bg-[#ffedea] text-brand-red rounded-lg font-semibold w-max mb-2">
          <span className={getTextClasses('label', textSize)}>3단계: 관심 부위 검색</span>
        </div>
        <h1 className={`${getTextClasses('titleXl', textSize)} font-bold text-text-strong mb-4`}>
          자주 보시는 부위를 검색해보세요
        </h1>
        
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="부위 이름 입력 (예: 등심, 삼겹살)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full h-[56px] pl-12 pr-4 rounded-[16px] border border-[#dddddd] focus:border-2 focus:border-brand-primary focus:outline-none ${getTextClasses('body', textSize)} bg-white text-text-strong placeholder-text-light`}
          />
        </div>
      </div>

      <div className="flex-1 p-5 pb-32 overflow-y-auto bg-surface-soft">
        <div className="grid grid-cols-2 gap-[16px]">
          {filteredList.map((part) => {
            const isSelected = selectedParts.includes(part);
            return (
              <div 
                key={part}
                onClick={() => togglePart(part)}
                className={`h-[120px] flex items-center justify-center relative rounded-xl shadow-sm btn-active cursor-pointer transition-colors
                  ${isSelected ? 'border-2 border-brand-primary bg-[#ffedea]' : 'border border-border-light bg-white'}
                `}
              >
                <span className={`${getTextClasses('title', textSize)} font-bold text-text-strong`}>{part}</span>
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#2e7d32] bg-white rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="footer-fixed h-[96px] flex items-center justify-center px-5 bg-white/90 backdrop-blur-sm border-t border-divider">
        <button 
          onClick={onNext}
          className={`w-full h-[64px] rounded-[16px] bg-brand-primary text-white font-semibold btn-active ${getTextClasses('bodyLg', textSize)}`}
        >
          선택 완료하기
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep3;
