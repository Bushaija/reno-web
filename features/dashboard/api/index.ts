import { useQuery } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { DashboardStatsResponse } from '@/app/api/[[...route]]/routes/web/dashboard/dashboard.types';

// Fetch dashboard analytics statistics
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await handleHonoResponse<DashboardStatsResponse>(
        honoClient.api['/admin/dashboard/stats'].$get({
          query: {},
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data;
    },
  });
}
