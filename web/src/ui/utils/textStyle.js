// --- State Context (글자 크기 스케일링 헬퍼) ---
export const getTextClasses = (baseSize, scale) => {
  const scales = {
    'DEFAULT': { caption: 'text-[14px]', label: 'text-[16px]', body: 'text-[18px]', bodyLg: 'text-[20px]', title: 'text-[22px]', titleXl: 'text-[24px]', headline: 'text-[28px]', display: 'text-[32px]' },
    'LARGE': { caption: 'text-[16px]', label: 'text-[18px]', body: 'text-[20px]', bodyLg: 'text-[22px]', title: 'text-[24px]', titleXl: 'text-[26px]', headline: 'text-[30px]', display: 'text-[34px]' },
    'VERY_LARGE': { caption: 'text-[18px]', label: 'text-[20px]', body: 'text-[22px]', bodyLg: 'text-[24px]', title: 'text-[26px]', titleXl: 'text-[28px]', headline: 'text-[32px]', display: 'text-[38px]' }
  };
  return scales[scale][baseSize] || scales['DEFAULT'][baseSize];
};
