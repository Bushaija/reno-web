import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff, Building2, TrendingUp, AlertTriangle } from 'lucide-react';

// Import our custom hooks
import { useDepartmentFilter } from '@/hooks/api/departments/use-department-filter';
import { useDashboardMetrics } from '@/features/reports/api/useDashboardMetrics';
import { useRealTimeMonitoring } from '@/hooks/api/monitoring/use-real-time-monitoring';

/**
 * Demo component showcasing how all three custom hooks work together
 * This follows the pattern from the user's example:
 * 
 * const AdminDashboard = () => {
 *   const { adminUser, permissions } = useAdminAuth();
 *   const { selectedDepartments } = useDepartmentFilter();
 *   const { 
 *     staffingMetrics, 
 *     complianceMetrics, 
 *     refresh 
 *   } = useDashboardMetrics('today', selectedDepartments);
 *   const { activeAlerts, understaffedShifts } = useRealTimeMonitoring();
 * 
 *   useEffect(() => {
 *     const interval = setInterval(refresh, 30000); // Refresh every 30s
 *     return () => clearInterval(interval);
 *   }, []);
 * };
 */
export const HooksDemo = () => {
  // 1. Department Filter Hook
  const { 
    selectedDepartments, 
    availableDepartments, 
    setDepartmentFilter, 
    clearFilters, 
    hasActiveFilters,
    getFilterSummary 
  } = useDepartmentFilter();

  // 2. Dashboard Metrics Hook (with department filtering)
  const { 
    staffingMetrics, 
    complianceMetrics, 
    workloadMetrics,
    financialMetrics, 
    satisfactionMetrics,
    refresh: refreshMetrics,
    lastUpdated,
    isLoading: metricsLoading,
    isStale 
  } = useDashboardMetrics({
    period: 'today',
    departmentIds: selectedDepartments,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // 3. Real-time Monitoring Hook
  const { 
    activeAlerts, 
    understaffedShifts, 
    currentShiftStatus,
    criticalViolations,
    isConnected,
    refresh: refreshRealTime,
    subscribe,
    unsubscribe 
  } = useRealTimeMonitoring();

  // Auto-refresh every 30 seconds (as per user's example)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
      refreshRealTime();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshMetrics, refreshRealTime]);

  // Auto-subscribe to real-time updates
  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return (
    <div className="space-y-6">
      {/* Header with Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dashboard Hooks Demo
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {isConnected ? 'Real-time Connected' : 'Disconnected'}
                </span>
              </div>
              <Button onClick={refreshMetrics} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Department Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Department Filter
            <div className="flex gap-2">
              <Button 
                onClick={() => setDepartmentFilter(availableDepartments.map(d => d.department_id))}
                size="sm"
                variant="outline"
              >
                Select All
              </Button>
              <Button 
                onClick={clearFilters}
                size="sm"
                variant="outline"
                disabled={!hasActiveFilters}
              >
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">
              Current Filter: {getFilterSummary()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableDepartments.map((dept) => (
              <Badge
                key={dept.department_id}
                variant={selectedDepartments.includes(dept.department_id) ? "default" : "secondary"}
                className="cursor-pointer hover:opacity-80"
                onClick={() => {
                  if (selectedDepartments.includes(dept.department_id)) {
                    setDepartmentFilter(selectedDepartments.filter(id => id !== dept.department_id));
                  } else {
                    setDepartmentFilter([...selectedDepartments, dept.department_id]);
                  }
                }}
              >
                {dept.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Staffing Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Staffing Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staffingMetrics ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fill Rate</span>
                  <span className="font-medium">{staffingMetrics.fill_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Understaffed</span>
                  <span className="font-medium">{staffingMetrics.understaffed_shifts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Overtime</span>
                  <span className="font-medium">{staffingMetrics.avg_overtime_hours}h</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Compliance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {complianceMetrics ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Violations</span>
                  <span className="font-medium">{complianceMetrics.total_violations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Compliance Rate</span>
                  <span className="font-medium">{complianceMetrics.compliance_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Critical</span>
                  <span className="font-medium">{complianceMetrics.critical_violations}</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Real-time Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Departments</span>
              <span className="font-medium">{currentShiftStatus.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Alerts</span>
              <span className="font-medium">{activeAlerts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Understaffed</span>
              <span className="font-medium">{understaffedShifts.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Data Display */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts ({activeAlerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div key={alert.alert_id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs text-muted-foreground">{alert.department_name}</div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer with Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}</span>
          {isStale && <Badge variant="secondary">Stale</Badge>}
        </div>
        <div className="mt-2">
          <span className="text-xs">
            Auto-refreshing every 30 seconds • {selectedDepartments.length} departments selected
          </span>
        </div>
      </div>
    </div>
  );
};

