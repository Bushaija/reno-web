import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

export interface RealTimeShiftStatus {
  department_id: number;
  department_name: string;
  total_shifts: number;
  active_shifts: number;
  completed_shifts: number;
  understaffed_shifts: number;
  fill_rate: number;
}

export interface ActiveAlert {
  alert_id: number;
  type: 'understaffed' | 'overtime' | 'compliance' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  department_id: number;
  department_name: string;
  created_at: string;
  requires_action: boolean;
}

export interface UnderstaffedShift {
  shift_id: number;
  department_id: number;
  department_name: string;
  start_time: string;
  end_time: string;
  required_staff: number;
  current_staff: number;
  missing_staff: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface CriticalViolation {
  violation_id: number;
  type: 'overtime_exceeded' | 'insufficient_rest' | 'missing_break' | 'late_arrival';
  severity: 'low' | 'medium' | 'high' | 'critical';
  nurse_id: number;
  nurse_name: string;
  department_id: number;
  department_name: string;
  description: string;
  detected_at: string;
  requires_immediate_action: boolean;
}

export interface RealTimeMonitoringData {
  currentShiftStatus: RealTimeShiftStatus[];
  activeAlerts: ActiveAlert[];
  understaffedShifts: UnderstaffedShift[];
  criticalViolations: CriticalViolation[];
  lastUpdated: string;
  isConnected: boolean;
}

export const useRealTimeMonitoring = () => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Real-time shift status across all departments
  // Using /shifts endpoint with understaffed_only filter
  const { data: currentShiftStatus, isLoading: shiftStatusLoading } = useQuery({
    queryKey: ['real-time', 'shift-status'],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/shifts'].$get({
          query: {
            understaffed_only: false,
            status: 'in_progress',
            limit: 100
          },
          header: {},
          cookie: {},
        });
        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch shift status:', error);
        throw new Error('Failed to fetch shift status');
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  // Active alerts and notifications
  // Using /notifications endpoint with urgent priority
  const { data: activeAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['real-time', 'active-alerts'],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/notifications'].$get({
          query: {
            priority: 'urgent',
            unread_only: true,
            limit: 50
          },
          header: {},
          cookie: {},
        });
        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch active alerts:', error);
        throw new Error('Failed to fetch active alerts');
      }
    },
    refetchInterval: 15000, // Refresh alerts more frequently
    staleTime: 10000,
  });

  // Understaffed shifts
  // Using /shifts endpoint with understaffed_only filter
  const { data: understaffedShifts, isLoading: understaffedLoading } = useQuery({
    queryKey: ['real-time', 'understaffed-shifts'],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/shifts'].$get({
          query: {
            understaffed_only: true,
            status: 'understaffed',
            limit: 50
          },
          header: {},
          cookie: {},
        });
        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch understaffed shifts:', error);
        throw new Error('Failed to fetch understaffed shifts');
      }
    },
    refetchInterval: 30000,
    staleTime: 25000,
  });

  // Critical compliance violations
  // Using /compliance/violations endpoint with critical severity
  const { data: criticalViolations, isLoading: violationsLoading } = useQuery({
    queryKey: ['real-time', 'critical-violations'],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/compliance']['violations'].$get({
          query: {
            severity: 'critical',
            resolved: false,
            limit: 50
          },
          header: {},
          cookie: {},
        });
        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch critical violations:', error);
        throw new Error('Failed to fetch critical violations');
      }
    },
    refetchInterval: 20000, // Refresh violations every 20 seconds
    staleTime: 15000,
  });

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setIsConnected(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['real-time', 'shift-status'] }),
        queryClient.invalidateQueries({ queryKey: ['real-time', 'active-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['real-time', 'understaffed-shifts'] }),
        queryClient.invalidateQueries({ queryKey: ['real-time', 'critical-violations'] }),
      ]);
    } catch (error) {
      console.error('Real-time monitoring refresh failed:', error);
      setIsConnected(false);
    }
  }, [queryClient]);

  // Subscribe to real-time updates (simulated with polling for now)
  const subscribe = useCallback(() => {
    if (intervalRef.current) return; // Already subscribed
    
    intervalRef.current = setInterval(() => {
      refresh();
    }, 30000);
    
    setIsConnected(true);
  }, [refresh]);

  // Unsubscribe from real-time updates
  const unsubscribe = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Auto-subscribe on mount
  useEffect(() => {
    subscribe();
    
    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const isLoading = shiftStatusLoading || alertsLoading || understaffedLoading || violationsLoading;

  // Transform the data to match our expected interfaces
  const transformShiftStatus = (shifts: any[]): RealTimeShiftStatus[] => {
    if (!shifts) return [];
    
    // Group shifts by department and calculate metrics
    const deptMap = new Map();
    
    shifts.forEach(shift => {
      const deptId = shift.department?.deptId || shift.department_id;
      const deptName = shift.department?.deptName || shift.department_name;
      
      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, {
          department_id: deptId,
          department_name: deptName,
          total_shifts: 0,
          active_shifts: 0,
          completed_shifts: 0,
          understaffed_shifts: 0,
          fill_rate: 0
        });
      }
      
      const dept = deptMap.get(deptId);
      dept.total_shifts++;
      
      if (shift.status === 'in_progress') {
        dept.active_shifts++;
      } else if (shift.status === 'completed') {
        dept.completed_shifts++;
      }
      
      if (shift.status === 'understaffed') {
        dept.understaffed_shifts++;
      }
    });
    
    // Calculate fill rate
    deptMap.forEach(dept => {
      dept.fill_rate = dept.total_shifts > 0 
        ? Math.round(((dept.total_shifts - dept.understaffed_shifts) / dept.total_shifts) * 100)
        : 100;
    });
    
    return Array.from(deptMap.values());
  };

  const transformAlerts = (notifications: any[]): ActiveAlert[] => {
    if (!notifications) return [];
    
    return notifications.map(notification => ({
      alert_id: notification.notification_id,
      type: notification.category === 'shift_update' ? 'understaffed' : 'general',
      severity: notification.priority === 'urgent' ? 'critical' : 'medium',
      title: notification.title,
      message: notification.message,
      department_id: 0, // Not available in notifications
      department_name: 'General',
      created_at: notification.sent_at,
      requires_action: notification.action_required
    }));
  };

  const transformViolations = (violations: any[]): CriticalViolation[] => {
    if (!violations) return [];
    
    return violations.map(violation => ({
      violation_id: violation.violation_id,
      type: violation.violation_type,
      severity: violation.severity,
      nurse_id: violation.nurse?.worker_id || 0,
      nurse_name: violation.nurse?.user?.name || 'Unknown',
      department_id: 0, // Not available in violations
      department_name: 'General',
      description: violation.description,
      detected_at: violation.detected_at,
      requires_immediate_action: violation.requires_action
    }));
  };

  return {
    // Real-time data (transformed)
    currentShiftStatus: transformShiftStatus(currentShiftStatus?.data || []),
    activeAlerts: transformAlerts(activeAlerts?.data || []),
    understaffedShifts: understaffedShifts?.data || [],
    criticalViolations: transformViolations(criticalViolations?.data || []),
    
    // Connection status
    isConnected,
    isLoading,
    
    // Control methods
    subscribe,
    unsubscribe,
    refresh,
    
    // Last updated timestamp
    lastUpdated: new Date().toISOString(),
  };
};
