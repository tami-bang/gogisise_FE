# 프로젝트 표준 폴더 구조 (실시간 반영)

> 💡 이 파일은 에이전트가 \`/structure\` 명령을 받아 실시간 트리 구조를 기반으로 자동 갱신한 메모리입니다.

## 📁 디렉토리 트리
```text
.
├── docs
│   ├── bible
│   │   ├── FUNCTIONS.md
│   │   ├── PRD.md
│   │   └── TECHSTACK.md
│   └── design
│       ├── components
│       │   ├── 1_button.md
│       │   ├── 2_card.md
│       │   ├── 3_badge.md
│       │   ├── 4_chart.md
│       │   ├── 5_header_footer.md
│       │   ├── 6_toggle_tab.md
│       │   └── 7_grid_tile.md
│       ├── pages
│       │   ├── 0_main(mobile).md
│       │   ├── 0_main(window).md
│       │   ├── 1_detail_price.md
│       │   ├── 2_onboarding_step1_textsize.md
│       │   ├── 3_onboarding_step2_selectcategory.md
│       │   └── 4_onboarding_step3_searchableselect.md
│       └── BASE.md
├── web
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src
│   │   ├── api
│   │   │   └── priceApi.js
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── data
│   │   │   └── mockData.js
│   │   ├── ui
│   │   │   ├── pages
│   │   │   └── utils
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── README.md
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
└── index_prototype.html

15 directories, 34 files
```
## 📝 폴더별 핵심 역할 (주석)
- **.agents/memory/**: AI 에이전트의 영속적 기억 저장소
- **web/src/api/**: 외부 서버 통신 및 비동기 Mocking 로직 담당
- **web/src/data/**: 변하지 않는 정적 상수 및 차트용 더미 데이터 창고
- **web/src/ui/pages/**: 라우팅에 의해 제어되는 독립적인 화면 컴포넌트 모음
- **web/src/ui/utils/**: 공통 스타일 및 헬퍼 함수(\`textStyle.js\` 등) 보관
- **web/src/App.jsx**: 전역 상태 및 화면 전환을 제어하는 중앙 라우터