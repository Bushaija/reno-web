'use client';

import React, { useState } from 'react';
import { OvertimeSummaryCard } from '@/components/features/attendance/overtime-summary-card';
import { OvertimeApprovalTable } from '@/components/features/attendance/overtime-approval-table';
import { OvertimeRecord, OvertimeSummary } from '@/types/overtime.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Hourglass, 
  ListChecks, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { useCurrentMonthOvertimeTrends, usePreviousMonthOvertimeTrends } from '@/hooks/use-overtime-trends';

// Mock Data for Overtime Records (until we have a real API endpoint)
const mockOvertimeRecords: OvertimeRecord[] = [
  {
    record_id: 'rec_001',
    nurse_id: 'N001',
    nurse_name: 'Alice Johnson',
    department_id: 'D01',
    department_name: 'Cardiology',
    shift_id: 'S01',
    shift_start: '2024-08-10T07:00:00Z',
    shift_end: '2024-08-10T19:00:00Z',
    overtime_hours: 2.5,
    reason: 'Patient surge',
    status: 'PENDING',
    submitted_at: '2024-08-10T19:05:00Z',
    cost: 125,
  },
  {
    record_id: 'rec_002',
    nurse_id: 'N002',
    nurse_name: 'Bob Williams',
    department_id: 'D02',
    department_name: 'Neurology',
    shift_id: 'S02',
    shift_start: '2024-08-10T19:00:00Z',
    shift_end: '2024-08-11T07:00:00Z',
    overtime_hours: 1.0,
    reason: 'Extended surgery',
    status: 'PENDING',
    submitted_at: '2024-08-11T07:10:00Z',
    cost: 55,
  },
  {
    record_id: 'rec_003',
    nurse_id: 'N003',
    nurse_name: 'Charlie Brown',
    department_id: 'D01',
    department_name: 'Cardiology',
    shift_id: 'S03',
    shift_start: '2024-08-09T19:00:00Z',
    shift_end: '2024-08-10T07:00:00Z',
    overtime_hours: 4.0,
    reason: 'Staff shortage',
    status: 'APPROVED',
    submitted_at: '2024-08-10T07:15:00Z',
    reviewed_by: 'Supervisor Jane',
    reviewed_at: '2024-08-10T09:00:00Z',
    cost: 200,
  },
];

export default function OvertimeManagementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Fetch overtime trends data
  const { 
    data: currentMonthData, 
    isLoading: isLoadingCurrentMonth 
  } = useCurrentMonthOvertimeTrends();
  
  const { 
    data: previousMonthData, 
    isLoading: isLoadingPreviousMonth 
  } = usePreviousMonthOvertimeTrends();

  // Calculate summary data from trends
  const trendsData = currentMonthData?.success ? currentMonthData.data : null;
  const previousTrendsData = previousMonthData?.success ? previousMonthData.data : null;

  // Calculate summary statistics
  const totalHours = trendsData?.trends.reduce((sum, trend) => sum + trend.totalHours, 0) || 0;
  const totalCost = trendsData?.trends.reduce((sum, trend) => sum + trend.totalCost, 0) || 0;
  const totalRequests = trendsData?.trends.reduce((sum, trend) => sum + trend.requestCount, 0) || 0;
  const averageHours = trendsData?.trends.length ? totalHours / trendsData.trends.length : 0;

  // Calculate month-over-month changes
  const previousTotalHours = previousTrendsData?.trends.reduce((sum, trend) => sum + trend.totalHours, 0) || 0;
  const hoursChange = previousTotalHours > 0 ? ((totalHours - previousTotalHours) / previousTotalHours) * 100 : 0;
  
  const previousTotalCost = previousTrendsData?.trends.reduce((sum, trend) => sum + trend.totalCost, 0) || 0;
  const costChange = previousTotalCost > 0 ? ((totalCost - previousTotalCost) / previousTotalCost) * 100 : 0;

  // Mock budget data (replace with real API when available)
  const budgetTotal = 25000000;
  const budgetUsedPercentage = (totalCost / budgetTotal) * 100;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Overtime Management</h1>
          <p className="text-muted-foreground">
            Track, approve, and analyze overtime trends across all departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="previous-month">Previous Month</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OvertimeSummaryCard
          title="Total Overtime Hours"
          value={`${totalHours.toFixed(1)}h`}
          description={`${averageHours.toFixed(1)}h average per period`}
          icon={Hourglass}
          trend={hoursChange}
          trendLabel="vs last month"
        />
        <OvertimeSummaryCard
          title="Total Requests"
          value={totalRequests.toString()}
          description="Overtime requests submitted"
          icon={ListChecks}
        />
        <OvertimeSummaryCard
          title="Total Cost"
          value={`Rwf${totalCost.toLocaleString()}`}
          description="For the current period"
          icon={DollarSign}
          trend={costChange}
          trendLabel="vs last month"
        />
        <OvertimeSummaryCard
          title="Budget Utilization"
          value={`${budgetUsedPercentage.toFixed(1)}%`}
          description={`Rwf${(budgetTotal - totalCost).toLocaleString()} remaining`}
          icon={TrendingUp}
          progress={budgetUsedPercentage}
        />
      </div>

      {/* Overtime Analysis */}
      {trendsData && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Overtime Nurses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Overtime Nurses
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Nurses with highest overtime hours this period
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendsData.topOvertimeNurses.slice(0, 5).map((nurse, index) => (
                <div key={nurse.nurseId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{nurse.nurseName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{nurse.totalOvertimeHours.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">
                        {nurse.departmentName}
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(nurse.totalOvertimeHours / Math.max(...trendsData.topOvertimeNurses.map(n => n.totalOvertimeHours))) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Next Period Predictions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered overtime forecasting
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Hours</span>
                  <Badge variant="outline">
                    {trendsData.predictions.nextPeriodEstimate.toFixed(1)}h
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Range</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {trendsData.predictions.confidenceInterval[0].toFixed(1)}h - {trendsData.predictions.confidenceInterval[1].toFixed(1)}h
                    </div>
                    <div className="text-xs text-muted-foreground">95% confidence</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Period</span>
                  <Badge variant="secondary">{totalHours.toFixed(1)}h</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Previous Period</span>
                  <Badge variant="secondary">{previousTotalHours.toFixed(1)}h</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Trend</span>
                  <Badge 
                    variant={hoursChange >= 0 ? "destructive" : "default"}
                    className="flex items-center gap-1"
                  >
                    {hoursChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(hoursChange).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Approval Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Overtime Approvals</CardTitle>
            <p className="text-sm text-muted-foreground">
              {mockOvertimeRecords.filter(r => r.status === 'PENDING').length} requests awaiting approval
            </p>
          </CardHeader>
          <CardContent>
            <OvertimeApprovalTable data={mockOvertimeRecords} />
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overtime Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Weekly overtime patterns
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingCurrentMonth ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : trendsData?.trends.length ? (
              <div className="space-y-4">
                {trendsData.trends.slice(0, 4).map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Week {index + 1}</span>
                      <div className="text-right">
                        <div className="font-medium">{trend.totalHours.toFixed(1)}h</div>
                        <div className="text-xs text-muted-foreground">
                          ${trend.totalCost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={(trend.totalHours / Math.max(...trendsData.trends.map(t => t.totalHours))) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground text-center">
                  No trend data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading States */}
      {(isLoadingCurrentMonth || isLoadingPreviousMonth) && (
        <Alert>
          <Hourglass className="h-4 w-4" />
          <AlertDescription>
            Loading overtime trends data...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}