import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { AllPricesPage } from './pages/AllPricesPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSettings } from './hooks/useSettings';
// Antigravity 수정: Fast Refresh 경고 해결을 위해 분리된 AuthProvider를 불러옵니다.
import { AuthProvider } from './contexts/AuthProvider';
// import { useInitializeAuth } from './hooks/useInitializeAuth';
import { useAuth } from './hooks/useAuth';
import { AuthBottomSheet } from './components/domain/auth/AuthBottomSheet';
import './index.css';

function AppContent() {
  // 전역 설정 불러오기 (글자 크기 등)
  useSettings();
  
  // 보안: 앱 부트스트랩 시 Silent Refresh 수행 (토큰 무실점 복구)
  // const { isInitializing } = useInitializeAuth();
  const { isAuthSheetOpen, closeAuthSheet } = useAuth();

  // if (isInitializing) {
  //   return (
  //     <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
  //       <div className="text-[var(--color-primary)] font-bold text-title animate-pulse">앱 초기화 중...</div>
  //     </div>
  //   );
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/favorites" replace />} />
        <Route path="/favorites" element={<MainPage />} />
        <Route path="/all-prices" element={<AllPricesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <AuthBottomSheet isOpen={isAuthSheetOpen} onClose={closeAuthSheet} />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
