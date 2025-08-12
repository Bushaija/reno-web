'use client';

/**
 * @file A data table for displaying and managing attendance records.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { useState } from 'react';
import { useAttendanceRecords } from '@/hooks/queries/use-attendance-queries';
import { ReusableDataTable } from '@/components/data-table/components/data-table';
import { columns } from './attendance-columns';

export function AttendanceTable() {
  // For now, we'll use static filters. These would be managed by state in a real app.
  const [filters, setFilters] = useState({ status: 'all' });
  const { data: response, isLoading, isError, error } = useAttendanceRecords(filters);

  const attendanceData = response?.success ? response.data : [];

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar would go here with filters */}
      <ReusableDataTable
        columns={columns}
        data={attendanceData}
        isLoading={isLoading}
        searchKey="assignment_id" // Example search key
        searchPlaceholder="Search by nurse..."
        // pagination and other props would be connected here
      />
    </div>
  );
}
