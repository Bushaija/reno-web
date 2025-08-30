import React from 'react'
import ShiftCalendar  from '@/features/calendar/shifts-calendar'

const ShiftScheduling = () => {
  return (
    <div className="mx-4">
      <div className="flex items-center justify-between my-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Shift Scheduling</h1>
          <p className="text-sm text-gray-500">
            Manage your shift scheduling.
          </p>
        </div>
        
      </div>
      <ShiftCalendar />
      
    </div>
  );
}

export default ShiftScheduling