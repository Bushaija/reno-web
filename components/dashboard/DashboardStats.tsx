"use client"

import { Percent, Building } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatCardSkeleton } from "@/components/skeletons"

// import { getHealthCentersByHospital } from "@/features/on-boarding/utils/location-utils"
// import { useListExecutedFacilities } from "@/features/api/frontend"
// import { useGetFacilityById } from "@/features/facilities/api/use-get-facility"
import { authClient } from "@/lib/auth-client"


export interface DashboardStatsProps {
  executedCount?: number
  facilityId?: number
}

export function DashboardStats({ executedCount: executedProp, facilityId: facilityIdProp }: DashboardStatsProps) {
  const { data: session } = authClient.useSession()

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        title="Total Staff"
        value={`${10}`}
        icon={<Building className="h-4 w-4 text-muted-foreground" />}
      />

      <StatCard
        title="Active Shifts"
        value={`${6}`}
        icon={<Building className="h-4 w-4 text-muted-foreground" />}
      />

      <StatCard
        title="Pending Requests"
        value={`${2}`}
        icon={<Building className="h-4 w-4 text-muted-foreground" />}
      />

      <StatCard
        title="Attendance Rate"
        value={`${90.00.toFixed(2)}%`}
        icon={<Percent className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  )
} 