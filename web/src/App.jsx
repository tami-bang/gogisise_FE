import React, { useState } from 'react';
import './index.css';

// 개별 화면 컴포넌트 임포트
import OnboardingStep1 from './ui/pages/OnboardingStep1';
import OnboardingStep2 from './ui/pages/OnboardingStep2';
import OnboardingStep3 from './ui/pages/OnboardingStep3';
import MainHome from './ui/pages/MainHome';
import DetailPrice from './ui/pages/DetailPrice';

// --- Main App Controller (화면 라우터 및 글로벌 스테이트 매니저) ---
function App() {
  // 1. 라우팅(Routing) 상태: 사용자가 현재 어느 화면에 있는지 기억합니다.
  const [currentScreen, setCurrentScreen] = useState('STEP1');
  
  // 2. 전역 설정 상태(State): 모든 화면에서 공유해야 하는 앱 세팅값들입니다.
  const [textSize, setTextSize] = useState('DEFAULT'); // 글자 크기
  const [category, setCategory] = useState(null); // 'HANWOO' or 'HANDON' (축종)
  const [selectedParts, setSelectedParts] = useState([]); // 선택한 부위들
  
  // 3. 상세 화면용 파라미터 상태
  const [detailPart, setDetailPart] = useState(''); // 클릭한 부위의 이름

  return (
    <div className="app-container shadow-2xl">
      {currentScreen === 'STEP1' && (
        <OnboardingStep1 
          onNext={() => setCurrentScreen('STEP2')} 
          textSize={textSize} 
          setTextSize={setTextSize} 
        />
      )}
      {currentScreen === 'STEP2' && (
        <OnboardingStep2 
          onNext={() => setCurrentScreen('STEP3')} 
          category={category} 
          setCategory={setCategory} 
          textSize={textSize}
        />
      )}
      {currentScreen === 'STEP3' && (
        <OnboardingStep3 
          onNext={() => setCurrentScreen('MAIN')} 
          category={category} 
          selectedParts={selectedParts} 
          setSelectedParts={setSelectedParts} 
          textSize={textSize}
        />
      )}
      {currentScreen === 'MAIN' && (
        <MainHome 
          onGoDetail={(part) => { setDetailPart(part); setCurrentScreen('DETAIL'); }}
          category={category}
          selectedParts={selectedParts}
          textSize={textSize}
        />
      )}
      {currentScreen === 'DETAIL' && (
        <DetailPrice 
          onBack={() => setCurrentScreen('MAIN')}
          part={detailPart}
          category={category}
          textSize={textSize}
        />
      )}
    </div>
  );
}

export default App;
