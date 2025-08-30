'use client';

import { useState } from 'react';
import { useNurseStatuses, useAttendanceStats, useRealTimeAttendance } from '@/hooks/use-get-real-time-attendance';
import { StatusBoardFilters } from './status-board-filters';
import { NurseStatusCard } from './nurse-status-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Users, Clock, AlertTriangle } from 'lucide-react';

export const AttendanceStatusBoard = () => {
  const [filters, setFilters] = useState({
    search: '',
    departmentId: 'all',
    status: 'all'
  });

  // Fetch nurse statuses using our custom hook
  const { 
    data: nurseResponse, 
    isLoading: nursesLoading, 
    error: nursesError,
    refetch: refetchNurses
  } = useNurseStatuses(filters);

  // Fetch attendance statistics
  const { 
    data: statsResponse, 
    isLoading: statsLoading 
  } = useAttendanceStats();

  // Fetch real-time attendance records
  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError
  } = useRealTimeAttendance();

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSendMessage = (nurseId: string) => {
    console.log(`Sending message to nurse ${nurseId}`);
    // TODO: Implement messaging functionality
  };

  const handleViewSchedule = (nurseId: string) => {
    console.log(`Viewing schedule for nurse ${nurseId}`);
    // TODO: Implement schedule viewing functionality
  };

  const handleRefresh = () => {
    refetchNurses();
  };

  const nurseData = nurseResponse?.success ? nurseResponse.data : [];
  const stats = statsResponse?.success ? statsResponse.data : null;
  const attendanceRecords = attendanceResponse?.success ? attendanceResponse.data : [];

  // Transform attendance records to display format when nurse statuses are not available
  const displayData = nurseData.length > 0 ? nurseData : attendanceRecords.map(record => ({
    nurse_id: record.assignment.worker_id.toString(),
    first_name: `Nurse ${record.assignment.worker_id}`,
    last_name: '',
    avatar_url: undefined,
    status: record.status.toUpperCase() as any,
    department: {
      department_id: 'unknown',
      name: 'Unknown Department'
    },
    patient_ratio: {
      current: record.assignment.patient_load || 0,
      max: 10
    },
    shift_start_time: record.scheduled_start,
    shift_end_time: record.scheduled_end,
    alerts: record.late_minutes > 0 ? [{
      alert_id: 'late-alert',
      type: 'OVERTIME' as any,
      message: `Late by ${record.late_minutes} minutes`,
      timestamp: record.recorded_at
    }] : []
  }));

  // Debug logging
  console.log('Attendance Response:', attendanceResponse);
  console.log('Nurse Response:', nurseResponse);
  console.log('Stats Response:', statsResponse);
  console.log('Attendance Records:', attendanceRecords);
  console.log('Display Data:', displayData);

  if (nursesError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading attendance status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Status Board</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of nurse attendance and status
          </p>
        </div> */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={nursesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${nursesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground">
                Nurses currently on duty
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <p className="text-xs text-muted-foreground">
                Nurses who arrived late
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground">
                Nurses not present
              </p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-1/4 xl:w-1/5">
          <StatusBoardFilters onFilterChange={handleFilterChange} />
        </aside>

        {/* Nurse Status Grid */}
        <main className="w-full lg:w-3/4 xl:w-4/5">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Nurse Status</h2>
              <p className="text-sm text-muted-foreground">
                {nursesLoading || attendanceLoading ? 'Loading...' : `${displayData.length} nurse${displayData.length !== 1 ? 's' : ''} found`}
              </p>
              {nurseData.length === 0 && attendanceRecords.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Showing attendance data (nurse statuses endpoint not available)
                </p>
              )}
            </div>
            {displayData.length > 0 && (
              <Badge variant="secondary">
                Real-time updates every 15s
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {(nursesLoading || attendanceLoading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          )}

          {/* Nurse Status Cards */}
          {!(nursesLoading || attendanceLoading) && displayData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {displayData.map((nurse, index) => (
                <NurseStatusCard
                  key={nurse.nurse_id || index}
                  nurse={nurse}
                  onSendMessage={handleSendMessage}
                  onViewSchedule={handleViewSchedule}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!(nursesLoading || attendanceLoading) && displayData.length === 0 && (
            <Card className="p-12 text-center">
              <CardContent className="space-y-4">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">No nurses found</h3>
                  <p className="text-muted-foreground">
                    {filters.search || filters.departmentId !== 'all' || filters.status !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'No nurses are currently assigned or available.'
                    }
                  </p>
                </div>
                {(filters.search || filters.departmentId !== 'all' || filters.status !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ search: '', departmentId: 'all', status: 'all' })}
                  >
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};
