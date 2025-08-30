'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  Trash2, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { NotificationDialog } from '@/components/features/notifications/notification-dialog';
import { 
  useNotifications, 
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useBulkNotificationAction,
  useSendNotification,
  useBroadcastNotification,
  type Notification,
  type NotificationFilters
} from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const [filters, setFilters] = useState<NotificationFilters>({
    unread_only: false,
    category: undefined,
    priority: undefined,
    limit: 50,
  });
  
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'high-priority'>('all');

  // Fetch notifications data
  const { 
    data: notificationsResponse, 
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications
  } = useNotifications(filters);

  // Fetch unread count
  const { 
    data: unreadCountResponse, 
    isLoading: isLoadingUnreadCount 
  } = useUnreadNotificationCount();

  // Notification actions
  const { mutate: markAsRead, isPending: isMarkingAsRead } = useMarkNotificationRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } = useMarkAllNotificationsRead();
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
  const { mutate: bulkAction, isPending: isPerformingBulkAction } = useBulkNotificationAction();
  const { mutate: sendNotification, isPending: isSending } = useSendNotification();
  const { mutate: broadcastNotification, isPending: isBroadcasting } = useBroadcastNotification();

  const notifications = notificationsResponse?.success ? notificationsResponse.data : [];
  const unreadCount = unreadCountResponse?.success ? unreadCountResponse.data.count : 0;

  const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSelectedNotifications([]); // Clear selection when filters change
  };

  const handleViewModeChange = (mode: 'all' | 'unread' | 'high-priority') => {
    setViewMode(mode);
    setSelectedNotifications([]);
    
    switch (mode) {
      case 'unread':
        handleFilterChange({ unread_only: true, priority: undefined });
        break;
      case 'high-priority':
        handleFilterChange({ unread_only: false, priority: 'high' });
        break;
      default:
        handleFilterChange({ unread_only: false, priority: undefined });
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setSelectedNotifications([]);
  };

  const handleDeleteNotification = (notificationId: number) => {
    deleteNotification(notificationId);
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const handleBulkAction = (action: 'mark_read' | 'mark_unread' | 'delete') => {
    if (selectedNotifications.length === 0) return;
    
    bulkAction({
      notification_ids: selectedNotifications,
      action
    });
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (notificationId: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map(n => n.notification_id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shift_update': return <Clock className="h-4 w-4" />;
      case 'system_maintenance': return <Info className="h-4 w-4" />;
      case 'staffing_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'compliance_warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important alerts, updates, and announcements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchNotifications()}
            disabled={isLoadingNotifications}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead || unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <NotificationDialog 
            onNotificationSent={async () => {
              try {
                await refetchNotifications();
              } catch (error) {
                console.error('Failed to refresh notifications:', error);
              }
            }} 
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingNotifications ? 'Loading...' : 'Notifications received'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              {isLoadingUnreadCount ? 'Loading...' : 'Requires attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => handleViewModeChange(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All Notifications</TabsTrigger>
              <TabsTrigger value="unread">Unread Only</TabsTrigger>
              <TabsTrigger value="high-priority">High Priority</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={filters.category || 'all'} 
                onValueChange={(value) => handleFilterChange({ category: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="shift_update">Shift Updates</SelectItem>
                  <SelectItem value="system_maintenance">System Maintenance</SelectItem>
                  <SelectItem value="staffing_alert">Staffing Alerts</SelectItem>
                  <SelectItem value="compliance_warning">Compliance Warnings</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={filters.priority || 'all'} 
                onValueChange={(value) => handleFilterChange({ priority: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Limit</label>
              <Select 
                value={filters.limit?.toString() || '50'} 
                onValueChange={(value) => handleFilterChange({ limit: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.length} selected
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('mark_read')}
                disabled={isPerformingBulkAction}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Read
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={isPerformingBulkAction}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isLoadingNotifications ? 'Loading...' : `${notifications.length} notifications found`}
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingNotifications ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No notifications found</h3>
              <p className="text-muted-foreground">
                {filters.unread_only ? 'All notifications have been read' : 'No notifications match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.notification_id}
                  className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                    notification.is_read ? 'bg-muted/30' : 'bg-background'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={selectedNotifications.includes(notification.notification_id)}
                    onCheckedChange={(checked) => 
                      handleSelectNotification(notification.notification_id, checked as boolean)
                    }
                  />

                  {/* Category Icon */}
                  <div className="text-muted-foreground mt-1">
                    {getCategoryIcon(notification.category)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {notification.action_required && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{formatDate(notification.sent_at)}</span>
                        {notification.expires_at && (
                          <span>Expires: {formatDate(notification.expires_at)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {notification.action_url && (
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={() => handleMarkAsRead(notification.notification_id)}
                            disabled={isMarkingAsRead}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteNotification(notification.notification_id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}