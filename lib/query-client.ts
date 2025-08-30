/**
 * @file TanStack Query Client configuration.
 * @version 1.0.0
 * @since 2024-07-26
 */
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Default error handler for TanStack Query.
 * Logs the error and displays a toast notification.
 * @param {unknown} error - The error object.
 */
const queryErrorHandler = (error: unknown) => {
  const title = error instanceof Error ? error.message : 'An unknown error occurred';
  console.error(title);
  toast.error('Something went wrong', {
    description: title,
  });
};

/**
 * Creates and configures a new QueryClient instance.
 *
 * Default Query Options:
 * - `staleTime`: 5 minutes. Data is considered fresh for this long.
 * - `cacheTime`: 15 minutes. Data is kept in the cache for this long after it becomes inactive.
 * - `refetchOnWindowFocus`: false. Prevents refetching when the window regains focus.
 * - `retry`: 1. Retry failed requests once before showing an error.
 *
 * Default Mutation Options:
 * - `onError`: Uses the global `queryErrorHandler`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      onError: queryErrorHandler,
    },
  },
});
