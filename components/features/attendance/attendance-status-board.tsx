'use client';

import { useState } from 'react';
import { useNurseStatuses } from '@/hooks/queries/use-attendance-queries';
import { StatusBoardFilters, StatusBoardFilters as StatusBoardFiltersType } from './status-board-filters';
import { NurseStatusCard } from './nurse-status-card';
import { Skeleton } from '@/components/ui/skeleton';

const mockDepartments = [
  { department_id: 'd1', name: 'Cardiology' },
  { department_id: 'd2', name: 'Neurology' },
  { department_id: 'd3', name: 'Orthopedics' },
];

export const AttendanceStatusBoard = () => {
  const [filters, setFilters] = useState<StatusBoardFiltersType>({ search: '', departmentId: 'all', status: 'all' });
  const { data: response, isLoading, error } = useNurseStatuses(filters);

  const handleFilterChange = (newFilters: StatusBoardFiltersType) => {
    setFilters(newFilters);
  };

  const handleSendMessage = (nurseId: string) => {
    console.log(`Sending message to nurse ${nurseId}`);
  };

  const handleViewSchedule = (nurseId: string) => {
    console.log(`Viewing schedule for nurse ${nurseId}`);
  };

  const nurseData = response?.success && 'data' in response ? response.data : [];

  if (error) {
    return <div className="text-destructive p-4">Error loading attendance status. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-1/4 xl:w-1/5">
        <StatusBoardFilters departments={mockDepartments} onFilterChange={handleFilterChange} />
      </aside>
      <main className="w-full lg:w-3/4 xl:w-4/5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
            : nurseData.map(nurse => (
                <NurseStatusCard
                  key={nurse.nurse_id}
                  nurse={nurse}
                  onSendMessage={handleSendMessage}
                  onViewSchedule={handleViewSchedule}
                />
              ))}
        </div>
        {!isLoading && nurseData.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No nurses found matching the current filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};
