import { useState, useEffect } from 'react';
import { SwapOpportunity, RequestFilters } from '../types/requests';
import { mockSwapRequests } from './useSwapRequests'; // Assuming mock data can be shared

const mockOpportunities: SwapOpportunity[] = [
  {
    swap_request: mockSwapRequests[2], // Open swap request
    compatibility_score: 0.85,
    match_reasons: ['Shift type match', 'Department preference'],
  },
  {
    swap_request: {
        ...mockSwapRequests[0],
        swap_type: 'open_swap',
        reason: 'Willing to take any day shift this week.'
    },
    compatibility_score: 0.78,
    match_reasons: ['High demand for shift'],
    potential_conflicts: ['Overlapping with another pending request'],
  },
];

const useSwapOpportunities = (filters: RequestFilters) => {
  const [opportunities, setOpportunities] = useState<SwapOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setOpportunities(mockOpportunities);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  return { opportunities, isLoading, error };
};

export default useSwapOpportunities;
