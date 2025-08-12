import { useQuery } from "@tanstack/react-query";
import { honoClient, handleHonoResponse } from '@/lib/hono';

export interface Nurse {
  worker_id: number;
  user: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
  };
  employee_id: string;
  specialization?: string;
  employment_type: string;
  fatigue_score?: number;
}

export interface NursesResponse {
  success: boolean;
  data: Nurse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export function useNurses(params: Record<string, string | number> = {}) {
  const queryKey = ["nurses", params];
  return useQuery<NursesResponse, Error>({
    queryKey,
    queryFn: async () => {
      // Use honoClient to fetch nurses
      const nursesRoute = honoClient.api['/nurses'];
      
      // Build query parameters
      const queryParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams[key] = String(value);
        }
      });
      
      // @ts-ignore - route typing doesn't include query prop in helper
      return handleHonoResponse(
        nursesRoute.$get({
          query: queryParams,
          header: {},
          cookie: {},
          param: {},
        } as any)
      );
    },
    placeholderData: (previousData) => previousData,
  });
}


