import { AttendanceStatusBoard } from '@/components/features/attendance/attendance-status-board';

export default function RealTimeAttendancePage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Real-Time Attendance Status</h1>
        <p className="text-muted-foreground">A live overview of nurse status across all departments.</p>
      </div>
      <AttendanceStatusBoard />
    </div>
  );
}