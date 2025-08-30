import { useQuery } from "@tanstack/react-query";

export interface NotificationsQueryParams {
  unread_only?: boolean;
  category?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}

export interface Notification {
  notificationId: number;
  userId: number;
  category: string;
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string | null;
  expiresAt?: string | null;
  sentAt: string;
  readAt?: string | null;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  timestamp: string;
}

async function fetchNotifications(params: NotificationsQueryParams): Promise<NotificationsResponse> {
  const qs = new URLSearchParams();
  if (params.unread_only) qs.append("unread_only", "true");
  if (params.category) qs.append("category", params.category);
  if (params.priority) qs.append("priority", params.priority);
  if (params.limit) qs.append("limit", params.limit.toString());
  if (params.offset) qs.append("offset", params.offset.toString());

  const res = await fetch(`/notifications${qs.size ? `?${qs.toString()}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return (await res.json()) as NotificationsResponse;
}

export function useNotifications(params: NotificationsQueryParams) {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
    staleTime: 1000 * 60, // 1 minute cache
  });
}
