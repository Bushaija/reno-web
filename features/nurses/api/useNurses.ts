import { useQuery } from "@tanstack/react-query";

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
      const qs = new URLSearchParams(params as any).toString();
      const res = await fetch(`/nurses${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch nurses");
      return res.json();
    },
    keepPreviousData: true,
  });
}


