import { useState, useEffect } from 'react';
import { SwapRequest, RequestFilters } from '../types/requests';

export const mockSwapRequests: SwapRequest[] = [
  {
    swap_id: 1,
    requesting_nurse: {
      worker_id: 101,
      user: { user_id: 1, name: 'Alice Johnson' },
      employee_id: 'NURSE-001',
      specialization: 'ICU',
    },
    original_shift: {
      shift_id: 201,
      department: { department_id: 1, name: 'Intensive Care Unit' },
      start_time: '2023-10-15T07:00:00Z',
      end_time: '2023-10-15T19:00:00Z',
      shift_type: 'day',
    },
    swap_type: 'full_shift',
    reason: 'Family event',
    status: 'pending',
    expires_at: '2023-10-10T23:59:59Z',
    created_at: '2023-10-01T10:00:00Z',
  },
  {
    swap_id: 2,
    requesting_nurse: {
      worker_id: 102,
      user: { user_id: 2, name: 'Bob Williams' },
      employee_id: 'NURSE-002',
      specialization: 'ER',
    },
    target_nurse: {
        worker_id: 103,
        user: { user_id: 3, name: 'Charlie Brown' },
        employee_id: 'NURSE-003',
        specialization: 'ER',
    },
    original_shift: {
      shift_id: 202,
      department: { department_id: 2, name: 'Emergency Room' },
      start_time: '2023-10-18T19:00:00Z',
      end_time: '2023-10-19T07:00:00Z',
      shift_type: 'night',
    },
    requested_shift: {
        shift_id: 205,
        department: { department_id: 2, name: 'Emergency Room' },
        start_time: '2023-10-25T19:00:00Z',
        end_time: '2023-10-26T07:00:00Z',
        shift_type: 'night',
    },
    swap_type: 'partial_shift',
    reason: 'Appointment',
    status: 'approved',
    expires_at: '2023-10-15T23:59:59Z',
    created_at: '2023-10-05T14:30:00Z',
    accepted_at: '2023-10-06T11:00:00Z',
  },
  {
    swap_id: 3,
    requesting_nurse: {
        worker_id: 104,
        user: { user_id: 4, name: 'Diana Prince' },
        employee_id: 'NURSE-004',
        specialization: 'Pediatrics',
    },
    original_shift: {
      shift_id: 301,
      department: { department_id: 3, name: 'Pediatrics' },
      start_time: '2023-11-01T08:00:00Z',
      end_time: '2023-11-01T16:00:00Z',
      shift_type: 'day',
    },
    swap_type: 'open_swap',
    reason: 'Looking for a night shift instead.',
    status: 'pending',
    expires_at: '2023-10-25T23:59:59Z',
    created_at: '2023-10-10T09:00:00Z',
  },
];

const useSwapRequests = (filters: RequestFilters) => {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // In a real app, you would fetch data from an API and apply filters
    // For now, we'll just simulate a network delay
    const timer = setTimeout(() => {
      setRequests(mockSwapRequests);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  return { requests, isLoading, error };
};

export default useSwapRequests;
