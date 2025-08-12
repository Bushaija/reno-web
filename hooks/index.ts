// Export all time-off request hooks and types
export {
  // Hooks
  useGetTimeOffRequests,
  useCreateTimeOffRequest,
  useUpdateTimeOffRequest,
  useGetTimeOffRequest,
  useGetNurseTimeOffRequests,
  useGetTimeOffRequestsByStatus,
  useGetTimeOffRequestsByDateRange,
  
  // Types
  type TimeOffRequest,
  type CreateTimeOffRequestRequest,
  type UpdateTimeOffRequestRequest,
  type TimeOffRequestsResponse,
  type TimeOffRequestResponse,
  type CreateTimeOffRequestResponse,
  type UpdateTimeOffRequestResponse,
  type TimeOffRequestFilters,
  
  // Query keys
  timeOffRequestsQueryKey,
} from './useTimeOffRequests';

// Export all swap request hooks and types
export {
  // Hooks
  useGetSwapRequests,
  useGetSwapOpportunities,
  useCreateSwapRequest,
  useUpdateSwapRequest,
  useAcceptSwapRequest,
  useGetSwapRequest,
  useGetNurseSwapRequests,
  useGetSwapRequestsByStatus,
  useGetSwapRequestsByDepartment,
  useGetNurseSwapOpportunities,
  
  // Types
  type Nurse,
  type Shift,
  type SwapRequest,
  type SwapOpportunity,
  type CreateSwapRequestRequest,
  type UpdateSwapRequestRequest,
  type SwapRequestsResponse,
  type SwapRequestResponse,
  type SwapOpportunitiesResponse,
  type CreateSwapRequestResponse,
  type UpdateSwapRequestResponse,
  type AcceptSwapRequestResponse,
  type SwapRequestFilters,
  type SwapOpportunityFilters,
  
  // Query keys
  swapRequestsQueryKey,
  swapOpportunitiesQueryKey,
} from './useSwapRequests';
