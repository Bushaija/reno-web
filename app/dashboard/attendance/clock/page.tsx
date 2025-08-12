'use client';

import { ClockInOutCard } from '@/components/features/attendance/clock-in-out-card';
import { AttendanceRecord } from '@/types/attendance.types';

export default function ClockPage() {
  // Mock data for demonstration purposes
  // In a real app, this would come from an API call fetching the user's current shift
  const mockAttendanceRecord: AttendanceRecord | null = null;
  const mockAssignmentId = 12345; // Example assignment ID

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-md">
        <ClockInOutCard attendanceRecord={mockAttendanceRecord} assignmentId={mockAssignmentId} />
      </div>
    </div>
  );
}