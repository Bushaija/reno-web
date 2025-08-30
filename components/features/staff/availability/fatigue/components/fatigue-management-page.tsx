"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FatigueAssessmentForm, 
  FatigueAssessmentsList, 
  FatigueTrendsDashboard 
} from "./"
import { useGetLatestNurseFatigueAssessment, useGetNurseFatigueStats } from "../api"
import { useNurses } from "@/features/nurses/api/useNurses"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  User 
} from "lucide-react"

interface FatigueManagementPageProps {
  defaultNurseId?: number
}

export function FatigueManagementPage({ defaultNurseId }: FatigueManagementPageProps) {
  const [selectedNurseId, setSelectedNurseId] = useState<number>(defaultNurseId || 0)
  
  // Fetch nurses for selection
  const { data: nursesData, isLoading: isLoadingNurses } = useNurses()
  
  // Fetch fatigue data for selected nurse
  const { data: latestAssessment } = useGetLatestNurseFatigueAssessment(selectedNurseId)
  const { data: fatigueStats } = useGetNurseFatigueStats(selectedNurseId)

  const handleNurseChange = (nurseId: string) => {
    // Don't update if it's a special value
    if (nurseId === 'loading' || nurseId === 'no-nurses') {
      return
    }
    setSelectedNurseId(Number(nurseId))
  }

  // Update selectedNurseId when defaultNurseId changes
  useEffect(() => {
    if (defaultNurseId && defaultNurseId > 0) {
      setSelectedNurseId(defaultNurseId)
    }
  }, [defaultNurseId])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fatigue Management</h1>
          <p className="text-gray-600">
            Monitor and manage nurse fatigue levels to ensure patient safety and staff well-being
          </p>
        </div>
      </div>

      {/* Nurse Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Nurse
          </CardTitle>
          <CardDescription>
            Choose a nurse to view their fatigue assessments and submit new ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedNurseId > 0 ? selectedNurseId.toString() : ""} 
            onValueChange={handleNurseChange}
            disabled={isLoadingNurses}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a nurse" />
            </SelectTrigger>
                          <SelectContent>
                {isLoadingNurses ? (
                  <SelectItem value="loading" disabled>Loading nurses...</SelectItem>
                ) : nursesData?.data && nursesData.data.length > 0 ? (
                  nursesData.data.map((nurse) => (
                    <SelectItem key={nurse.worker_id} value={nurse.worker_id.toString()}>
                      {nurse.user.name} ({nurse.employee_id})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-nurses" disabled>No nurses available</SelectItem>
                )}
              </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quick Stats for Selected Nurse */}
      {selectedNurseId > 0 && nursesData?.data && nursesData.data.some(nurse => nurse.worker_id === selectedNurseId) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Latest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestAssessment ? (
                <>
                  <div className="text-2xl font-bold">{latestAssessment.fatigue_risk_score}</div>
                  <Badge className={getRiskLevelColor(latestAssessment.risk_level)}>
                    {latestAssessment.risk_level.toUpperCase()}
                  </Badge>
                </>
              ) : (
                <div className="text-gray-500">No assessments</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Total Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fatigueStats?.totalAssessments || 0}
              </div>
              <p className="text-xs text-gray-500">Submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fatigueStats?.averageFatigueScore ? fatigueStats.averageFatigueScore.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-gray-500">Overall</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestAssessment ? (
                <Badge className={getRiskLevelColor(latestAssessment.risk_level)}>
                  {latestAssessment.risk_level.toUpperCase()}
                </Badge>
              ) : (
                <div className="text-gray-500">Unknown</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">New Assessment</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

                 <TabsContent value="assessment" className="space-y-4">
           {selectedNurseId > 0 && nursesData?.data && nursesData.data.some(nurse => nurse.worker_id === selectedNurseId) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FatigueAssessmentForm 
                nurseId={selectedNurseId}
                onSuccess={() => {
                  // The hooks will automatically refresh data
                  console.log("Assessment submitted successfully!")
                }}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Guidelines</CardTitle>
                  <CardDescription>
                    How to properly assess your fatigue level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <h4 className="font-medium mb-2">Sleep Hours:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>0-4 hours: High risk</li>
                      <li>5-6 hours: Medium risk</li>
                      <li>7-8 hours: Low risk</li>
                      <li>9+ hours: Optimal</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm">
                    <h4 className="font-medium mb-2">Stress Level (1-10):</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>1-3: Low stress</li>
                      <li>4-6: Moderate stress</li>
                      <li>7-10: High stress</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm">
                    <h4 className="font-medium mb-2">Caffeine Intake:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>0: None</li>
                      <li>1: Low (1-2 cups)</li>
                      <li>2: Moderate (3-4 cups)</li>
                      <li>3: High (5+ cups)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  Please select a nurse to submit a fatigue assessment.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

                 <TabsContent value="history" className="space-y-4">
           {selectedNurseId > 0 && nursesData?.data && nursesData.data.some(nurse => nurse.worker_id === selectedNurseId) ? (
            <FatigueAssessmentsList nurseId={selectedNurseId} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  Please select a nurse to view their fatigue assessment history.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FatigueTrendsDashboard 
            defaultStartDate="2025-07-01"
            defaultEndDate="2025-08-12"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
