import { useMutation, useQueryClient } from '@tanstack/react-query';

// Optional: Import your API client if available
import { honoClient, handleHonoResponse } from '@/lib/hono';

/**
 * Hook to create a new nurse.
 * Falls back to a simple fetch if a typed Hono route is not available yet.
 */
export function useCreateNurse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      // Try using honoClient if the route is pre-generated
      try {
        // @ts-ignore – the route might not exist yet; runtime guard below
        const honoRoute = honoClient?.api?.['/nurses'];
        if (honoRoute) {
          return handleHonoResponse(
            honoRoute.$post({
              json: data,
              query: {},
              header: {},
              cookie: {},
              param: {},
            })
          );
        }
      } catch (_err) {
        // Ignore and fall back to fetch
      }

      // Fallback to a standard fetch request
      const res = await fetch('/api/nurses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to create nurse');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
    },
  });
}

/**
 * Hook to update nurse availability.
 * @param nurseId The ID of the nurse whose availability is being updated.
 */
export function useUpdateNurseAvailability(nurseId: string | number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (availability: any[]) => {
      if (!nurseId) throw new Error('nurseId is required');

      try {
        // Prefer honoClient route if available
        // @ts-ignore – hone route may not yet exist at compile time
        const honoRoute = honoClient?.api?.['/nurses/:id/availability'];
        if (honoRoute) {
          return handleHonoResponse(
            honoRoute.$put({
              param: { id: String(nurseId) },
              json: availability,
              query: {},
              header: {},
              cookie: {},
            })
          );
        }
      } catch (_err) {
        // ignore and fall back
      }

      // Fallback generic fetch
      const res = await fetch(`/api/nurses/${nurseId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availability),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to update availability');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurse', nurseId] });
    },
  });
}
