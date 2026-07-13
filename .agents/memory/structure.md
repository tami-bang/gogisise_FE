# 프로젝트 디렉토리 구조 (Project Structure)

> 💡 본 문서의 목적은 현재 프로젝트의 최신 구조를 정의하고 동기화하는 것입니다. 에이전트가 `/structure` 명령을 통해 실시간 트리 구조를 기반으로 자동 갱신한 메모리입니다.

## 📁 전체 구조 트리 (주석포함)
```text
.
├── .agents                                # 에이전트 시스템 전체 메인 가이드라인
│   ├── memory                             # 상태 및 구조 메모리 보관
│   │   ├── context.md                     # 문맥
│   │   ├── history.md                     # 작업 완료 기록
│   │   ├── status.md                      # 현재 상태
│   │   └── structure.md                   # 디렉토리 구조
│   ├── rules                              # 에이전트 시스템 규칙
│   │   ├── education.md                   # 교육 가이드라인
│   │   └── rules.md                       # 전역 룰
│   └── workflows                          # 워크플로우 정의
│       ├── arichitecture.md               # 아키텍처 가이드라인
│       ├── commit_convention.md           # 커밋 컨벤션
│       ├── feature_request.md             # 기능 요청
│       └── structure.md                   # 구조 갱신
├── dist                                   # 빌드된 정적 파일 (배포용)
│   ├── assets                             # 번들링된 자산 (JS, CSS)
│   │   ├── index-hinOPjvV.js              # 번들링된 자바스크립트
│   │   └── index-rniEDiKB.css             # 번들링된 스타일시트
│   ├── favicon.svg                        # 빌드된 파비콘
│   ├── icons.svg                          # 빌드된 아이콘 스프라이트
│   └── index.html                         # 빌드된 메인 진입점 HTML
├── docs                                   # 프로젝트 기획 및 디자인 문서 보관
│   ├── bible                              # 핵심 원칙 및 명세서
│   │   ├── CATEGORIES.md                  # 카테고리 명세서
│   │   ├── FUNCTIONS.md                   # 상세 기능 명세서
│   │   ├── PRD.md                         # 제품 요구사항 정의서
│   │   ├── TECHSTACK.md                   # 기술 스택 명세
│   │   └── commit_convention.md           # 깃 커밋 메시지 규칙 가이드
│   ├── data                               # 데이터 모델 및 명세
│   │   ├── INTERNAL_RAW_SPEC.md           # 내부 로우 데이터 구조
│   │   ├── USER_AUTH_SPEC.md              # 사용자 인증/권한 명세 (신규)
│   │   └── USER_SERVED_SPEC.md            # 사용자 제공 데이터 명세
│   └── design                             # 화면 설계 및 디자인 시스템
│       ├── components                     # 공통 재사용 UI 컴포넌트 명세
│       │   ├── 1_button.md                # 버튼 컴포넌트 스펙
│       │   ├── 2_card.md                  # 카드 레이아웃 명세
│       │   ├── 3_badge.md                 # 뱃지 명세
│       │   ├── 4_chart.md                 # 차트 명세
│       │   ├── 5_header_footer.md         # 헤더 푸터 명세
│       │   ├── 6_toggle_tab.md            # 토글 및 탭 명세
│       │   └── 7_grid_tile.md             # 그리드 타일 명세
│       ├── pages                          # 개별 화면 명세
│       │   ├── 0_main(mobile).md          # 모바일 메인
│       │   ├── 0_main(window).md          # 윈도우 메인
│       │   ├── 1_detail_price.md          # 가격 상세 조회
│       │   ├── 2_onboarding_step1_textsize.md # 텍스트 설정 온보딩
│       │   ├── 3_onboarding_step2_selectcategory.md # 관심 카테고리 온보딩
│       │   └── 4_onboarding_step3_searchableselect.md # 검색 온보딩
│       └── BASE.md                        # 기본 디자인 시스템
├── public                                 # 정적 에셋
│   ├── favicon.svg                        # 파비콘
│   └── icons.svg                          # 공통 아이콘 스프라이트
├── src                                    # 메인 소스 코드 디렉토리
│   ├── api                                # API 연동 계층
│   │   ├── mock                           # 모의 데이터
│   │   │   └── marketMock.ts              # 시세 모의 데이터
│   │   ├── services                       # API 서비스
│   │   │   ├── marketService.ts           # 시장 데이터 서비스
│   │   │   └── priceAggregationService.ts # 가격 집계 서비스
│   │   ├── types                          # 타입 정의
│   │   │   └── market.ts                  # 시장 데이터 타입
│   │   └── index.ts                       # API 엔트리
│   ├── assets                             # 빌드용 내부 정적 자산
│   │   ├── hero.png                       # 히어로 이미지
│   │   └── vite.svg.jpg                   # Vite 아이콘
│   ├── components                         # UI 컴포넌트
│   │   ├── common                         # 공통 컴포넌트
│   │   │   ├── Badge.tsx                  # 뱃지 컴포넌트
│   │   │   ├── Button.tsx                 # 버튼 컴포넌트
│   │   │   ├── ConfirmDialog.tsx          # 확인 대화상자
│   │   │   ├── EmptyState.tsx             # 빈 상태 표시
│   │   │   ├── ErrorState.tsx             # 에러 상태 표시
│   │   │   ├── FontSizeSelector.tsx       # 폰트 크기 선택기
│   │   │   ├── Footer.tsx                 # 푸터
│   │   │   ├── Header.tsx                 # 헤더
│   │   │   ├── InlineError.tsx            # 인라인 에러
│   │   │   ├── Layout.tsx                 # 기본 레이아웃
│   │   │   ├── ListSkeleton.tsx           # 리스트 스켈레톤
│   │   │   ├── LoadingScreen.tsx          # 로딩 스크린
│   │   │   ├── PageLayout.tsx             # 페이지 레이아웃
│   │   │   ├── Pagination.tsx             # 페이지네이션
│   │   │   ├── SearchInput.tsx            # 검색 입력창
│   │   │   ├── SegmentedControl.tsx       # 세그먼트 컨트롤 탭
│   │   │   └── Toast.tsx                  # 토스트 알림
│   │   └── domain                         # 도메인 특화 컴포넌트
│   │       ├── price-detail               # 시세 상세 관련
│   │       │   ├── DetailHeader.tsx       # 상세 화면 헤더
│   │       │   ├── PriceDetailSheet.tsx   # 시세 상세 바텀시트
│   │       │   ├── PriceSummaryCard.tsx   # 시세 요약 카드
│   │       │   └── SourceList.tsx         # 소스(출처) 리스트
│   │       ├── AnimalSelect.tsx           # 동물(품목) 선택기
│   │       ├── FavoriteManager.tsx        # 즐겨찾기 관리자
│   │       ├── FavoritePriceList.tsx      # 관심 시세 리스트
│   │       ├── FavoriteShareSheet.tsx     # 즐겨찾기 공유 시트
│   │       ├── KakaoShareButton.tsx       # 카카오 공유 버튼
│   │       ├── PriceCard.tsx              # 가격 카드
│   │       └── SummaryStats.tsx           # 요약 통계
│   ├── hooks                              # 커스텀 훅
│   │   ├── useFavorites.ts                # 즐겨찾기 훅
│   │   ├── usePriceDetail.ts              # 가격 상세 훅
│   │   └── useSettings.ts                 # 설정 훅
│   ├── pages                              # 라우팅 단위 화면 컨테이너
│   │   ├── AllPricesPage.tsx              # 전체 시세 페이지
│   │   ├── MainPage.tsx                   # 메인 대시보드
│   │   └── SettingsPage.tsx               # 설정 페이지
│   ├── utils                              # 유틸리티 함수
│   │   ├── formatter.ts                   # 포맷팅 유틸
│   │   └── koreanSearch.ts                # 한국어 초성 검색 유틸
│   ├── App.tsx                            # 최상위 라우팅 및 전역 상태 관리
│   ├── index.css                          # 글로벌 스타일시트
│   └── main.tsx                           # 앱 진입점
├── .gitignore                             # Git 추적 제외 파일 목록
├── .gitmessage                            # Git 커밋 메시지 템플릿
├── .oxlintrc.json                         # oxlint 설정
├── README.md                              # 프로젝트 소개 및 사용법 리드미
├── index.html                             # 메인 마크업 진입점
├── package-lock.json                      # NPM 패키지 잠금 파일
├── package.json                           # 패키지 설정 및 스크립트
├── tsconfig.app.json                      # 타입스크립트 앱 설정
├── tsconfig.json                          # 타입스크립트 베이스 설정
├── tsconfig.node.json                     # Vite 노드 환경 설정
└── vite.config.ts                         # Vite 빌드 설정
```

## 🧠 주요 폴더 및 파일 설명 (비유: IT 회사의 조직 및 설계도)

이 프로젝트를 하나의 **'IT 회사 조직'과 그 '설계도'**에 비유하여 설명합니다.

1. **`docs/` (기획/디자인 부서 & 회사 설계도)**
   - 회사의 나아갈 방향과 규칙, 화면의 청사진을 보관하는 곳입니다.
   - **`bible/`**: 회사의 핵심 가치와 요구사항, 기술 스택을 명시하는 '헌법' 역할을 합니다.
   - **`design/`**: 디자이너와 기획자가 구상한 UI/UX 설계도면(컴포넌트 및 페이지 명세)들이 모여있습니다.
   - **`data/`**: 최근 신설된 부서로, 데이터의 형태(`USER_AUTH_SPEC.md` 등)를 정의하고 체계화합니다.

2. **`src/` (본사 작업 현장 - 엔지니어링 본부)**
   - 회사의 실질적인 제품(프론트엔드 앱)을 만들어내는 주요 생산 공장입니다. TypeScript 기반으로 업그레이드되어 더욱 견고하게 운영됩니다.
   - **`api/` (통신팀)**: 외부 데이터 소스와의 인터페이스를 담당하며, 모델(`types`), 모의 데이터(`mock`), 실제 요청(`services`)으로 세분화되어 전문적으로 일합니다.
   - **`components/` (조립 공정)**: 공용 부품(`common`)과 도메인 특화 부품(`domain`)을 모듈화하여 조립 라인을 효율화합니다.
   - **`pages/` (최종 쇼룸)**: 만들어진 컴포넌트들을 모아 사용자에게 보여주는 실제 화면 단위의 결과물입니다.
   - **`App.tsx` (총괄 매니저)**: 사용자가 어떤 화면으로 가야 할지 안내(라우팅)하고, 전체적인 흐름을 조율합니다.

3. **`dist/` & `public/` (물류 창고 및 출하 센터)**
   - 고객에게 최종적으로 전달될 정적 자산과 번들링된 완성품이 보관되고 출하되는 곳입니다. 최근 빌드가 추가되어 출하 대기 중인 패키지(`assets`)들이 확인됩니다.

4. **`.agents/` (경영 지원 AI 로봇 - 영속적 기억 장치)**
   - 현재 디렉토리 트리에는 노출되지 않지만, 프로젝트의 흐름과 규칙을 관리하는 두뇌입니다.
   - `memory/`를 통해 현재 상태와 프로젝트 개요를 잊지 않고 기억하며, `rules/`와 `workflows/`를 통해 정해진 지침에 따라 업무를 완벽하게 보조합니다.