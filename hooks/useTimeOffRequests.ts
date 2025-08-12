// hooks/useTimeOffRequests.ts
import { useState, useEffect, useCallback } from 'react';
import { TimeOffRequest, SwapRequest, SwapOpportunity } from '@/types/requests';

interface UseTimeOffRequestsReturn {
  requests: TimeOffRequest[];
  loading: boolean;
  error: string | null;
  createRequest: (data: Omit<TimeOffRequest, 'request_id' | 'nurse' | 'status' | 'submitted_at'>) => Promise<void>;
  updateRequest: (id: number, updates: Partial<TimeOffRequest>) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useTimeOffRequests = (filters?: {
  status?: string[];
  nurse_id?: number;
  start_date?: string;
  end_date?: string;
}): UseTimeOffRequestsReturn => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.status?.length) {
        queryParams.append('status', filters.status.join(','));
      }
      if (filters?.nurse_id) {
        queryParams.append('nurse_id', filters.nurse_id.toString());
      }
      if (filters?.start_date) {
        queryParams.append('start_date', filters.start_date);
      }
      if (filters?.end_date) {
        queryParams.append('end_date', filters.end_date);
      }

      const response = await fetch(`/api/v1/time-off-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createRequest = useCallback(async (requestData: Omit<TimeOffRequest, 'request_id' | 'nurse' | 'status' | 'submitted_at'>) => {
    try {
      const response = await fetch('/api/v1/time-off-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Optimistic update
      setRequests(prev => [data.data, ...prev]);
      
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
      throw err;
    }
  }, []);

  const updateRequest = useCallback(async (id: number, updates: Partial<TimeOffRequest>) => {
    try {
      const response = await fetch(`/api/v1/time-off-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update local state
      setRequests(prev => 
        prev.map(req => req.request_id === id ? { ...req, ...updates } : req)
      );
      
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequest,
    refetch: fetchRequests
  };
};

import { SwapRequest, SwapOpportunity } from '@/types/requests';

interface UseSwapRequestsReturn {
  swapRequests: SwapRequest[];
  opportunities: SwapOpportunity[];
  loading: boolean;
  error: string | null;
  createSwapRequest: (data: any) => Promise<void>;
  acceptSwap: (swapId: number) => Promise<void>;
  fetchOpportunities: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useSwapRequests = (filters?: {
  status?: string[];
  department_id?: number;
  shift_type?: string;
}): UseSwapRequestsReturn => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [opportunities, setOpportunities] = useState<SwapOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSwapRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.status?.length) {
        queryParams.append('status', filters.status.join(','));
      }
      if (filters?.department_id) {
        queryParams.append('department_id', filters.department_id.toString());
      }
      if (filters?.shift_type) {
        queryParams.append('shift_type', filters.shift_type);
      }

      const response = await fetch(`/api/v1/swap-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSwapRequests(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/swap-requests/opportunities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOpportunities(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
    }
  }, []);

  const createSwapRequest = useCallback(async (requestData: any) => {
    try {
      const response = await fetch('/api/v1/swap-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Optimistic update
      setSwapRequests(prev => [data.data, ...prev]);
      
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create swap request');
      throw err;
    }
  }, []);

  const acceptSwap = useCallback(async (swapId: number) => {
    try {
      const response = await fetch(`/api/v1/swap-requests/${swapId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from opportunities and update swap requests
      setOpportunities(prev => prev.filter(opp => opp.swap_request.swap_id !== swapId));
      setSwapRequests(prev => 
        prev.map(req => 
          req.swap_id === swapId 
            ? { ...req, status: 'approved' as const }
            : req
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept swap');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSwapRequests();
    fetchOpportunities();
  }, [fetchSwapRequests, fetchOpportunities]);

  return {
    swapRequests,
    opportunities,
    loading,
    error,
    createSwapRequest,
    acceptSwap,
    fetchOpportunities,
    refetch: fetchSwapRequests
  };
};

// hooks/useRequestNotifications.ts
interface RequestNotification {
  notification_id: number;
  category: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_required: boolean;
  action_url?: string;
  sent_at: string;
  is_read: boolean;
}

interface UseRequestNotificationsReturn {
  notifications: RequestNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useRequestNotifications = (): UseRequestNotificationsReturn => {
  const [notifications, setNotifications] = useState<RequestNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/notifications?category=requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};