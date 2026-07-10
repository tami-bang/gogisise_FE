# 디자인 토큰/헌법 (Design System Specification) v1.3.0

## 1. 프로젝트 개요 및 핵심 철학
- **주요 타겟**: 축산 시장 도매 시세를 매일 아침 확인하는 60–70대 암컷 전문 식육점 사장님
- **기본 철학**: 인지 부하 최소화(Don't Make Me Think), 단일 컬럼 vertical flow 사수, One UI 상하 분할 적용.
- **시각적 목표**: 배경과의 확실한 구분을 위해 **배경과의 대비를 4.5:1 이상**으로 유지하며, 지정된 핵심 색상 4가지를 활용해 높은 시인성과 경쾌한 느낌을 동시 전달합니다.

---

## 2. 레이아웃 3단 구조 규격 (Header / Body / Footer 역할 정의)
모든 화면은 스크롤 시 화면 밸런스가 무너지지 않도록 아래의 3단 레이아웃 역할을 엄격히 준수합니다.

* **헤더 (Header) 영역**:
    * **역할**: 화면의 정체성(타이틀) 및 뒤로가기/인디케이터 등 내비게이션 정보 상시 노출.
    * **동작**: `fixed` 또는 `sticky`로 화면 상단에 영구 고정됩니다. 바디 콘텐츠가 스크롤되어 올라가도 헤더는 절대 위로 밀려나지 않고 배경과 분리되어 상단에 고정되어 있어야 합니다. (최소 높이: `72px`, 권장 높이: `80px`, z-index: `50`)
* **바디 (Body) 영역**:
    * **역할**: 실제 도매 시세 데이터, 카테고리 카드, 검색 결과가 노출되는 순수 콘텐츠 영역.
    * **동작**: 헤더와 푸터 사이의 영역을 채우며, 내용이 화면 높이를 넘어설 경우 이 영역 내부에서만 수직 스크롤(`overflow-y-auto`)이 발생합니다. (좌우 패딩 `20px`, 하단 여백 `padding-bottom: 96px` 필수 확보)
* **푸터 (Footer) 영역**:
    * **역할**: 최우선 액션 버튼(선택 완료, 전송 등) 및 앱 기본 탭 내비게이션 바 배치.
    * **동작**: 화면 최하단에 상시 고정(`fixed` 또는 `sticky`) 배치됩니다. 바디 내용의 길이에 상관없이 언제나 엄지손가락이 즉시 닿을 수 있도록 바닥 레이어 위에 완전히 고정 정렬됩니다. (기본 높이: `80px`, CTA 푸터 높이: `96px`, z-index: `60`)

---

## 3. 전역 인터랙션 및 화면 효과 사양 (Interaction & Feedback Profiles)
노안 및 미세한 손떨림이 있을 수 있는 고령 사장님들을 위해 모든 터치 요소는 직관적이고 묵직한 피드백을 필수 연동합니다. 물리적인 탄성 효과(Bounce, Spring)는 어지러움을 유발하므로 금지하며, 투명도와 테두리 중심의 안정적인 전환 효과를 사용합니다.

* **마우스 호버 상태 (Hover State - PC/태블릿 대응)**:
    * 커서가 버튼이나 카드 위에 올라가면 배경색이 5%~10% 어두워지거나, 테두리(`outline`) 색상이 부드럽게 반전됩니다. (전환 속도: `duration-200` / `ease-in-out`)
* **터치/클릭 누름 상태 (Active State - 모바일 필수)**:
    * 버튼이나 카드를 누르는 순간 컴포넌트 전체가 아주 살짝 안으로 들어가는 듯한 축소 피드백(`active:scale-[0.98]`)을 제공하여 "내가 확실히 눌렀다"는 촉각적 힌트를 줍니다.
    * 배경색은 즉시 15% 진해지거나 브랜드 틴트 컬러로 반전되며, 기기 자체의 네이티브 진동(Haptic Feedback)을 가볍게 발생시킵니다.
* **전환 화면 효과 (Transition / Animation)**:
    * 페이지 이동이나 상태 변경 시 화려한 3D 효과나 거대한 이동은 전면 제한합니다.
    * `150ms~250ms` 내외의 부드러운 투명도 흐림 효과(`Fade-in/out`)와 미세한 상하 수직 이동(`2px~4px vertical slide`)만 결합하여 화면의 안정성을 극대화합니다.

---

## 4. 타이포그래피 & 고대비 컬러 시스템 (Meat Price System)
- **폰트**: Noto Sans KR을 보완하여 개발된 **Pretendard** 서체 사용 (행간 최소 1.5 보장, 고정 높이 금지)
- **컬러 원칙**: 어플 내 주요 텍스트와 액션 버튼은 확실한 시인성을 위해 배경과의 대비를 **4.5:1 이상**인 색상으로 엄격히 제한합니다.

---

## 5. 컬러 시스템 규칙 (첨부 이미지 가이드 100% 반영)

### 5.1 Brand Color
| 역할 | 토큰명 | HEX | 명칭 및 특징 | 사용처 |
|---|---|---|---|---|
| **Text Red** | `--color-text-red` | `#d14734` | 텍스트 레벨 4.5:1 레드 | 프리미엄 텍스트 가독성 확보용, 메인 가격 강조, 가격 상승 상태 텍스트 |
| **Primary Orange** | `--color-primary` | `#f85029` | 경쾌한 주황 (Main) | 주요 액션 버튼 배경색, 선택 완료/활성화 상태 카드 테두리 |
| **Point Yellow** | `--color-point-yellow` | `#ffc700` | 경쾌한 노랑 | 카카오톡 공유 버튼 배경색, 중요 알림 및 확인 배지 |
| **Secondary Blue** | `--color-secondary` | `#3b91c8` | 경쾌한 파랑 | 가격 하락 상태 텍스트, 하락 배지 및 보조 정보 안내 배지 |

### 5.2 Semantic Color
| 역할 | 토큰명 | HEX | 사용처 |
|---|---|---|---|
| Success | `--color-success` | `#2e7d32` | 완료, 정상 상태 |
| Warning | `--color-warning` | `#ffc700` | 이미지 지정 노랑 활용 (주의, 확인 필요) |
| Error | `--color-error` | `#d14734` | 이미지 지정 레드를 활용한 에러 피드백 |
| Info | `--color-info` | `#3b91c8` | 안내, 정보성 메시지 (이미지 지정 파랑) |

### 5.3 Surface / Background
| 역할 | 토큰명 | HEX | 사용처 |
|---|---|---|---|
| App Background | `--color-bg` | `#f9f9f9` | 앱 전체 배경 |
| Surface | `--color-surface` | `#ffffff` | 카드, 푸터, 바텀시트 |
| Surface Soft | `--color-surface-soft` | `#f5f5f5` | 비활성 카드, 입력창 배경 |
| Border | `--color-border` | `#e5e5e5` | 카드 경계선 |
| Divider | `--color-divider` | `#eeeeee` | 구분선 |
| Disabled | `--color-disabled` | `#c7c7c7` | 비활성 버튼 |

### 5.4 Text Color
| 역할 | 토큰명 | HEX | 사용처 |
|---|---|---|---|
| Text Strong | `--text-strong` | `#1f1f1f` | 가격, 제목 (배경 대비 최우선 고대비 블랙) |
| Text Default | `--text-default` | `#333333` | 본문 |
| Text Muted | `--text-muted` | `#666666` | 보조 설명 |
| Text Light | `--text-light` | `#999999` | 캡션, 날짜 |
| Text Inverse | `--text-inverse` | `#ffffff` | Primary 버튼 내부 텍스트 |

### 5.5 가격 등락 컬러 규칙
| 상태 | 색상 | 규칙 |
|---|---|---|
| 가격 상승 | `#d14734` | 전일 대비 `+` 값, 가독성이 확보된 상승 배지 및 텍스트 필수 연동, 기호는 **▲** 사용 |
| 가격 하락 | `#3b91c8` | 전일 대비 `-` 값, 경쾌한 파랑 배지 및 텍스트 필수 연동, 기호는 **▼** 사용 |
| 가격 동일 | `#666666` | 변동 없음, 회색 배지 및 텍스트 연동, 기호는 **—** 사용 |
| 최고가 강조 | `#f85029` | 오늘 가장 높은 관심 부위 배경 및 테두리 |
| 최저가 강조 | `#3b91c8` | 오늘 가장 낮은 관심 부위 텍스트 |

---

## 6. 타이포그래피 규칙

### 6.1 기본 폰트
- Font Family: `Pretendard`
- fallback: `system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- 최소 행간: `1.5`
- 고정 높이 금지
- 가격 숫자는 반드시 굵게 표시

### 6.2 Type Scale
| 역할 | 토큰 | 크기 | 굵기 | 사용처 |
|---|---|---:|---:|---|
| Display | `text-display` | 32px | 800 | 메인 가격 |
| Headline | `text-headline` | 28px | 800 | 핵심 시세 |
| Title XL | `text-title-xl` | 24px | 700 | 화면 제목 |
| Title | `text-title` | 22px | 700 | 카드 제목 |
| Body Large | `text-body-lg` | 20px | 600 | 주요 본문 |
| Body | `text-body` | 18px | 500 | 일반 본문 |
| Label | `text-label` | 16px | 600 | 버튼, 탭 |
| Caption | `text-caption` | 14px | 500 | 보조 설명 |

### 6.3 고령 사용자용 글자 크기 옵션
| 옵션 | 기준 |
|---|---|
| 보통 | 기본 토큰 사용 |
| 크게 | 모든 본문 +2px |
| 매우 크게 | 모든 본문 +4px, 가격 +6px |

---

## 7. 간격 시스템
모든 간격은 아래 값만 사용합니다.
| 토큰 | 값 | 사용처 |
|---|---:|---|
| `space-4` | 4px | 아이콘 내부 간격 |
| `space-8` | 8px | 작은 요소 간격 |
| `space-12` | 12px | 카드 내부 보조 간격 |
| `space-16` | 16px | 기본 패딩 |
| `space-20` | 20px | 카드 내부 패딩 |
| `space-24` | 24px | 섹션 간격 |
| `space-32` | 32px | 큰 섹션 간격 |
| `space-40` | 40px | 화면 상하 여백 |

### 화면 기본 패딩
- 모바일 좌우 패딩: `20px`
- 카드 내부 패딩: `20px`
- 카드 간격: `16px`
- 섹션 간격: `24px`

---

## 8. Radius / Shape 규칙
| 토큰 | 값 | 사용처 |
|---|---:|---|
| `radius-sm` | 8px | 작은 배지 |
| `radius-md` | 12px | 입력창, 칩 |
| `radius-lg` | 16px | 기본 카드 |
| `radius-xl` | 20px | 대형 카드 |
| `radius-2xl` | 24px | 히어로 카드, 바텀시트 |
| `radius-full` | 999px | 알약 버튼, 원형 아이콘 |

---

## 9. Shadow / Elevation 규칙
| 토큰 | 값 | 사용처 |
|---|---|---|
| `shadow-soft` | `0 4px 16px rgba(0,0,0,0.06)` | 기본 카드 |
| `shadow-medium` | `0 8px 24px rgba(0,0,0,0.10)` | 선택 카드 hover |
| `shadow-footer` | `0 -4px 20px rgba(0,0,0,0.08)` | 하단 고정 푸터 |
| `shadow-none` | 없음 | 플랫 리스트 |

---

## 10. 컴포넌트 공통 규칙

### 10.1 버튼
| 속성 | 규칙 |
|---|---|
| 최소 높이 | 56px |
| 권장 높이 | 64px |
| 좌우 패딩 | 20px 이상 |
| 글자 크기 | 18px 이상 |
| 터치 영역 | 최소 48x48dp |
| Radius | 16px 이상 |

### Primary Button
- 배경: `--color-primary` (#f85029)
- 글자: `--text-inverse` (#ffffff)
- Hover: 배경색 10% 어두워짐
- Active: 배경색 15% 진해짐, `scale(0.98)`
- Disabled: `--color-disabled` (#c7c7c7), 글자 `#ffffff`

### Secondary Button
- 배경: `#ffedea`
- 글자: `--color-primary` (#f85029)
- 테두리: `1px solid --color-primary` (#f85029)

---

## 11. 카드 규칙

### 기본 카드
- 배경: `--color-surface` (#ffffff)
- Radius: `radius-xl` (20px)
- Padding: `space-20` (20px)
- Border: `1px solid --color-divider` (#eeeeee)
- Shadow: `shadow-soft`

### 선택 카드
- Border: `2px solid --color-primary` (#f85029)
- Background: `#ffedea`
- Icon Background: `--color-primary` (#f85029)
- Check Icon: `--text-inverse` (#ffffff)

### 비활성 카드
- Background: `--color-surface-soft` (#f5f5f5)
- Text: `--text-light` (#999999)
- Border: `1px solid --color-border` (#e5e5e5)

---

## 12. 입력창 규칙
### Search Input / Text Field
- 높이: `56px` 이상
- Radius: `radius-lg` (16px)
- Background: `--color-surface` (#ffffff)
- Border: `1px solid --color-border` (#dddddd)
- Focus Border: `2px solid --color-primary` (#f85029)
- Placeholder: `--text-light` (#999999)
- Text: `--text-strong` (#1f1f1f)
- Icon: `--text-muted` (#666666)

---

## 13. Badge / Chip 규칙
### 상승 배지
- 배경: `#ffedea`
- 글자: `--color-text-red` (#d14734)

### 하락 배지
- 배경: `#edf6fc`
- 글자: `--color-secondary` (#3b91c8)

### 동일 배지
- 배경: `--color-surface-soft` (#f5f5f5)
- 글자: `--text-muted` (#666666)

### 선택 Chip
- 선택 전: 흰색 배경 + 회색 테두리
- 선택 후: 메인 주황 배경 (`--color-primary`) + 흰색 글자

---

## 14. 아이콘 규칙
- 기본 아이콘 크기: `24px`
- 주요 카드 아이콘: `32px`
- 온보딩 대형 아이콘: `48px`
- 에러 아이콘: `64px`
- 아이콘 선 굵기: 너무 얇지 않게 사용

### 축종 아이콘
| 축종 | 아이콘 |
|---|---|
| 한우 | 둥근 소 일러스트 / 🐄 |
| 한돈 | 둥근 돼지 일러스트 / 🐖 |

---

## 15. Motion 규칙
### 허용
- 차트(그래프) 시각화 사양: 복잡한 대시보드 차트는 제한하되, 노안 고령 사용자의 직관적인 동향 파악을 돕기 위해 **"자잘한 미세 격자선과 축 수치 텍스트가 완전히 생략된, 7일간의 가격 흐름만 굵게 노출하는 단순 SVG 세로 막대(Bar) 혹은 꺾은선(Line) 그래프"** 컴포넌트는 누락 없이 필수 포함 및 렌더링하도록 정의함.
- Fade: 150–250ms
- Small Slide: 2–4px
- Active Scale: 0.98
- Color Transition: 150–200ms

### 금지
- Bounce, Spring, 과한 Scale, 3D Flip, 큰 좌우 이동, 빠른 깜빡임, 계속 흔들리는 애니메이션

---

## 16. 접근성 규칙
- 모든 터치 요소 최소 `48x48dp`
- 주요 버튼 권장 높이 `64px`
- 본문 최소 `18px`, 가격 최소 `28px`
- 회색 글자는 `--text-light` (#999999)보다 연하게 쓰지 않음
- 텍스트와 배경 대비 확보 (4.5:1 원칙 준수)
- 색상만으로 상태 전달 금지  
  - 상승: 색상 + ▲
  - 하락: 색상 + ▼
  - 동일: 색상 + —
- 버튼 문구는 행동 중심으로 작성 (예: '선택 완료하기')

---

## 17. 문구 UX 규칙
### 원칙
- 짧게, 어렵지 않게, 사장님이 바로 이해하게, 개발자/금융/차트 용어 금지

| 상황 | 문구 |
|---|---|
| 로딩 | 오늘 시세를 불러오고 있어요 |
| 에러 | 시세를 불러오지 못했어요 |
| 재시도 | 다시 불러오기 |
| 선택 전 | 먼저 고기 종류를 골라주세요 |
| 선택 완료 | 선택 완료하기 |
| 검색 없음 | 찾는 부위가 없어요 |

---

## 18. 금지 UI 패턴
- 복잡한 표 중심 화면, 작은 글씨가 빽빽한 대시보드, 코인 거래소 스타일 차트, 과한 애니메이션, 한 화면에 2개 이상의 주요 CTA, 좌우 스와이프 필수 구조, 작고 얇은 아이콘 버튼, 의미 없는 장식 일러스트, 회색 글씨 과다 사용

---

## 19. 화면 명세서 작성 가이드라인 (Screen Spec Rules)
각 페이지 단위 명세(`docs/design/pages/*.md`)를 기술할 때는 개발 및 마크업 검증이 누락 없이 가능하도록 아래 3가지 요소를 **반드시 명시**해야 합니다.

1. **위치 정의**: 해당 컴포넌트가 레이아웃 3단 구조(Header / Body / Footer) 중 어디에 속하는지 명확히 선언할 것.
2. **컴포넌트 정의**: UI 요소의 역할과 텍스트 문구(UX 텍스트)를 정확하게 기록할 것.
3. **토큰 참조**: 해당 컴포넌트에 적용되는 디자인 토큰(컬러, 타이포그래피, 마진, 라디우스 등)을 괄호 `()` 안에 바인딩할 것.