import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { Report } from '@/app/api/[[...route]]/routes/web/reports/reports.types';

// Fetch all reports (with optional filters/pagination)
export function useReports(params?: {
  page?: string;
  limit?: string;
}) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          reports: Report[];
          pagination: any;
        };
      }>(
        honoClient.api['/admin/reports'].$get({
          query: params ?? {},
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data;
    },
  });
}

// Generate a new report
export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return handleHonoResponse(
        honoClient.api['/admin/reports/generate'].$post(data)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
