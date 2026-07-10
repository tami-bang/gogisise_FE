// 화면 최상단에 고정되는 헤더 컴포넌트입니다.
export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-start min-h-[72px] px-5 bg-(--color-surface) border-b border-(--color-divider)">
      <div className="flex items-center gap-2">
        <span className="text-3xl" aria-hidden="true">🏪</span>
        <h1 className="text-title-xl text-(--text-strong) tracking-tight">
          오늘의 암컷 축산물<br />도매 가격입니다
        </h1>
      </div>
    </header>
  );
}
