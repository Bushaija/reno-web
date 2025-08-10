import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface SummaryItem {
  label: string
  value: string
  statusLabel: string
  status: "ok" | "warning" | "error"
}

const currentWeekSummary: SummaryItem[] = [
  {
    label: "Hours",
    value: "42.5",
    statusLabel: "Within Limits",
    status: "ok",
  },
  {
    label: "Overtime",
    value: "5.5",
    statusLabel: "Monitor",
    status: "warning",
  },
  {
    label: "Breaks",
    value: "All Taken",
    statusLabel: "",
    status: "ok",
  },
]

interface Violation {
  id: number
  date: string
  description: string
  status: string
}

const recentViolations: Violation[] = [
  {
    id: 1,
    date: "2024-03-12",
    description: "Overtime exceeded (2.5 hrs)",
    status: "Approved by supervisor",
  },
  {
    id: 2,
    date: "2024-03-10",
    description: "Break delayed by 45 mins",
    status: "Emergency coverage issue",
  },
]

export default function Compliance() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Compliance Status</h2>

      {/* Current Week Summary */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Current Week Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {currentWeekSummary.map((item) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                {item.status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                {item.statusLabel && (
                  <p className="text-xs text-muted-foreground">{item.statusLabel}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Violations */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Recent Violations</h3>
        <Card>
          <CardContent className="divide-y p-0">
            {recentViolations.map((v) => (
              <div key={v.id} className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>{new Date(v.date).toLocaleDateString()}</span> : {v.description}
                </div>
                <p className="text-xs text-muted-foreground">Status: {v.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Fatigue Assessment */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Fatigue Assessment</h3>
        <Card>
          <CardContent className="space-y-2 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Score:</span>
              <span className="font-semibold">35/100</span>
              <Badge variant="default">Low Risk</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Last Assessment: 2 days ago</p>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="default" size="sm">
                Update Fatigue
              </Button>
              <Button variant="outline" size="sm">
                View History
              </Button>
              <Button variant="outline" size="sm">
                Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}