import { useState, useCallback, useEffect } from 'react';
import { marketService } from '../api/services/marketService';
import { ApiClientError } from '../api/types/common';
import type { AggregatedPriceDetail } from '../api/types/market';
import { getErrorMessage } from '../utils/errorDictionary';

type PriceDetailStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface PriceDetailError {
  errorCode: string;
  message: string;
}

interface UsePriceDetailParams {
  enabled?: boolean;
  accessToken?: string | null;
}

const toPriceDetailError = (error: unknown): PriceDetailError => {
  if (error instanceof ApiClientError) {
    return {
      errorCode: error.errorCode,
      message: error.message || getErrorMessage(error.errorCode),
    };
  }

  return {
    errorCode: 'UNKNOWN_ERROR',
    message: getErrorMessage('UNKNOWN_ERROR'),
  };
};

export const usePriceDetail = (
  itemId: string | null,
  params: UsePriceDetailParams = {}
) => {
  const { enabled = true, accessToken = null } = params;
  const [status, setStatus] = useState<PriceDetailStatus>('idle');
  const [detail, setDetail] = useState<AggregatedPriceDetail | null>(null);
  const [error, setError] = useState<PriceDetailError | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!enabled || !itemId) {
      setStatus('idle');
      setDetail(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    try {
      const result = await marketService.getPriceDetail(itemId, {
        accessToken,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      // 💡 한국어 주석: sourceRecords(집계데이터)가 없어도 sourceItems(크롤링 매물)가 있으면 성공으로 처리합니다.
      const hasData =
        (result?.sourceRecords?.length ?? 0) > 0 ||
        (result?.sourceItems?.length ?? 0) > 0;
      if (!result || !hasData) {
        setStatus('empty');
        setDetail(null);
      } else {
        setDetail(result);
        setStatus('success');
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      console.error(e);
      setError(toPriceDetailError(e));
      setStatus('error');
      setDetail(null);
    }
  }, [accessToken, enabled, itemId]);

  useEffect(() => {
    if (!enabled || !itemId) {
      setStatus('idle');
      setDetail(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    marketService
      .getPriceDetail(itemId, {
        accessToken,
        signal: controller.signal,
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        // 💡 한국어 주석: sourceRecords(집계데이터)가 없어도 sourceItems(크롤링 매물)가 있으면 성공으로 처리합니다.
        const hasData =
          (result?.sourceRecords?.length ?? 0) > 0 ||
          (result?.sourceItems?.length ?? 0) > 0;
        if (!result || !hasData) {
          setStatus('empty');
          setDetail(null);
        } else {
          setDetail(result);
          setStatus('success');
        }
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        console.error(e);
        setError(toPriceDetailError(e));
        setStatus('error');
        setDetail(null);
      });

    return () => {
      controller.abort();
    };
  }, [accessToken, enabled, itemId]);

  return {
    status,
    detail,
    error,
    refetch: fetchDetail,
  };
};
