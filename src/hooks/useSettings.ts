import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';

export interface AppSettings {
  fontSize: FontSize;
}

const SETTINGS_STORAGE_KEY = 'gogisise:settings';

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 'normal',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const applyFontSizeToDom = (size: FontSize) => {
    // data-font-size 속성을 html 요소에 적용합니다. index.css 에서 이 속성을 기준으로 폰트 크기 변수를 재정의합니다.
    document.documentElement.setAttribute('data-font-size', size);
  };

  // 초기 렌더링 시 DOM에 적용
  useEffect(() => {
    applyFontSizeToDom(settings.fontSize);
  }, [settings.fontSize]);

  const updateFontSize = useCallback((size: FontSize) => {
    setSettings((prev) => {
      const nextSettings = { ...prev, fontSize: size };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
      } catch (e) {
        console.error('Failed to save settings to localStorage', e);
        return prev; // 롤백
      }
      return nextSettings;
    });
  }, []);

  return {
    settings,
    updateFontSize,
  };
};
