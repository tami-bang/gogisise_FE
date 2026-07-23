import { useCallback, useEffect, useState } from 'react';
import { marketService } from '../api/services/marketService';
import { ApiClientError } from '../api/types/common';
import type { MarketSummary } from '../api/types/market';
import { getErrorMessage } from '../utils/errorDictionary';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface AsyncError {
  errorCode: string;
  message: string;
}

interface UseMarketSummaryParams {
  enabled?: boolean;
  accessToken?: string | null;
}

const toAsyncError = (error: unknown): AsyncError => {
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

const CACHE_KEY = 'gogisise:cache:market_summary';
// 💡 [한글 주석] 시세 요약 캐시 시간 기록 키 및 5분 유효 기한 설정
const CACHE_TIME_KEY = 'gogisise:cache:market_summary_time';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

export function useMarketSummary(params: UseMarketSummaryParams = {}) {
  const { enabled = true, accessToken = null } = params;
  
  const [summary, setSummary] = useState<MarketSummary | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState<AsyncStatus>(() => {
    try {
      return localStorage.getItem(CACHE_KEY) ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });

  const [error, setError] = useState<AsyncError | null>(null);

  // 💡 [한글 주석] force가 false이고 캐시 수명이 5분 미만으로 남았으면 API 호출을 하지 않고 기존 캐시값을 유지하도록 최적화
  const refetch = useCallback(async (force = false) => {
    if (!enabled) {
      setStatus('idle');
      setSummary(null);
      return;
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      if (!force && cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);
        if (age < CACHE_TTL_MS) {
          // 캐시가 아직 유효하므로 즉시 성공 상태로 간주하고 리턴
          setStatus('success');
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to verify market summary cache age', e);
    }

    const controller = new AbortController();
    setStatus((prev) => (prev === 'success' ? 'success' : 'loading'));
    setError(null);

    try {
      const result = await marketService.getMarketSummary({
        accessToken,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setSummary(result);
      setStatus('success');
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString()); // 캐시 저장 시각 기록
      } catch (e) {
        console.warn('Failed to cache market summary', e);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(toAsyncError(err));
      setStatus('error');
    }
  }, [accessToken, enabled]);

  // 💡 [한글 주석] 마운트 및 의존성 변경 시 refetch(false)를 호출하여 캐시를 체크하고 데이터 업데이트 수행
  useEffect(() => {
    refetch(false);
  }, [refetch]);

  return {
    status,
    summary,
    error,
    refetch,
  };
}
