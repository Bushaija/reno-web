/* eslint-disable */
// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Optional: Import your API client if available
import { honoClient, handleHonoResponse } from '@/lib/hono';
import { authClient } from '@/lib/auth-client';

// Export the availability hook
export { useGetNurseAvailability } from './useGetNurseAvailability';

/**
 * Hook to create a new nurse.
 * Falls back to a simple fetch if a typed Hono route is not available yet.
 */
export function useCreateNurse() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  return useMutation({
    mutationFn: async (rawData: any) => {
      // The schema form already transforms the data to have nested user and preferences objects
      // Just ensure the data structure is correct
      const nursePayload = {
        user: {
          name: rawData.user?.name || rawData.name || "",
          email: rawData.user?.email || rawData.email || "",
          phone: rawData.user?.phone || rawData.phone || "",
          emergency_contact_name: rawData.user?.emergency_contact_name || rawData.emergency_contact_name || "",
          emergency_contact_phone: rawData.user?.emergency_contact_phone || rawData.emergency_contact_phone || ""
        },
        employee_id: rawData.employee_id || "",
        specialization: rawData.specialization || "",
        license_number: rawData.license_number || "",
        employment_type: rawData.employment_type || "full_time",
        base_hourly_rate: rawData.base_hourly_rate ? Number(rawData.base_hourly_rate) : undefined,
        max_hours_per_week: rawData.max_hours_per_week ? Number(rawData.max_hours_per_week) : 40,
        preferences: {
          prefers_day_shifts: Boolean(rawData.preferences?.prefers_day_shifts || rawData.prefers_day_shifts),
          prefers_night_shifts: Boolean(rawData.preferences?.prefers_night_shifts || rawData.prefers_night_shifts),
          weekend_availability: Boolean(rawData.preferences?.weekend_availability || rawData.weekend_availability)
        }
      };

      console.log("nurse payload", nursePayload)

      // Create nurse using the correct API structure
      const nurseRoute: any = honoClient.api['/nurses'];
      // @ts-ignore - route typing doesn't include json prop in helper
      return handleHonoResponse(
        nurseRoute.$post({
          json: nursePayload,
          query: {},
          header: {},
          cookie: {},
          param: {},
        } as any)
      );
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
