# 현재 진행 상황 (Status)

## 📅 작업 기록 및 현재 상태
- **[완료]** 대규모 리팩토링을 통해 `App.jsx`에서 UI, Data, API 계층 분리 완료.
- **[완료]** `mockData.js` (정적 창고) 및 `priceApi.js` (동적 모의 서버) 구조 설계 완료.
- **[진행 중]** 분리된 `src/ui/pages/` 하위 화면들(Onboarding 1~3, MainHome, DetailPrice)의 마크업 및 스타일 검토.

## 🏃‍♂️ 현재 집중해야 할 작업 (Current Task)
- `utils/textStyle.js` 공통 로직이 분리된 UI 페이지 컴포넌트들(`OnboardingStep1.jsx` 등)에 올바르게 import되어 반영되어 있는지 확인 및 화면 고도화.

## ⏭️ 다음 할 일 (Next Todo)
1. 온보딩 1~3단계 -> 메인 홈 -> 상세 페이지로 이어지는 전역 상태(State) 흐름 검증.
2. 각 화면의 UI 컴포넌트가 Mock API의 로딩 상태(`isLoading`)를 받아 스켈레톤 UI를 정상적으로 렌더링하는지 확인.