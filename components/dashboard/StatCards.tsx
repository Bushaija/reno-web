import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data
export const staffingStatusData = [
  {
    shiftType: "Current",
    totalShifts: 28,
    totalStaff: 24
  },
  {
    shiftType: "Night",
    totalShifts: 12,
    totalStaff: 12
  },
  {
    shiftType: "Day",
    totalShifts: 2,
    totalStaff: 4
  },
  
];

export const complianceAlertsData = [
  {
    id: 1,
    type: "License Expiry",
    staffName: "Dr. Alice Kamana",
    dueDate: "2025-09-15",
    status: "urgent"
  },
  {
    id: 2,
    type: "Training Overdue",
    staffName: "Nurse Jean Uwase",
    dueDate: "2025-08-20",
    status: "high"
  },
  {
    id: 3,
    type: "Certification Renewal",
    staffName: "Dr. Eric Niyonsenga",
    dueDate: "2025-10-05",
    status: "medium"
  }
];

export const criticalItemsData = [
  {
    id: "1",
    count: 2,
    reason: "nurses out sick - ICU understaffed",
  },
  // {
  //   id: "2",
  //   count: 3,
  //   reason: "Overtime approvals pending",
  // },
  // {
  //   id: "med-002",
  //   name: "Blood Units - O+",
  //   currentStock: 2,
  //   minRequired: 8,
  //   status: "critical"
  // },
  // {
  //   id: "med-003",
  //   name: "Ventilators",
  //   currentStock: 4,
  //   minRequired: 5,
  //   status: "warning"
  // }
];

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
}

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
} 

export function StaffingStatusCard() {
  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getCoverageBadgeVariant = (percentage: number) => {
    if (percentage >= 0.9) return "default"
    if (percentage >= 0.75) return "secondary"
    return "destructive"
  }

  return (
    <Card className="max-w-[300px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Staffing Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {staffingStatusData.map((dept) => (
          <div key={dept.shiftType} className="border rounded-sm p-2 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">{dept.shiftType}</h3>
              <Badge variant={getCoverageBadgeVariant(dept.totalShifts / dept.totalStaff)}>
                {dept.totalShifts} / {dept.totalStaff}
              </Badge>
            </div>
            
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ComplianceAlertsCard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "urgent":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Compliance Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {complianceAlertsData.map((alert) => (
          <div key={alert.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{alert.type}</h4>
                <p className="text-sm text-muted-foreground">{alert.staffName}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(alert.status)}>
                {alert.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Due Date:</span>
              <span className={`font-medium ${getStatusColor(alert.status)}`}>
                {formatDate(alert.dueDate)}
              </span>
            </div>
          </div>
        ))}
        <div className="text-center pt-2">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Alerts
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CriticalItemsCard() {
  const getStockStatus = (current: number, required: number) => {
    const percentage = (current / required) * 100
    if (percentage < 50) return "critical"
    if (percentage < 80) return "warning"
    return "normal"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      default:
        return "text-green-600"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStockPercentage = (current: number, required: number) => {
    return Math.round((current / required) * 100)
  }

  return (
    <Card className="max-w-[500px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Critical Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalItemsData.map((item) => (
          <ul key={item.id} className="rounded-lg p-3 space-y-2">
            <li className="font-medium text-sm"> <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {item.count} {item.reason}
            </div></li>
          </ul>
        ))}
      </CardContent>
    </Card>
  )
}

