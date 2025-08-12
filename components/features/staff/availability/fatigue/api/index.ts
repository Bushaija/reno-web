// Export all fatigue-related hooks and types
export {
  // Hooks
  useCreateFatigueAssessment,
  useGetNurseFatigueAssessments,
  useGetFatigueTrends,
  useGetLatestNurseFatigueAssessment,
  useGetNurseFatigueStats,
  
  // Types
  type FatigueAssessment,
  type CreateFatigueAssessmentRequest,
  type FatigueAssessmentResponse,
  type FatigueAssessmentsResponse,
  type FatigueTrendsData,
  type FatigueTrendsResponse,
  
  // Query keys
  fatigueQueryKey,
  nurseFatigueQueryKey,
  fatigueTrendsQueryKey,
} from './useFatigue';
