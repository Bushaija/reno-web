"use client";

import SchedulerWrapper from "@/components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "@/providers/schedular-provider";
import { useAllShifts } from "@/features/shifts/api";
import { Event } from "@/types";

// Helper function to convert Shift to Event format
const convertShiftToEvent = (shift: any): Event => {
  // Parse dates properly - handle both ISO strings and database format
  const startDate = new Date(shift.startTime);
  const endDate = new Date(shift.endTime);
  
  console.log(`Converting shift ${shift.id}:`, {
    originalStart: shift.startTime,
    originalEnd: shift.endTime,
    parsedStart: startDate,
    parsedEnd: endDate,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString()
  });
  
  return {
    id: `shift-${shift.id}`, // Prefix to avoid conflicts with local events
    title: shift.department,
    startDate: startDate,
    endDate: endDate,
    description: shift.notes || `Worker ID: ${shift.workerId}`,
    variant: "primary" as const,
    // Add shift-specific data
    shiftData: {
      id: shift.id,
      workerId: shift.workerId,
      department: shift.department,
      maxStaff: shift.maxStaff,
      status: shift.status,
      notes: shift.notes,
    },
  };
};

export default function ShiftCalendar() {
  const { data: shifts, isLoading, error, refetch } = useAllShifts();

  // Convert API shifts to calendar events
  const calendarEvents = shifts ? shifts.map(convertShiftToEvent) : [];
  
  console.log('=== SHIFT CALENDAR DEBUG ===');
  console.log('Shifts from API:', shifts);
  console.log('Calendar events:', calendarEvents);
  console.log('Calendar events length:', calendarEvents.length);
  
  // Check what events are available for today
  const today = new Date();
  const todayEvents = calendarEvents.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    return eventStart <= endOfDay && eventEnd >= startOfDay;
  });
  
  console.log('Events for today:', todayEvents);
  console.log('Today:', today.toISOString());

  // Handle new shift creation - refetch data from API
  const handleAddEvent = (event: Event) => {
    // Refetch shifts from API to get the latest data
    refetch();
  };

  const handleUpdateEvent = (event: Event) => {
    // Refetch shifts from API to get the latest data
    refetch();
  };

  const handleDeleteEvent = (id: string) => {
    // Refetch shifts from API to get the latest data
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading shifts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading shifts: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Debug info */}
      {/* <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Shifts loaded: {shifts?.length || 0}</p>
        <p>Events converted: {calendarEvents.length}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? error.message : 'None'}</p>
        <p>Events for today: {todayEvents.length}</p>
        <p>Current date: {today.toLocaleDateString()}</p>
        {calendarEvents.length > 0 && (
          <div>
            <p>First event: {new Date(calendarEvents[0].startDate).toLocaleDateString()}</p>
            <p>Last event: {new Date(calendarEvents[calendarEvents.length - 1].startDate).toLocaleDateString()}</p>
          </div>
        )}
      </div> */}
      
      <SchedulerProvider 
        weekStartsOn="monday"
        initialState={calendarEvents}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      >
        <SchedulerWrapper 
          stopDayEventSummary={true}
          classNames={{
            tabs: {
              panel: "p-0",
            },
          }}
        />
      </SchedulerProvider>
    </div>
  );
}