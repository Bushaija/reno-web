import { useQuery } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';

// Fetch dashboard analytics statistics
export function useDashboardStats(period = 'today', departmentId?: string | number) {
  return useQuery({
    queryKey: ['dashboard-metrics', period, departmentId],
    queryFn: async () => {
      const res = await handleHonoResponse<any>(
        honoClient.api['/reports/dashboard-metrics'].$get({
          query: {
            period,
            departmentId,
          },
          header: {},
          cookie: {},
        })
      );
      return res.data;
    },
  });
}
