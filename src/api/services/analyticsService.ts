import { apiClient } from '../apiClient';
import type { ApiRequestOptions } from '../types/common';

const ANALYTICS_PATH = '/api/v1/analytics';

interface AnalyticsServiceOptions {
  accessToken?: string | null;
  signal?: AbortSignal;
}

const toApiOptions = (options?: AnalyticsServiceOptions): ApiRequestOptions => ({
  accessToken: options?.accessToken,
  signal: options?.signal,
});

export const analyticsService = {
  recordView: async (
    itemId: string,
    options?: AnalyticsServiceOptions
  ): Promise<void> => {
    await apiClient.post<void>(
      `${ANALYTICS_PATH}/view`,
      { itemId },
      toApiOptions(options)
    );
  },
};
