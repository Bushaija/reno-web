import { useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

// Types based on your API request/response
export interface StaffPredictionRequest {
  department_id: number;
  prediction_date: string;
  shift_type: 'day' | 'night' | 'evening';
  expected_patient_count: number;
  expected_acuity: 'low' | 'medium' | 'high';
}

export interface PredictionFactors {
  historical_average: number;
  acuity_adjustment: number;
  seasonal_factor: number;
  day_of_week_factor: number;
}

export interface RiskIndicator {
  message: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface StaffPredictionData {
  recommended_nurses: number;
  confidence_score: number;
  factors: PredictionFactors;
  risk_indicators: RiskIndicator[];
}

export interface StaffPredictionResponse {
  success: boolean;
  data: StaffPredictionData;
  timestamp?: string;
}

export interface StaffPredictionError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Hook for predicting staffing needs
 * 
 * @example
 * ```tsx
 * const { mutate: predictStaffing, data, isLoading, error } = useStaffPrediction();
 * 
 * // Make a prediction
 * predictStaffing({
 *   department_id: 1,
 *   prediction_date: '2024-03-20',
 *   shift_type: 'day',
 *   expected_patient_count: 18,
 *   expected_acuity: 'high'
 * });
 * ```
 */
export function useStaffPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: StaffPredictionRequest): Promise<StaffPredictionResponse> => {
      try {
        const response = await honoClient.api['/scheduling/predict-staffing'].$post({
          json: request,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to predict staffing:', error);
        throw new Error('Failed to predict staffing needs');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['staff-predictions', variables.department_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['staff-predictions', variables.prediction_date] 
      });
    },
  });
}

/**
 * Hook for predicting staffing with optimistic updates
 * 
 * @example
 * ```tsx
 * const { mutate: predictStaffing, data, isLoading, error } = useStaffPredictionOptimistic();
 * 
 * // Make a prediction with optimistic update
 * predictStaffing({
 *   request: {
 *     department_id: 1,
 *     prediction_date: '2024-03-20',
 *     shift_type: 'day',
 *     expected_patient_count: 18,
 *     expected_acuity: 'high'
 *   },
 *   optimisticData: {
 *     recommended_nurses: 5,
 *     confidence_score: 0.8,
 *     factors: { ... },
 *     risk_indicators: [...]
 *   }
 * });
 * ```
 */
export function useStaffPredictionOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      request: StaffPredictionRequest;
      optimisticData?: StaffPredictionData;
    }): Promise<StaffPredictionResponse> => {
      const { request, optimisticData } = params;

      // Set optimistic data immediately
      if (optimisticData) {
        queryClient.setQueryData(
          ['staff-prediction', request],
          { success: true, data: optimisticData }
        );
      }

      try {
        const response = await honoClient.api['/scheduling/predict-staffing'].$post({
          json: request,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        // Remove optimistic data on error
        if (optimisticData) {
          queryClient.removeQueries({ 
            queryKey: ['staff-prediction', request] 
          });
        }
        console.error('Failed to predict staffing:', error);
        throw new Error('Failed to predict staffing needs');
      }
    },
    onSuccess: (data, variables) => {
      // Update the cache with real data
      queryClient.setQueryData(
        ['staff-prediction', variables.request],
        { success: true, data: data.data }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['staff-predictions', variables.request.department_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['staff-predictions', variables.request.prediction_date] 
      });
    },
    onError: (error, variables) => {
      // Remove optimistic data on error
      queryClient.removeQueries({ 
        queryKey: ['staff-prediction', variables.request] 
      });
    },
  });
}

/**
 * Hook for batch staff predictions
 * 
 * @example
 * ```tsx
 * const { mutate: predictBatchStaffing, data, isLoading, error } = useBatchStaffPrediction();
 * 
 * // Make multiple predictions
 * predictBatchStaffing([
 *   { department_id: 1, prediction_date: '2024-03-20', shift_type: 'day', expected_patient_count: 18, expected_acuity: 'high' },
 *   { department_id: 2, prediction_date: '2024-03-20', shift_type: 'night', expected_patient_count: 12, expected_acuity: 'medium' }
 * ]);
 * ```
 */
export function useBatchStaffPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requests: StaffPredictionRequest[]): Promise<StaffPredictionResponse[]> => {
      try {
        const predictions = await Promise.all(
          requests.map(async (request) => {
            const response = await honoClient.api['/scheduling/predict-staffing'].$post({
              json: request,
              header: {},
              cookie: {},
            });

            return handleHonoResponse(response);
          })
        );

        return predictions;
      } catch (error) {
        console.error('Failed to predict batch staffing:', error);
        throw new Error('Failed to predict batch staffing needs');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate all related queries
      variables.forEach(request => {
        queryClient.invalidateQueries({ 
          queryKey: ['staff-predictions', request.department_id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['staff-predictions', request.prediction_date] 
        });
      });
    },
  });
}

/**
 * Hook for getting cached staff prediction
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCachedStaffPrediction(request);
 * ```
 */
export function useCachedStaffPrediction(request: StaffPredictionRequest) {
  const queryClient = useQueryClient();
  
  return queryClient.getQueryData(['staff-prediction', request]) as StaffPredictionResponse | undefined;
}

/**
 * Hook for clearing staff prediction cache
 * 
 * @example
 * ```tsx
 * const { clearCache } = useStaffPredictionCache();
 * 
 * // Clear all predictions
 * clearCache();
 * 
 * // Clear specific department predictions
 * clearCache({ department_id: 1 });
 * ```
 */
export function useStaffPredictionCache() {
  const queryClient = useQueryClient();

  return {
    clearCache: (filter?: Partial<StaffPredictionRequest>) => {
      if (filter) {
        // Clear specific predictions
        Object.entries(filter).forEach(([key, value]) => {
          queryClient.removeQueries({ 
            queryKey: ['staff-predictions', key, value] 
          });
        });
      } else {
        // Clear all predictions
        queryClient.removeQueries({ 
          queryKey: ['staff-predictions'] 
        });
        queryClient.removeQueries({ 
          queryKey: ['staff-prediction'] 
        });
      }
    },
    clearDepartmentCache: (departmentId: number) => {
      queryClient.removeQueries({ 
        queryKey: ['staff-predictions', 'department_id', departmentId] 
      });
    },
    clearDateCache: (date: string) => {
      queryClient.removeQueries({ 
        queryKey: ['staff-predictions', 'prediction_date', date] 
      });
    },
  };
}

// Export types for external use
export type {
  StaffPredictionRequest,
  StaffPredictionResponse,
  StaffPredictionData,
  PredictionFactors,
  RiskIndicator,
  StaffPredictionError,
};

