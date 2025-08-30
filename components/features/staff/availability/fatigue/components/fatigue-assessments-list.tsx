"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGetNurseFatigueAssessments, type FatigueAssessment } from "../api"
import { format } from "date-fns"

interface FatigueAssessmentsListProps {
  nurseId: number
}

export function FatigueAssessmentsList({ nurseId }: FatigueAssessmentsListProps) {
  const { 
    data: assessments, 
    isLoading, 
    error 
  } = useGetNurseFatigueAssessments(nurseId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading fatigue assessments...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading fatigue assessments: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!assessments || assessments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No fatigue assessments found for this nurse.
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Fatigue Assessment History</CardTitle>
          <CardDescription>
            Recent fatigue assessments and risk levels
          </CardDescription>
        </CardHeader>
      </Card>

      {assessments.map((assessment: FatigueAssessment) => (
        <Card key={assessment.assessment_id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Assessment #{assessment.assessment_id}
                </CardTitle>
                <CardDescription>
                  {formatDate(assessment.assessment_date)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRiskLevelColor(assessment.risk_level)}>
                  {assessment.risk_level.toUpperCase()} RISK
                </Badge>
                <Badge variant="outline">
                  Score: {assessment.fatigue_risk_score}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Sleep Hours:</span>
                <span className="ml-2">{assessment.sleep_hours_reported}h</span>
              </div>
              <div>
                <span className="font-medium">Stress Level:</span>
                <span className="ml-2">{assessment.stress_level_reported}/10</span>
              </div>
              <div>
                <span className="font-medium">Caffeine Level:</span>
                <span className="ml-2">{assessment.caffeine_intake_level}</span>
              </div>
              <div>
                <span className="font-medium">Consecutive Shifts:</span>
                <span className="ml-2">{assessment.consecutive_shifts}</span>
              </div>
            </div>

            {assessment.hours_worked_last_24h && (
              <div className="text-sm">
                <span className="font-medium">Hours Worked (24h):</span>
                <span className="ml-2">{assessment.hours_worked_last_24h}h</span>
              </div>
            )}

            {assessment.hours_worked_last_7days && (
              <div className="text-sm">
                <span className="font-medium">Hours Worked (7 days):</span>
                <span className="ml-2">{assessment.hours_worked_last_7days}h</span>
              </div>
            )}

            {assessment.hours_since_last_break && (
              <div className="text-sm">
                <span className="font-medium">Hours Since Last Break:</span>
                <span className="ml-2">{assessment.hours_since_last_break}h</span>
              </div>
            )}

            {assessment.recommendations && (
              <div className="pt-2 border-t">
                <div className="text-sm">
                  <span className="font-medium">Recommendations:</span>
                  <p className="mt-1 text-gray-600">{assessment.recommendations}</p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t">
              Created: {formatDate(assessment.created_at)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
