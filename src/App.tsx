import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { AllPricesPage } from './pages/AllPricesPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSettings } from './hooks/useSettings';
import './index.css';

function App() {
  // 전역 설정 불러오기 (글자 크기 등)
  useSettings();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/favorites" replace />} />
        <Route path="/favorites" element={<MainPage />} />
        <Route path="/all-prices" element={<AllPricesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
