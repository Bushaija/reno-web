'use client';

/**
 * @file The main page for the compliance violations dashboard.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { useState } from 'react';
import { AlertTriangle, ShieldCheck, Hourglass, TrendingUp } from 'lucide-react';
import { useComplianceViolations, useAttendanceStats } from '@/hooks/queries/use-attendance-queries';
import { ComplianceFilterSidebar, ComplianceFilters } from '@/components/features/compliance/compliance-filter-sidebar';
import { ComplianceStatCard } from '@/components/features/compliance/compliance-stat-card';
import { ComplianceViolationCard } from '@/components/features/compliance/compliance-violation-card';
import { ComplianceViolation } from '@/types/compliance.types';
import { Skeleton } from '@/components/ui/skeleton';

const initialFilters: ComplianceFilters = {
  dateRange: { from: undefined, to: undefined },
  severity: 'all',
  status: 'all',
};

export default function ViolationsDashboardPage() {
  const [filters, setFilters] = useState<ComplianceFilters>(initialFilters);
  const [page, setPage] = useState(1);

  // Fetching violation data with pagination and filters
  const { data: violationsResponse, isLoading: isLoadingViolations } = useComplianceViolations(page, 10 /*, filters*/);
  // Fetching stats data
  const { data: statsResponse, isLoading: isLoadingStats } = useAttendanceStats();

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

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-6">
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
        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <ComplianceStatCard title="Total Violations" value={pagination?.total ?? 0} icon={AlertTriangle} description="All unresolved issues" />
          <ComplianceStatCard title="Pending Review" value={stats.late} icon={Hourglass} description="Violations needing action" />
          <ComplianceStatCard title="Resolved" value={stats.present} icon={ShieldCheck} description="Issues closed this month" />
          <ComplianceStatCard title="Escalation Rate" value={`${stats.absent}%`} icon={TrendingUp} description="+2% from last month" />
        </div>

        {/* Violations List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Violations Feed</h2>
          {isLoadingViolations ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : (
            violations.map((violation: ComplianceViolation) => (
              <ComplianceViolationCard
                key={violation.violation_id}
                violation={violation}
                onResolve={handleResolveViolation}
              />
            ))
          )}
          {/* Pagination would go here */}
        </div>
      </main>
    </div>
  );
}