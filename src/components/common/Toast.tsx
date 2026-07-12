import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-[#333333] text-white rounded-full shadow-medium text-body font-bold animate-fade-in whitespace-nowrap">
      {message}
    </div>
  );
}
