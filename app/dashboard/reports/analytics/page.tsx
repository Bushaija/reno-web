// @ts-nocheck
"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertCircle } from "lucide-react"
import { useDashboardMetrics } from "@/features/reports/api/useDashboardMetrics"
import { useGenerateReport } from "@/features/reports/api"
import { StatCardSkeleton } from "@/components/skeletons"
import { toast } from "sonner"

interface MetricCardProps {
  title: string
  metrics: { label: string; value: React.ReactNode }[]
}
function MetricCard({ title, metrics }: MetricCardProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{m.label}</span>
            <span className="font-medium text-foreground">{m.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function Analytics() {
  const departmentId = 1 // ICU for demo – could come from route/query
  const { data, isLoading, error } = useDashboardMetrics("today", departmentId)
  const { mutate: generateReport, isPending } = useGenerateReport()

  const staffingMetrics = data
    ? [
        { label: "Fill Rate", value: `${data.staffing_metrics.fill_rate}%` },
        { label: "Overtime", value: `${data.staffing_metrics.overtime_percentage}%` },
        { label: "Callouts", value: data.staffing_metrics.callouts },
        { label: "Open Shifts", value: data.staffing_metrics.open_shifts },
      ]
    : []

  const financialMetrics = data
    ? [
        { label: "Labor Cost", value: `$${data.financial_metrics.labor_cost.toLocaleString()}` },
        { label: "Overtime Cost", value: `$${data.financial_metrics.overtime_cost.toLocaleString()}` },
      ]
    : []

  const complianceMetrics = data
    ? [
        { label: "Violations", value: `${data.compliance_metrics.violations}` },
        { label: "Fatigue Alerts", value: `${data.compliance_metrics.fatigue_alerts}` },
        { label: "Break Compliance", value: `${data.compliance_metrics.break_compliance}%` },
      ]
    : []

  const satisfactionMetrics = data
    ? Object.entries(data.satisfaction_metrics).map(([k, v]) => ({ label: k, value: `${v}/5` }))
    : []

  const predictiveInsights: string[] = data?.predictive_insights ?? []

  const handleExport = () => {
    generateReport(
      {
        report_type: "dashboard_metrics",
        parameters: {
          period: "today",
          department_ids: [departmentId],
          format: "pdf",
        },
      },
      {
        onSuccess: () => toast.success("Report generation requested"),
      }
    )
  }

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
        <AlertCircle className="size-5" /> Error loading analytics
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">ICU Analytics – Today</h2>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isPending}>
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricCard title="Staffing Metrics" metrics={staffingMetrics} />
        <MetricCard title="Financial Impact" metrics={financialMetrics} />
        <MetricCard title="Compliance Trends" metrics={complianceMetrics} />
        <MetricCard title="Satisfaction Scores" metrics={satisfactionMetrics} />
      </div>

      {/* Predictive Insights */}
      {predictiveInsights.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            Predictive Insights <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </h3>
          <Card>
            <CardContent className="py-4 space-y-2">
              {predictiveInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}