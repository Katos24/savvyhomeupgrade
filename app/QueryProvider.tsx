'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Created once per browser session via useState, not on every render —
  // this is the standard React Query setup pattern for Next.js.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60s — navigating back to a
            // page within that window skips the network call entirely,
            // which is exactly the "blank flash while refetching
            // something already known" pattern from today's logs.
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}