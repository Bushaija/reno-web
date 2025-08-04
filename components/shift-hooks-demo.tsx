import React from 'react';
import { useAllShifts, useShiftsByWorker, useShiftsByDepartment, useShiftsByStatus, useShift } from '@/features/shifts/api';

// Demo component showing how to use all the shift hooks
export default function ShiftHooksDemo() {
  // Fetch all shifts (for calendar display)
  const { data: allShifts, isLoading: allShiftsLoading, error: allShiftsError } = useAllShifts();
  
  // Fetch shifts for a specific worker
  const { data: workerShifts, isLoading: workerShiftsLoading } = useShiftsByWorker(1);
  
  // Fetch shifts for a specific department
  const { data: deptShifts, isLoading: deptShiftsLoading } = useShiftsByDepartment('ICU');
  
  // Fetch shifts by status
  const { data: scheduledShifts, isLoading: scheduledShiftsLoading } = useShiftsByStatus('scheduled');
  
  // Fetch a single shift
  const { data: singleShift, isLoading: singleShiftLoading } = useShift(1);

  if (allShiftsLoading) {
    return <div>Loading all shifts...</div>;
  }

  if (allShiftsError) {
    return <div>Error loading shifts: {allShiftsError.message}</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Shift Hooks Demo</h1>
      
      {/* All Shifts */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">All Shifts ({allShifts?.length || 0})</h2>
        <div className="space-y-2">
          {allShifts?.map((shift) => (
            <div key={shift.id} className="p-2 bg-gray-50 rounded">
              <div className="font-medium">{shift.department}</div>
              <div className="text-sm text-gray-600">
                {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Worker ID: {shift.workerId}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Shifts */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Worker 1 Shifts ({workerShifts?.length || 0})</h2>
        {workerShiftsLoading ? (
          <div>Loading worker shifts...</div>
        ) : (
          <div className="space-y-2">
            {workerShifts?.map((shift) => (
              <div key={shift.id} className="p-2 bg-blue-50 rounded">
                <div className="font-medium">{shift.department}</div>
                <div className="text-sm text-gray-600">
                  {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Shifts */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">ICU Department Shifts ({deptShifts?.length || 0})</h2>
        {deptShiftsLoading ? (
          <div>Loading department shifts...</div>
        ) : (
          <div className="space-y-2">
            {deptShifts?.map((shift) => (
              <div key={shift.id} className="p-2 bg-green-50 rounded">
                <div className="font-medium">{shift.department}</div>
                <div className="text-sm text-gray-600">
                  {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Worker ID: {shift.workerId}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Shifts */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Scheduled Shifts ({scheduledShifts?.length || 0})</h2>
        {scheduledShiftsLoading ? (
          <div>Loading scheduled shifts...</div>
        ) : (
          <div className="space-y-2">
            {scheduledShifts?.map((shift) => (
              <div key={shift.id} className="p-2 bg-yellow-50 rounded">
                <div className="font-medium">{shift.department}</div>
                <div className="text-sm text-gray-600">
                  {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Status: {shift.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single Shift */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Single Shift (ID: 1)</h2>
        {singleShiftLoading ? (
          <div>Loading single shift...</div>
        ) : singleShift ? (
          <div className="p-2 bg-purple-50 rounded">
            <div className="font-medium">{singleShift.department}</div>
            <div className="text-sm text-gray-600">
              {new Date(singleShift.startTime).toLocaleString()} - {new Date(singleShift.endTime).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Worker ID: {singleShift.workerId}</div>
            <div className="text-sm text-gray-500">Status: {singleShift.status}</div>
            {singleShift.notes && (
              <div className="text-sm text-gray-500">Notes: {singleShift.notes}</div>
            )}
          </div>
        ) : (
          <div>Shift not found</div>
        )}
      </div>
    </div>
  );
} 