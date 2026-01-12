'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { apiClient } from '@/lib/api/client';
import { isNetworkError, getErrorMessage } from '@/lib/errors';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Cache strategy
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,

        // Error retry strategy
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          // Don't retry 404 errors
          if ((error as { status?: number }).status === 404) return;

          // Only retry network errors
          if (!isNetworkError(error)) return;

          // Max 3 retries
          if (retryCount >= 3) return;

          setTimeout(() => revalidate({ retryCount }), 1000 * (retryCount + 1));
        },

        // Global error handler
        onError: (error, key) => {
          console.error(`SWR Error [${key}]:`, getErrorMessage(error));
        },

        // Default fetcher
        fetcher: (url: string) => apiClient.get(url),
      }}
    >
      {children}
    </SWRConfig>
  );
}
