import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Clock, TrendingUp, Plus, Bell } from 'lucide-react';

interface DashboardMetrics {
  timeOff: {
    pending: number;
    approved: number;
    thisMonth: number;
  };
  swaps: {
    available: number;
    pending: number;
    completed: number;
  };
  myRequests: {
    active: number;
    history: number;
  };
}

interface RecentActivity {
  id: number;
  type: 'time_off' | 'swap_request' | 'swap_accepted';
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

const RequestsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('time-off');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    timeOff: { pending: 3, approved: 12, thisMonth: 8 },
    swaps: { available: 15, pending: 2, completed: 7 },
    myRequests: { active: 4, history: 23 }
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: 1,
      type: 'time_off',
      title: 'Vacation Request Approved',
      description: 'Your vacation request for Mar 20-22 has been approved',
      timestamp: '2 hours ago',
      status: 'approved'
    },
    {
      id: 2,
      type: 'swap_request',
      title: 'New Swap Opportunity',
      description: 'Sarah Johnson wants to swap her night shift on Mar 25',
      timestamp: '4 hours ago',
      status: 'available'
    },
    {
      id: 3,
      type: 'swap_accepted',
      title: 'Swap Request Accepted',
      description: 'Your swap request with Mike Chen has been accepted',
      timestamp: '1 day ago',
      status: 'accepted'
    }
  ]);

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const variants: Record<string, string> = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      available: 'bg-blue-100 text-blue-800',
      accepted: 'bg-emerald-100 text-emerald-800'
    };

    return (
      <Badge className={`${variants[status]} font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const MetricCard: React.FC<{
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    trend?: string;
  }> = ({ title, value, description, icon, trend }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && <TrendingUp className="h-3 w-3" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests & Swaps</h1>
          <p className="text-muted-foreground">
            Manage your time off requests and shift swaps
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Time Off"
          value={metrics.timeOff.pending}
          description="Awaiting approval"
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <MetricCard
          title="Available Swaps"
          value={metrics.swaps.available}
          description="Open opportunities"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="My Active Requests"
          value={metrics.myRequests.active}
          description="Currently processing"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="This Month"
          value={metrics.timeOff.thisMonth}
          description="Days off taken"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="time-off">Time Off Requests</TabsTrigger>
          <TabsTrigger value="swaps">Shift Swaps</TabsTrigger>
        </TabsList>

        <TabsContent value="time-off" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Time Off Management</h2>
            <Button>
              <CalendarDays className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time Off Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="secondary">{metrics.timeOff.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <Badge variant="default">{metrics.timeOff.approved}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <Badge variant="outline">{metrics.timeOff.thisMonth}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Time Off Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>
                  Your latest time off requests and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity
                    .filter(activity => activity.type === 'time_off')
                    .map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={activity.status} />
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="swaps" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Shift Swap Marketplace</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Browse Swaps
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Swap Request
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Swap Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Swap Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {metrics.swaps.available}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">My Pending</span>
                  <Badge variant="secondary">{metrics.swaps.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="default">{metrics.swaps.completed}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Swap Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Swap Activity</CardTitle>
                <CardDescription>
                  Latest swap requests and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity
                    .filter(activity => activity.type.includes('swap'))
                    .map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={activity.status} />
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestsDashboard;