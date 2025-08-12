import { useQuery } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import { format, startOfWeek, addDays, Day } from 'date-fns';

interface NurseAvailabilityResponse {
  success: boolean;
  data: Array<{
    availability_id?: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_preferred: boolean;
    is_available: boolean;
    effective_from?: string;
    effective_until?: string;
  }>;
  timestamp: string;
}

export function useGetNurseAvailability(nurseId: string | number | undefined, week: Date) {
  return useQuery({
    queryKey: ['nurse-availability', nurseId, format(week, 'yyyy-MM-dd')],
    queryFn: async (): Promise<NurseAvailabilityResponse> => {
      if (!nurseId) {
        throw new Error('Nurse ID is required');
      }

      try {
        // Use Hono client route if available
        const honoRoute = honoClient?.api?.['/nurses/:id/availability'];
        if (honoRoute) {
          return handleHonoResponse(
            honoRoute.$get({
              param: { id: String(nurseId) },
              query: {},
              header: {},
              cookie: {},
            })
          );
        }
      } catch (_err) {
        // Fall back to generic fetch if Hono route fails
      }

      // Fallback to generic fetch
      const res = await fetch(`/api/nurses/${nurseId}/availability`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to fetch nurse availability');
      }

      return res.json();
    },
    enabled: !!nurseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Helper function to get week dates for a given date
export function getWeekDates(date: Date, weekStartsOn: Day = 1) {
  const startOfWeekDate = startOfWeek(date, { weekStartsOn });
  return Array.from({ length: 7 }).map((_, i) => addDays(startOfWeekDate, i));
}
