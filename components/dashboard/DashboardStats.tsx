"use client"

import { Percent, Building, Users, Clock, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatCardSkeleton } from "@/components/skeletons"
import { useDashboardStats } from "@/features/dashboard/api"

export interface DashboardStatsProps {
  executedCount?: number
  facilityId?: number
}

export function DashboardStats({ executedCount: executedProp, facilityId: facilityIdProp }: DashboardStatsProps) {
  const { data: dashboardStats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Error Loading Stats"
          value="--"
          icon={<AlertCircle className="h-4 w-4 text-destructive" />}
          description="Failed to load dashboard statistics"
        />
      </div>
    )
  }

  console.log("dashboardStats", dashboardStats)

  const stats = dashboardStats;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        title="Total Staff"
        value={`${stats?.healthcareWorkerCount ?? 0}`}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Active healthcare workers"
      />

      <StatCard
        title="Active Shifts"
        value={`${stats?.shiftCount ?? 0}`}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        description="Currently in progress"
      />

      <StatCard
        title="Pending Requests"
        value={`${stats?.pendingChangeRequestsCount ?? 0}`}
        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        description="Awaiting approval"
      />

      {/* <StatCard
        title="Attendance Rate"
        value={stats?.attendanceRate ? `${stats.attendanceRate.toFixed(1)}%` : "No Data"}
        icon={<Percent className="h-4 w-4 text-muted-foreground" />}
        description="Present vs total records"
      /> */}
    </div>
  )
} 