import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

// Reusable row component
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function StaffPredictor() {
  const currentInputs = [
    { label: "Expected Patient Count", value: "18 ±2" },
    { label: "Acuity Level", value: "●●●○○ High" },
    { label: "Special Events", value: "Spring Break season" },
    { label: "Weather Impact", value: "Severe storm warning" },
  ]

  const breakdown = [
    { label: "Base Requirement", value: "4.2" },
    { label: "+ Acuity Adjustment", value: "+1.3" },
    { label: "+ Weather Factor", value: "+0.5" },
    { label: "= Total Recommendation", value: "6.0" },
  ]

  const riskFactors = [
    "15% chance of understaffing without additional coverage",
    "Historical Monday peaks at 2-4 PM",
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Staffing Predictor</h2>

      {/* Meta */}
      <div className="grid gap-4 md:grid-cols-2 max-w-md">
        <Row label="Date" value="March 25, 2024 (Monday)" />
        <Row label="Department" value="ICU" />
      </div>

      {/* Current Inputs */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Current Inputs</h3>
        <Card>
          <CardContent className="space-y-2 py-4">
            {currentInputs.map((item) => (
              <Row key={item.label} label={item.label} value={item.value} />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Prediction Results */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Prediction Results</h3>
        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              Recommended Staff: 6 nurses
            </div>
            <div className="flex items-center gap-2 text-sm">
              Confidence: 87% <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="border-t pt-4 space-y-1">
              {breakdown.map((b) => (
                <Row key={b.label} label={b.label} value={b.value} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Risk Factors */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Risk Factors</h3>
        <div className="space-y-2">
          {riskFactors.map((risk, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span>{risk}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button variant="default" size="sm">
          Apply to Schedule
        </Button>
        <Button variant="outline" size="sm">
          Save Forecast
        </Button>
      </div>
    </div>
  )
}