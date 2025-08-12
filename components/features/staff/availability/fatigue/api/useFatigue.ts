import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';

// Types for fatigue assessment
export interface FatigueAssessment {
  assessment_id: number;
  assessment_date: string;
  hours_worked_last_24h: number | null;
  hours_worked_last_7days: number | null;
  consecutive_shifts: number;
  hours_since_last_break: number | null;
  sleep_hours_reported: string;
  caffeine_intake_level: number;
  stress_level_reported: number;
  fatigue_risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string;
  created_at: string;
}

// Types for creating fatigue assessment
export interface CreateFatigueAssessmentRequest {
  sleep_hours_reported: number;
  stress_level_reported: number;
  caffeine_intake_level: number;
  notes: string;
}

// Types for fatigue assessment response
export interface FatigueAssessmentResponse {
  success: boolean;
  message: string;
  data: FatigueAssessment;
  timestamp: string;
}

// Types for getting fatigue assessments
export interface FatigueAssessmentsResponse {
  success: boolean;
  data: FatigueAssessment[];
  timestamp: string;
}

// Types for fatigue trends analytics
export interface FatigueTrendsData {
  averageFatigueScore: number;
  riskDistribution: Array<{
    riskLevel: 'low' | 'medium' | 'high';
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    period: string;
    avgFatigueScore: number;
    highRiskCount: number;
  }>;
  correlations: {
    withOvertime: number;
    withConsecutiveShifts: number;
    withPatientLoad: number;
  };
  recommendations: string[];
}

export interface FatigueTrendsResponse {
  success: boolean;
  data: FatigueTrendsData;
  timestamp: string;
}

// Query keys
export const fatigueQueryKey = ['fatigue'] as const;
export const nurseFatigueQueryKey = ['nurse-fatigue'] as const;
export const fatigueTrendsQueryKey = ['fatigue-trends'] as const;

/**
 * Hook for creating a fatigue assessment for a nurse
 * POST /api/nurses/{id}/fatigue
 */
export function useCreateFatigueAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      nurseId, 
      assessmentData 
    }: { 
      nurseId: number; 
      assessmentData: CreateFatigueAssessmentRequest 
    }): Promise<FatigueAssessmentResponse> => {
      try {
        const response = await handleHonoResponse<FatigueAssessmentResponse>(
          honoClient.api['/nurses/:id/fatigue'].$post({
            json: assessmentData,
            param: { id: nurseId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error creating fatigue assessment:', error);
        throw new Error('Failed to create fatigue assessment');
      }
    },
    onSuccess: (_, { nurseId }) => {
      // Invalidate nurse fatigue queries
      queryClient.invalidateQueries({ queryKey: [...nurseFatigueQueryKey, nurseId] });
      
      // Also invalidate general fatigue queries
      queryClient.invalidateQueries({ queryKey: fatigueQueryKey });
      queryClient.invalidateQueries({ queryKey: fatigueTrendsQueryKey });
    },
    onError: (error) => {
      console.error('Fatigue assessment creation failed:', error);
    },
  });
}

/**
 * Hook for fetching fatigue assessments for a specific nurse
 * GET /api/nurses/{id}/fatigue
 */
export function useGetNurseFatigueAssessments(nurseId: number) {
  return useQuery({
    queryKey: [...nurseFatigueQueryKey, nurseId],
    queryFn: async (): Promise<FatigueAssessment[]> => {
      try {
        // Don't make API call for invalid nurse IDs
        if (!nurseId || nurseId <= 0) {
          return [];
        }

        const response = await handleHonoResponse<FatigueAssessmentsResponse>(
          honoClient.api['/nurses/:id/fatigue'].$get({
            param: { id: nurseId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error fetching nurse fatigue assessments:', error);
        throw new Error('Failed to fetch nurse fatigue assessments');
      }
    },
    enabled: !!nurseId && nurseId > 0, // Only enabled when we have a valid nurse ID
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching fatigue trends analytics
 * GET /api/reports/analytics/fatigue-trends
 */
export function useGetFatigueTrends(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...fatigueTrendsQueryKey, startDate, endDate],
    queryFn: async (): Promise<FatigueTrendsData> => {
      try {
        const response = await handleHonoResponse<FatigueTrendsResponse>(
          honoClient.api['/reports/analytics/fatigue-trends'].$get({
            query: { startDate, endDate },
            header: {},
            cookie: {},
            param: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error fetching fatigue trends:', error);
        throw new Error('Failed to fetch fatigue trends');
      }
    },
    enabled: !!startDate && !!endDate, // Only enabled when we have both dates
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

/**
 * Hook for getting the latest fatigue assessment for a nurse
 * This is a convenience hook that gets the most recent assessment
 */
export function useGetLatestNurseFatigueAssessment(nurseId: number) {
  const { data: assessments, ...rest } = useGetNurseFatigueAssessments(nurseId);
  
  const latestAssessment = assessments && assessments.length > 0 
    ? assessments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  return {
    ...rest,
    data: latestAssessment,
    assessments, // Also provide access to all assessments if needed
  };
}

/**
 * Hook for getting fatigue statistics for a nurse
 * This provides calculated statistics from the nurse's fatigue assessments
 */
export function useGetNurseFatigueStats(nurseId: number) {
  const { data: assessments, ...rest } = useGetNurseFatigueAssessments(nurseId);
  
  const stats = assessments && assessments.length > 0 ? {
    totalAssessments: assessments.length,
    averageFatigueScore: assessments.reduce((sum, a) => sum + a.fatigue_risk_score, 0) / assessments.length,
    riskLevelDistribution: assessments.reduce((acc, a) => {
      acc[a.risk_level] = (acc[a.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentTrend: assessments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(a => ({ date: a.assessment_date, score: a.fatigue_risk_score })),
  } : null;

  return {
    ...rest,
    data: stats,
    assessments, // Also provide access to all assessments if needed
  };
}
