import { DashboardStats } from "@/components/dashboard/DashboardStats"

const page = () => {
  return (
    <div className="flex flex-col gap-4">
      <DashboardStats />
      {/* <ChartBarInteractive /> */}
    </div>
  )
}

export default page