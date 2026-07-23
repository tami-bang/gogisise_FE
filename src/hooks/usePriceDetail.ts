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

interface DetailCacheEntry {
  detail: AggregatedPriceDetail;
  fetchedAt: number;
}

// 💡 [한글 주석] 상세 시세 데이터를 보관할 전역 메모리 맵 캐시 및 30초 수명 설정
const detailCache = new Map<string, DetailCacheEntry>();
const DETAIL_CACHE_TTL = 30 * 1000; // 30초

// 💡 [한글 주석] 사용자가 클릭하기 전 마우스 오버(Hover) 또는 터치 시점에 미리 백그라운드에서 API를 찔러두는 Prefetch 함수 구현
export const prefetchPriceDetail = async (itemId: string | null, accessToken?: string | null) => {
  if (!itemId) return;
  const cached = detailCache.get(itemId);
  if (cached && Date.now() - cached.fetchedAt < DETAIL_CACHE_TTL) return;

  try {
    const result = await marketService.getPriceDetail(itemId, { accessToken });
    const hasData =
      (result?.sourceRecords?.length ?? 0) > 0 ||
      (result?.sourceItems?.length ?? 0) > 0;
    if (result && hasData) {
      detailCache.set(itemId, {
        detail: result,
        fetchedAt: Date.now(),
      });
    }
  } catch (e) {
    console.warn('[Prefetch] Failed to prefetch detail for', itemId, e);
  }
};

export const usePriceDetail = (
  itemId: string | null,
  params: UsePriceDetailParams = {}
) => {
  const { enabled = true, accessToken = null } = params;
  const [status, setStatus] = useState<PriceDetailStatus>('idle');
  const [detail, setDetail] = useState<AggregatedPriceDetail | null>(null);
  const [error, setError] = useState<PriceDetailError | null>(null);

  // 💡 [한글 주석] force 매개변수가 false이고 30초 이내에 동일한 품목을 이미 불러온 캐시가 있다면 API 호출 생략
  const fetchDetail = useCallback(async (force = false) => {
    if (!enabled || !itemId) {
      setStatus('idle');
      setDetail(null);
      setError(null);
      return;
    }

    const cached = detailCache.get(itemId);
    if (!force && cached && (Date.now() - cached.fetchedAt < DETAIL_CACHE_TTL)) {
      setDetail(cached.detail);
      setStatus('success');
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
        // 💡 [한글 주석] 성공적으로 받아온 시세 내역은 30초 동안 메모리에 보관
        detailCache.set(itemId, {
          detail: result,
          fetchedAt: Date.now(),
        });
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

  // 💡 [한글 주석] 마운트 및 itemId 변경 시 캐시를 우선(force = false)하여 데이터 요청을 보냅니다.
  useEffect(() => {
    fetchDetail(false);
  }, [fetchDetail]);

  return {
    status,
    detail,
    error,
    refetch: fetchDetail,
  };
};
