'use client';

/**
 * @file Provides the TanStack Query client to the React application.
 * @version 1.0.0
 * @since 2024-07-26
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { queryClient as defaultQueryClient } from '@/lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * A provider component that wraps the application with TanStack Query's QueryClientProvider.
 * It also includes the React Query Devtools for use in development environments.
 *
 * @param {QueryProviderProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => defaultQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
