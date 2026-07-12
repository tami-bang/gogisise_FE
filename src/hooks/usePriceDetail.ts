import { useState, useCallback, useEffect } from 'react';
import { marketService } from '../api/services/marketService';
import type { AggregatedPriceDetail } from '../api/types/market';

type PriceDetailStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export const usePriceDetail = (itemId: string | null) => {
  const [status, setStatus] = useState<PriceDetailStatus>('idle');
  const [detail, setDetail] = useState<AggregatedPriceDetail | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!itemId) {
      setStatus('idle');
      setDetail(null);
      return;
    }

    setStatus('loading');
    try {
      const result = await marketService.getPriceDetail(itemId);
      if (!result || result.sourceRecords.length === 0) {
        setStatus('empty');
        setDetail(null);
      } else {
        setDetail(result);
        setStatus('success');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setDetail(null);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    status,
    detail,
    refetch: fetchDetail,
  };
};
