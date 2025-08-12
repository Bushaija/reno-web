"use client"

import React from "react"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatCardSkeleton } from "@/components/skeletons"
import { AlertCircle } from "lucide-react"
import { useDashboardMetrics } from "@/features/reports/api/useDashboardMetrics"

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

// Tab content fetching dashboard metrics via the Reports API
const MetricsTab = () => {
  const { data, isLoading, error } = useDashboardMetrics("today")

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-5" /> Error loading metrics
      </div>
    )
  }

  const staffingMetrics = data
    ? [
        { label: "Fill Rate", value: `${data.staffing_metrics?.fill_rate ?? "--"}%` },
        { label: "Understaffed", value: data.staffing_metrics?.understaffed_shifts ?? "--" },
        { label: "Overtime", value: `${data.staffing_metrics?.avg_overtime_hours ?? "--"}h` },
      ]
    : []

  const financialMetrics = data
    ? [
        {
          label: "Labor Cost",
          value: `$${data.financial_metrics?.total_labor_cost?.toLocaleString() ?? "--"}`,
        },
        {
          label: "Overtime Cost",
          value: `$${data.financial_metrics?.overtime_cost?.toLocaleString() ?? "--"}`,
        },
      ]
    : []

  const complianceMetrics = data
    ? [
        { label: "Violations", value: data.compliance_metrics?.total_violations ?? "--" },
        {
          label: "Compliance Rate",
          value: `${data.compliance_metrics?.compliance_rate ?? "--"}%`,
        },
      ]
    : []

  const satisfactionMetrics = data
    ? [
        { label: "Shift Rating", value: data.satisfaction_metrics?.avg_shift_rating ?? "--" },
        { label: "Workload Rating", value: data.satisfaction_metrics?.avg_workload_rating ?? "--" },
      ]
    : []

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <MetricCard title="Staffing Metrics" metrics={staffingMetrics} />
      <MetricCard title="Financial Metrics" metrics={financialMetrics} />
      <MetricCard title="Compliance Metrics" metrics={complianceMetrics} />
      <MetricCard title="Satisfaction Metrics" metrics={satisfactionMetrics} />
    </div>
  )
}

const page = () => {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="reports">
        <MetricsTab />
      </TabsContent>
    </Tabs>
  )
}

export default page