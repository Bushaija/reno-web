'use client';

/**
 * @file A component for clocking in and out of shifts.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { useState } from 'react';
import { Clock, MapPin, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useRealTimeClock } from '@/hooks/use-real-time-clock';
import { useClockIn, useClockOut } from '@/hooks/mutations/use-attendance-mutations';
import { AttendanceRecord } from '@/types/attendance.types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ClockInOutCardProps {
  /** The attendance record for the current shift. If null, assumes clock-in is needed. */
  attendanceRecord: AttendanceRecord | null;
  /** The ID of the shift assignment. Required for clocking in. */
  assignmentId: number;
}

export function ClockInOutCard({ attendanceRecord, assignmentId }: ClockInOutCardProps) {
  const [notes, setNotes] = useState('');
  const location = useGeolocation();
  const currentTime = useRealTimeClock();

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const isClockedIn = !!attendanceRecord?.clock_in_time && !attendanceRecord?.clock_out_time;
  const isClockingActionLoading = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = () => {
    if (!location.latitude || !location.longitude) return;
    clockInMutation.mutate({
      assignment_id: assignmentId,
      location_lat: location.latitude,
      location_lng: location.longitude,
      notes,
    });
  };

  const handleClockOut = () => {
    if (!attendanceRecord) return;
    clockOutMutation.mutate({
      record_id: attendanceRecord.record_id,
      patient_count_end: 8, // Example value, should be dynamic
      notes,
    });
  };

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Time & Attendance</span>
          <Badge variant={isClockedIn ? 'default' : 'outline'}>{isClockedIn ? 'Clocked In' : 'Clocked Out'}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Real-time Clock */}
        <div className="text-center">
          <p className="text-5xl font-bold tracking-tighter">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-sm text-muted-foreground">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-muted-foreground">{timeZone}</p>
        </div>

        {/* Location Info */}
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertTitle>Location Status</AlertTitle>
          <AlertDescription>
            {location.isLoading && 'Fetching location...'}
            {location.error && `Error: ${location.error.message}`}
            {location.latitude && `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)} (Accuracy: ${location.accuracy?.toFixed(2)}m)`}
          </AlertDescription>
        </Alert>

        {/* Shift Info */}
        {attendanceRecord && (
          <div className="text-sm">
            <p><strong>Scheduled Start:</strong> {new Date(attendanceRecord.scheduled_start).toLocaleTimeString()}</p>
            <p><strong>Actual Clock-In:</strong> {attendanceRecord.clock_in_time ? new Date(attendanceRecord.clock_in_time).toLocaleTimeString() : 'N/A'}</p>
          </div>
        )}

        {/* Notes Input */}
        <Textarea
          placeholder={isClockedIn ? 'Add clock-out notes or handover info...' : 'Add clock-in notes...'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={150}
          className="resize-none"
          aria-label="Notes for clock-in or clock-out"
        />
      </CardContent>
      <CardFooter>
        {isClockedIn ? (
          <Button onClick={handleClockOut} disabled={isClockingActionLoading} className="w-full" size="lg" variant="destructive">
            {isClockingActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clock Out
          </Button>
        ) : (
          <Button onClick={handleClockIn} disabled={isClockingActionLoading || location.isLoading || !!location.error} className="w-full" size="lg">
            {(isClockingActionLoading || location.isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clock In
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
