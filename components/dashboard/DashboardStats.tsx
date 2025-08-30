"use client"

import { Percent, Building, Users, Clock, AlertCircle } from "lucide-react"
import { StatCard, StaffingStatusCard, ComplianceAlertsCard, CriticalItemsCard } from "@/components/dashboard/StatCards"
import { StatCardSkeleton } from "@/components/skeletons"
import { useDashboardStats } from "@/features/dashboard/api"
import { authClient } from "@/lib/auth-client"


export interface DashboardStatsProps {
  executedCount?: number
  facilityId?: number
}

export function DashboardStats({ executedCount: executedProp, facilityId: facilityIdProp }: DashboardStatsProps) {
  const { data: dashboardStats, isLoading, error } = useDashboardStats()

  const { data: user } = authClient.useSession()

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Basic stats grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        {/* Advanced cards grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Error Loading Stats"
            value="--"
            icon={<AlertCircle className="h-4 w-4 text-destructive" />}
            description="Failed to load dashboard statistics"
          />
        </div>
      </div>
    )
  }

  console.log("dashboardStats", dashboardStats)

  const stats = dashboardStats;

  return (
    <div className="space-y-6">
      {/* Basic Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Overtime Risks"
          value={3}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Active healthcare workers"
        />

        <StatCard
          title="Critical Alert"
          value={1}
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
      </div>

      {/* Advanced Dashboard Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <StaffingStatusCard />
        {/* <ComplianceAlertsCard /> */}
        <CriticalItemsCard />
      </div>
    </div>
  )
} 