'use client';

/**
 * @file The main page for the compliance violations dashboard.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { useState } from 'react';
import { AlertTriangle, ShieldCheck, Hourglass, TrendingUp, Calendar, BarChart3, Users, Clock } from 'lucide-react';
import { useComplianceViolations, useAttendanceStats } from '@/hooks/queries/use-attendance-queries';
import { useCurrentMonthCompliance, usePreviousMonthCompliance } from '@/hooks/use-compliance-reporting';
import { ComplianceFilterSidebar, ComplianceFilters } from '@/components/features/compliance/compliance-filter-sidebar';
import { ComplianceStatCard } from '@/components/features/compliance/compliance-stat-card';
import { ComplianceViolationCard } from '@/components/features/compliance/compliance-violation-card';
import { ComplianceViolation } from '@/types/compliance.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialFilters: ComplianceFilters = {
  dateRange: { from: undefined, to: undefined },
  severity: 'all',
  status: 'all',
};

export default function ViolationsDashboardPage() {
  const [filters, setFilters] = useState<ComplianceFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Fetching violation data with pagination and filters
  const { data: violationsResponse, isLoading: isLoadingViolations } = useComplianceViolations(page, 10 /*, filters*/);
  
  // Fetching stats data
  const { data: statsResponse, isLoading: isLoadingStats } = useAttendanceStats();
  
  // Fetching compliance summary data
  const { 
    data: currentMonthData, 
    isLoading: isLoadingCurrentMonth 
  } = useCurrentMonthCompliance();
  
  const { 
    data: previousMonthData, 
    isLoading: isLoadingPreviousMonth 
  } = usePreviousMonthCompliance();

  const handleFilterChange = (newFilters: Partial<ComplianceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handleResolveViolation = (violationId: string) => {
    // Here you would call a mutation to resolve the violation
    console.log(`Resolving violation ${violationId}`);
  };

  const violations = (violationsResponse?.success && 'data' in violationsResponse) ? violationsResponse.data : [];
  const stats = (statsResponse?.success && 'data' in statsResponse) ? statsResponse.data : { present: 0, late: 0, absent: 0 };
  const pagination = (violationsResponse?.success && 'pagination' in violationsResponse) ? violationsResponse.pagination : null;
  
  const complianceData = currentMonthData?.success ? currentMonthData.data : null;
  const previousComplianceData = previousMonthData?.success ? previousMonthData.data : null;

  // Calculate compliance improvement
  const currentViolations = complianceData?.totalViolations || 0;
  const previousViolations = previousComplianceData?.totalViolations || 0;
  const improvement = previousViolations > 0 ? ((previousViolations - currentViolations) / previousViolations) * 100 : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Compliance Violations Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage compliance violations across all departments
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

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceStatCard 
          title="Total Violations" 
          value={complianceData?.totalViolations ?? 0} 
          icon={AlertTriangle} 
          description="All unresolved issues" 
          trend={improvement}
          trendLabel="vs last month"
        />
        <ComplianceStatCard 
          title="Pending Review" 
          value={stats.late} 
          icon={Hourglass} 
          description="Violations needing action" 
        />
        <ComplianceStatCard 
          title="Resolved" 
          value={stats.present} 
          icon={ShieldCheck} 
          description="Issues closed this month" 
        />
        <ComplianceStatCard 
          title="Compliance Rate" 
          value={`${((1 - (currentViolations / 100)) * 100).toFixed(1)}%`} 
          icon={TrendingUp} 
          description="Overall compliance score" 
        />
      </div>

      {/* Compliance Overview */}
      {complianceData && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Department Violations Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Violations by Department
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of violations across departments
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceData.violationsByDepartment.map((dept, index) => (
                <div key={dept.departmentName} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.departmentName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{dept.count}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {dept.rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={dept.rate * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Trends
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Month-over-month comparison
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Month</span>
                <Badge variant={currentViolations < previousViolations ? "default" : "destructive"}>
                  {currentViolations} violations
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Previous Month</span>
                <Badge variant="secondary">
                  {previousViolations} violations
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Improvement</span>
                <Badge 
                  variant={improvement >= 0 ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%
                  {improvement >= 0 ? <TrendingUp className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="w-full lg:w-1/4 xl:w-1/5">
          <ComplianceFilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 xl:w-4/5">
          <Tabs defaultValue="violations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="violations">Violations Feed</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="violations" className="space-y-4">
              {/* Violations List Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Violations Feed</h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingViolations ? 'Loading...' : `${violations.length} violations found`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Page {page} of {pagination?.total_pages || 1}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!pagination || page >= pagination.total_pages}
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Violations List */}
              <div className="space-y-4">
                {isLoadingViolations ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))
                ) : violations.length > 0 ? (
                  violations.map((violation: ComplianceViolation) => (
                    <ComplianceViolationCard
                      key={violation.violation_id}
                      violation={violation}
                      onResolve={handleResolveViolation}
                    />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <CardContent className="space-y-4">
                      <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold">No violations found</h3>
                        <p className="text-muted-foreground">
                          Great job! No compliance violations detected for the selected period.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Detailed analysis of compliance patterns and trends
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analytics dashboard coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reports</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate and download compliance reports
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Report generation coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Loading States */}
      {(isLoadingCurrentMonth || isLoadingPreviousMonth) && (
        <Alert>
          <Hourglass className="h-4 w-4" />
          <AlertDescription>
            Loading compliance data...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}