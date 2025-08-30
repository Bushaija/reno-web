import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';
// Removed client-side database imports to avoid bundling server-only code

// Types based on your API request/response
export interface Notification {
  notification_id: number;
  category: 'shift_update' | 'system_maintenance' | 'staffing_alert' | 'compliance_warning' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_required: boolean;
  action_url?: string;
  sent_at: string;
  read_at: string | null;
  is_read: boolean;
  expires_at: string;
}

export interface NotificationFilters {
  unread_only?: boolean;
  category?: string;
  priority?: string;
  limit?: number;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  timestamp?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
  timestamp?: string;
}

export interface SendNotificationRequest {
  recipients?: number[];
  recipient_groups?: string[];
  category: string;
  title: string;
  message: string;
  priority: string;
  action_required: boolean;
  expires_in_hours?: number;
}

export interface BroadcastNotificationRequest {
  target_audience: string;
  department_ids?: number[];
  title: string;
  message: string;
  priority: string;
  emergency?: boolean;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  priority?: string;
  action_required?: boolean;
  expires_at?: string;
}

export interface BulkNotificationRequest {
  notification_ids: number[];
  action: 'mark_read' | 'mark_unread' | 'delete';
}

/**
 * Hook for fetching user notifications
 * 
 * @example
 * ```tsx
 * // Get all notifications
 * const { data, isLoading, error } = useNotifications();
 * 
 * // Get only unread notifications
 * const { data, isLoading, error } = useNotifications({ unread_only: true });
 * 
 * // Get high priority notifications
 * const { data, isLoading, error } = useNotifications({ priority: 'high' });
 * ```
 */
export function useNotifications(filters: NotificationFilters = {}) {
  const {
    unread_only = false,
    category,
    priority,
    limit = 50,
  } = filters;

  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async (): Promise<NotificationsResponse> => {
      try {
        const response = await honoClient.api['/notifications'].$get({
          query: {
            unread_only,
            category,
            priority,
            limit,
          },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        throw new Error('Failed to fetch notifications');
      }
    },
    refetchInterval: 30000, // 30 seconds for real-time updates
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook for getting unread notification count
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useUnreadNotificationCount();
 * ```
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<UnreadCountResponse> => {
      try {
        const response = await honoClient.api['/notifications/unread-count'].$get({
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        throw new Error('Failed to fetch unread count');
      }
    },
    refetchInterval: 15000, // 15 seconds for real-time updates
    staleTime: 5000, // 5 seconds
  });
}

/**
 * Hook for sending notifications
 * 
 * @example
 * ```tsx
 * const { mutate: sendNotification, isLoading, error } = useSendNotification();
 * 
 * sendNotification({
 *   recipients: [123, 456],
 *   category: 'system_maintenance',
 *   title: 'Scheduled Maintenance',
 *   message: 'System will be down for maintenance',
 *   priority: 'medium',
 *   action_required: false
 * });
 * ```
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SendNotificationRequest): Promise<{ success: boolean }> => {
      try {
        // Transform the request to match the expected API format
        console.log('Request:', request.recipients);
        const transformedRequest = {
          // If API needs userId, pass the first recipient as userId; otherwise,
          // adjust the server to derive userId from recipients.
          userId: Number(request.recipients?.[0] - 1),
          // userId: nurse?.user_id,
          category: request.category,
          title: request.title,
          message: request.message,
          priority: request.priority,
          actionRequired: request.action_required,
          actionUrl: request.action_url,
          ...(request.expires_in_hours ? {
            expiresAt: new Date(Date.now() + request.expires_in_hours * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          } : {})
        };

        console.group('Sending Notification - Request');
        console.log('Original Payload:', JSON.stringify(request, null, 2));
        console.log('Transformed Payload:', JSON.stringify(transformedRequest, null, 2));
        
        const response = await honoClient.api['/notifications'].$post({
          json: transformedRequest,
          header: {},
          cookie: {},
        });

        const result = await handleHonoResponse(response);
        console.log('Response:', result);
        console.groupEnd();
        return result;
      } catch (error) {
        console.error('Failed to send notification:', error);
        if (error.response) {
          console.error('Error response:', await error.response.json());
        }
        console.groupEnd();
        throw new Error('Failed to send notification');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook for broadcasting notifications
 * 
 * @example
 * ```tsx
 * const { mutate: broadcastNotification, isLoading, error } = useBroadcastNotification();
 * 
 * broadcastNotification({
 *   target_audience: 'department_staff',
 *   department_ids: [1, 2],
 *   title: 'Emergency Alert',
 *   message: 'Additional staff needed',
 *   priority: 'urgent',
 *   emergency: true
 * });
 * ```
 */
export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BroadcastNotificationRequest): Promise<{ success: boolean }> => {
      try {
        // Transform the request to match the expected API format
        const transformedRequest = {
          targetAudience: request.target_audience,
          departmentIds: request.department_ids,
          title: request.title,
          message: request.message,
          priority: request.priority,
          emergency: request.emergency,
          actionRequired: request.action_required,
          actionUrl: request.action_url
        };

        console.group('Broadcasting Notification - Request');
        console.log('Original Payload:', JSON.stringify(request, null, 2));
        console.log('Transformed Payload:', JSON.stringify(transformedRequest, null, 2));
        
        const response = await honoClient.api['/notifications/broadcast'].$post({
          json: transformedRequest,
          header: {},
          cookie: {},
        });

        const result = await handleHonoResponse(response);
        console.log('Response:', result);
        console.groupEnd();
        return result;
      } catch (error) {
        console.error('Failed to broadcast notification:', error);
        if (error.response) {
          console.error('Error response:', await error.response.json());
        }
        console.groupEnd();
        throw new Error('Failed to broadcast notification');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook for marking a notification as read
 * 
 * @example
 * ```tsx
 * const { mutate: markAsRead, isLoading, error } = useMarkNotificationRead();
 * 
 * markAsRead(123); // notification_id
 * ```
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number): Promise<{ success: boolean }> => {
      try {
        const response = await honoClient.api['/notifications/{id}/read'].$post({
          param: { id: notificationId.toString() },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw new Error('Failed to mark notification as read');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook for marking all notifications as read
 * 
 * @example
 * ```tsx
 * const { mutate: markAllAsRead, isLoading, error } = useMarkAllNotificationsRead();
 * 
 * markAllAsRead();
 * ```
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ success: boolean }> => {
      try {
        const response = await honoClient.api['/notifications/read-all'].$post({
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw new Error('Failed to mark all notifications as read');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook for updating a notification
 * 
 * @example
 * ```tsx
 * const { mutate: updateNotification, isLoading, error } = useUpdateNotification();
 * 
 * updateNotification({
 *   id: 123,
 *   data: { priority: 'high', action_required: true }
 * });
 * ```
 */
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; data: UpdateNotificationRequest }): Promise<{ success: boolean }> => {
      try {
        const response = await honoClient.api['/notifications/{id}'].$patch({
          param: { id: params.id.toString() },
          json: params.data,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to update notification:', error);
        throw new Error('Failed to update notification');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook for deleting a notification
 * 
 * @example
 * ```tsx
 * const { mutate: deleteNotification, isLoading, error } = useDeleteNotification();
 * 
 * deleteNotification(123); // notification_id
 * ```
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number): Promise<{ success: boolean }> => {
      try {
        const response = await honoClient.api['/notifications/{id}'].$delete({
          param: { id: notificationId.toString() },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to delete notification:', error);
        throw new Error('Failed to delete notification');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook for bulk notification operations
 * 
 * @example
 * ```tsx
 * const { mutate: bulkAction, isLoading, error } = useBulkNotificationAction();
 * 
 * bulkAction({
 *   notification_ids: [123, 456, 789],
 *   action: 'mark_read'
 * });
 * ```
 */
export function useBulkNotificationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BulkNotificationRequest): Promise<{ success: boolean }> => {
      try {
        const response = await honoClient.api['/notifications/bulk'].$post({
          json: request,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to perform bulk action:', error);
        throw new Error('Failed to perform bulk action');
      }
    },
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

/**
 * Hook for getting a single notification by ID
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useNotification(123);
 * ```
 */
export function useNotification(notificationId: number) {
  return useQuery({
    queryKey: ['notifications', notificationId],
    queryFn: async (): Promise<{ success: boolean; data: Notification }> => {
      try {
        const response = await honoClient.api['/notifications/{id}'].$get({
          param: { id: notificationId.toString() },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch notification:', error);
        throw new Error('Failed to fetch notification');
      }
    },
    enabled: !!notificationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting notifications by category
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useNotificationsByCategory('shift_update');
 * ```
 */
export function useNotificationsByCategory(category: string) {
  return useNotifications({ category, limit: 100 });
}

/**
 * Hook for getting high priority notifications
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useHighPriorityNotifications();
 * ```
 */
export function useHighPriorityNotifications() {
  return useNotifications({ priority: 'high', limit: 100 });
}

/**
 * Hook for getting urgent notifications
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useUrgentNotifications();
 * ```
 */
export function useUrgentNotifications() {
  return useNotifications({ priority: 'urgent', limit: 100 });
}

// Export types for external use
export type {
  Notification,
  NotificationFilters,
  NotificationsResponse,
  UnreadCountResponse,
  SendNotificationRequest,
  BroadcastNotificationRequest,
  UpdateNotificationRequest,
  BulkNotificationRequest,
};

