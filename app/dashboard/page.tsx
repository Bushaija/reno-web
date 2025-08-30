"use client"

import React from "react"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatCardSkeleton } from "@/components/skeletons"
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useDepartmentFilter } from "@/hooks/api/departments/use-department-filter"
import { useRealTimeMonitoring } from "@/hooks/api/monitoring/use-real-time-monitoring"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HooksDemo } from "@/components/dashboard/hooks-demo"
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

// Helper component for displaying simple metric lists
const MetricCard = ({
  title,
  metrics,
}: {
  title: string
  metrics: { label: string; value: React.ReactNode }[]
}) => (
  <Card className="w-full h-full">
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-1">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>{m.label}</span>
          <span className="font-medium text-foreground">{m.value}</span>
        </div>
      ))}
    </CardContent>
  </Card>
)

// Real-time monitoring tab
const RealTimeTab = () => {
  const { 
    currentShiftStatus, 
    activeAlerts, 
    understaffedShifts, 
    criticalViolations,
    isConnected,
    isLoading,
    refresh 
  } = useRealTimeMonitoring();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isConnected ? 'Real-time Connected' : 'Disconnected'}
          </span>
        </div>
        <Button onClick={refresh} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Department Status Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentShiftStatus.map((dept) => (
          <Card key={dept.department_id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{dept.department_name}</h3>
              <Badge variant={dept.fill_rate >= 80 ? "default" : "destructive"}>
                {dept.fill_rate}%
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Active: {dept.active_shifts}</div>
              <div>Completed: {dept.completed_shifts}</div>
              <div>Understaffed: {dept.understaffed_shifts}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="p-4">
          <CardTitle className="text-lg mb-4">Active Alerts</CardTitle>
          <div className="space-y-2">
            {activeAlerts.slice(0, 5).map((alert) => (
              <div key={alert.alert_id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <div>
                  <div className="font-medium text-sm">{alert.title}</div>
                  <div className="text-xs text-muted-foreground">{alert.message}</div>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Critical Violations */}
      {criticalViolations.length > 0 && (
        <Card className="p-4">
          <CardTitle className="text-lg mb-4">Critical Violations</CardTitle>
          <div className="space-y-2">
            {criticalViolations.slice(0, 5).map((violation) => (
              <div key={violation.violation_id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <div>
                  <div className="font-medium text-sm">{violation.nurse_name}</div>
                  <div className="text-xs text-muted-foreground">{violation.description}</div>
                </div>
                <Badge variant="destructive">{violation.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// Tab content fetching dashboard metrics via the Reports API
const MetricsTab = () => {
  const { selectedDepartments, availableDepartments, setDepartmentFilter, clearFilters, hasActiveFilters } = useDepartmentFilter();

  const {
    staffingMetrics,
    complianceMetrics,
    workloadMetrics,
    financialMetrics,
    satisfactionMetrics,
    lastUpdated,
    refresh,
    loading,
    error,
  } = useDashboardMetrics({
    period: "today",
    departmentIds: selectedDepartments,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-5" /> Error loading metrics
      </div>
    );
  }

  const staffingMetricsList = staffingMetrics
    ? [
        { label: "Fill Rate", value: `${staffingMetrics.fillRate ?? "--"}%` },
        { label: "Understaffed", value: staffingMetrics.understaffedShifts ?? "--" },
        { label: "Filled Shifts", value: staffingMetrics.filledShifts ?? "--" },
        { label: "Total Shifts", value: staffingMetrics.totalShifts ?? "--" },
      ]
    : [];

  const financialMetricsList = financialMetrics
    ? [
        {
          label: "Labor Cost",
          value: `$${financialMetrics.totalLaborCost?.toLocaleString() ?? "--"}`,
        },
        {
          label: "Overtime Cost",
          value: `$${financialMetrics.overtimeCost?.toLocaleString() ?? "--"}`,
        },
        {
          label: "Cost Per Shift",
          value: `$${financialMetrics.costPerShift?.toLocaleString() ?? "--"}`,
        },
      ]
    : [];

  const complianceMetricsList = complianceMetrics
    ? [
        { label: "Violations", value: complianceMetrics.totalViolations ?? "--" },
        {
          label: "Compliance Rate",
          value: `${complianceMetrics.complianceRate ?? "--"}%`,
        },
        { label: "Resolved", value: complianceMetrics.resolvedViolations ?? "--" },
        { label: "Pending", value: complianceMetrics.pendingViolations ?? "--" },
      ]
    : [];

  const satisfactionMetricsList = satisfactionMetrics
    ? [
        { label: "Shift Rating", value: satisfactionMetrics.avgShiftRating ?? "--" },
        { label: "Workload Rating", value: satisfactionMetrics.avgWorkloadRating ?? "--" },
        { label: "Response Rate", value: satisfactionMetrics.responseRate ?? "--" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Department Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Department Filter</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setDepartmentFilter(availableDepartments.map((d) => (d as any).department_id))}
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
        </div>

        <div className="flex flex-wrap gap-2">
          {availableDepartments.map((dept: { department_id: string | number; name: string }) => (
            <Badge
              key={(dept as any).department_id}
              variant={selectedDepartments.includes((dept as any).department_id) ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => {
                if (selectedDepartments.includes((dept as any).department_id)) {
                  setDepartmentFilter(selectedDepartments.filter((id: any) => id !== (dept as any).department_id));
                } else {
                  setDepartmentFilter([...selectedDepartments, (dept as any).department_id]);
                }
              }}
            >
              {(dept as any).name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricCard title="Staffing Metrics" metrics={staffingMetricsList} />
        {/* <MetricCard title="Financial Metrics" metrics={financialMetricsList} /> */}
        <MetricCard title="Compliance Metrics" metrics={complianceMetricsList} />
        <MetricCard title="Satisfaction Metrics" metrics={satisfactionMetricsList} />
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
        <Button onClick={refresh} size="sm" variant="ghost" className="ml-2">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        {/* <TabsTrigger value="real-time">Real-Time</TabsTrigger> */}
        <TabsTrigger value="reports">Reports</TabsTrigger>
        {/* <TabsTrigger value="demo">Hooks Demo</TabsTrigger> */}
      </TabsList>

      <TabsContent value="overview">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="real-time">
        <RealTimeTab />
      </TabsContent>

      <TabsContent value="reports">
        <MetricsTab />
      </TabsContent>

      <TabsContent value="demo">
        <HooksDemo />
      </TabsContent>
    </Tabs>
  )
}

export default DashboardPage