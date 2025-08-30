"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetFatigueTrends, type FatigueTrendsData } from "../api"
import { format } from "date-fns"
import { CalendarIcon, TrendingUp, AlertTriangle, Users } from "lucide-react"

interface FatigueTrendsDashboardProps {
  defaultStartDate?: string
  defaultEndDate?: string
}

export function FatigueTrendsDashboard({ 
  defaultStartDate = "2025-07-01", 
  defaultEndDate = "2025-08-12" 
}: FatigueTrendsDashboardProps) {
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  const { 
    data: trendsData, 
    isLoading, 
    error,
    refetch 
  } = useGetFatigueTrends(startDate, endDate)

  const handleDateChange = () => {
    refetch()
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading fatigue trends...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading fatigue trends: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trendsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No fatigue trends data available.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Fatigue Trends Analytics
          </CardTitle>
          <CardDescription>
            Analyze fatigue patterns and correlations across your nursing staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleDateChange}>Update Analysis</Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Fatigue Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trendsData.averageFatigueScore.toFixed(1)}</div>
            <p className="text-xs text-gray-500">Lower is better</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trendsData.riskDistribution.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-gray-500">In date range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {trendsData.trends.reduce((sum, trend) => sum + trend.highRiskCount, 0)}
            </div>
            <p className="text-xs text-gray-500">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Risk Level Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of fatigue risk levels across your staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendsData.riskDistribution.map((item) => (
              <div key={item.riskLevel} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getRiskLevelColor(item.riskLevel)}>
                    {item.riskLevel.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium">{item.count} nurses</span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Correlations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fatigue Correlations
          </CardTitle>
          <CardDescription>
            How fatigue relates to other factors (0 = no correlation, 1 = strong correlation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(trendsData.correlations.withOvertime * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Overtime Correlation</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(trendsData.correlations.withConsecutiveShifts * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Consecutive Shifts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(trendsData.correlations.withPatientLoad * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Patient Load</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Fatigue Trends Over Time</CardTitle>
          <CardDescription>
            Average fatigue scores by period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendsData.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{formatDate(trend.period)}</div>
                  <div className="text-sm text-gray-600">
                    {trend.highRiskCount} high-risk assessments
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{trend.avgFatigueScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">avg score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Actionable insights to improve staff fatigue management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trendsData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-blue-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
