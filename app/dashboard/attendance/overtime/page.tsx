import React from 'react'
import { OvertimeSummaryCard } from '@/components/features/attendance/overtime-summary-card';
import { OvertimeApprovalTable } from '@/components/features/attendance/overtime-approval-table';
import { OvertimeRecord, OvertimeSummary } from '@/types/overtime.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Hourglass, ListChecks, TrendingUp } from 'lucide-react';

// Mock Data for Demonstration
const mockSummaryData: OvertimeSummary = {
  total_hours_current_period: 345.5,
  approved_hours_current_period: 310,
  pending_requests: 12,
  total_cost_current_period: 17275,
  budget_total: 25000,
  budget_used_percentage: 69.1,
};

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
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Overtime Management</h1>
        <p className="text-muted-foreground">Track, approve, and analyze overtime across all departments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OvertimeSummaryCard
          title="Total Overtime Hours"
          value={`${mockSummaryData.total_hours_current_period}h`}
          description={`${mockSummaryData.approved_hours_current_period}h approved this month`}
          icon={Hourglass}
        />
        <OvertimeSummaryCard
          title="Pending Requests"
          value={mockSummaryData.pending_requests.toString()}
          description="Awaiting supervisor approval"
          icon={ListChecks}
        />
        <OvertimeSummaryCard
          title="Estimated Cost"
          value={`$${mockSummaryData.total_cost_current_period.toLocaleString()}`}
          description="For the current billing period"
          icon={DollarSign}
        />
        <OvertimeSummaryCard
          title="Budget Utilization"
          value={`${mockSummaryData.budget_used_percentage.toFixed(1)}%`}
          description={`$${(mockSummaryData.budget_total - mockSummaryData.total_cost_current_period).toLocaleString()} remaining`}
          icon={TrendingUp}
          progress={mockSummaryData.budget_used_percentage}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Approval Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending Overtime Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <OvertimeApprovalTable data={mockOvertimeRecords} />
          </CardContent>
        </Card>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Overtime Trends</CardTitle>
          </CardHeader>
          <CardContent className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Chart coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}