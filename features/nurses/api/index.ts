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
      const { user: _ignoredUserObj, preferences = {}, ...nurseFields } = rawData || {};

      const userId = session?.user?.id; // use authenticated admin user id
      if (!userId) throw new Error('Unable to determine current user_id');

      const toBool = (v: any, def: boolean) =>
        v === undefined || v === null || v === "" ? def : Boolean(v);

      const toNum = (v: any, def?: number) =>
        v === undefined || v === null || v === "" ? def : Number(v);

      const nursePayload = {
        user_id: Number(userId),
        employee_id: String(nurseFields.employee_id || ""),
        specialization: nurseFields.specialization || undefined,
        license_number: nurseFields.license_number || undefined,
        certification: nurseFields.certification || undefined,
        hire_date: nurseFields.hire_date || undefined,
        employment_type: nurseFields.employment_type ?? "full_time",
        base_hourly_rate: toNum(nurseFields.base_hourly_rate, undefined),
        overtime_rate: toNum(nurseFields.overtime_rate, undefined),
        max_hours_per_week: toNum(nurseFields.max_hours_per_week, 40),
        max_consecutive_days: toNum(nurseFields.max_consecutive_days, 6),
        min_hours_between_shifts: toNum(nurseFields.min_hours_between_shifts, 8),
        prefers_day_shifts: toBool(preferences.prefers_day_shifts, true),
        prefers_night_shifts: toBool(preferences.prefers_night_shifts, false),
        weekend_availability: toBool(preferences.weekend_availability, true),
        holiday_availability: toBool(preferences.holiday_availability, false),
        float_pool_member: toBool(preferences.float_pool_member, false),
      } as const;

      console.log("nurse payload", nursePayload)

      // 3. Create nurse
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
