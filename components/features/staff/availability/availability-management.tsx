'use client';

import React, { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Nurse, AvailabilitySlot, AvailabilityStatus, NurseAvailability } from '@/lib/types/availability';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNurses } from "@/features/nurses/api/useNurses";
import { useUpdateNurseAvailability, useGetNurseAvailability } from "@/features/nurses/api";

// Updated Nurse interface to match the API response
interface APINurse {
  worker_id: number;
  user: {
    user_id: number;
    name: string;
    email: string;
    phone: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  employee_id: string;
  specialization: string | null;
  license_number: string | null;
  certification: string | null;
  hire_date: string | null;
  employment_type: string;
  base_hourly_rate: string | null;
  overtime_rate: string | null;
  max_hours_per_week: number;
  max_consecutive_days: number;
  min_hours_between_shifts: number;
  preferences: {
    prefers_day_shifts: boolean;
    prefers_night_shifts: boolean;
    weekend_availability: boolean;
    holiday_availability: boolean;
    float_pool_member: boolean;
  };
  seniority_points: number;
  fatigue_score: number;
  skills: any[];
}

// Move functions outside component to prevent recreation
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i <= 23; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const getStatusColor = (status: AvailabilityStatus | undefined) => {
  if (!status) return 'bg-white hover:bg-blue-100';
  switch (status) {
    case 'available':
      return 'bg-green-200 hover:bg-green-300';
    case 'unavailable':
      return 'bg-red-200 hover:bg-red-300';
    case 'preferred':
      return 'bg-yellow-200 hover:bg-yellow-300';
    default:
      return 'bg-white hover:bg-blue-100';
  }
};

const AvailabilityManagement: React.FC = () => {
  const { data: nursesResponse, isLoading: nursesLoading, error: nursesError } = useNurses();
  const [selectedNurseId, setSelectedNurseId] = useState<string | undefined>();
  const [viewedNurse, setViewedNurse] = useState<APINurse | undefined>();
  const [availability, setAvailability] = useState<NurseAvailability[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSlots, setDraggedSlots] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());

  // Use the custom hooks for fetching and updating nurse availability
  const { data: availabilityResponse, isLoading: availabilityLoading, error: availabilityError } = useGetNurseAvailability(selectedNurseId, currentDate);
  const updateAvailabilityMutation = useUpdateNurseAvailability(selectedNurseId);

  const weekStartsOn = 1; // Monday
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn });
  const days = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);
  
  // Create a stable week identifier to prevent infinite loops
  const weekIdentifier = React.useMemo(() => 
    format(startOfCurrentWeek, 'yyyy-MM-dd'), 
    [startOfCurrentWeek]
  );

  // Set initial selected nurse when data loads
  useEffect(() => {
    if (nursesResponse?.data && nursesResponse.data.length > 0 && !selectedNurseId) {
      const firstNurse = nursesResponse.data[0] as APINurse;
      setSelectedNurseId(firstNurse.worker_id.toString());
      setViewedNurse(firstNurse);
    }
  }, [nursesResponse, selectedNurseId]);

  // Transform API availability data to local format when it changes
  useEffect(() => {
    if (availabilityResponse?.data && selectedNurseId) {
      console.log('Raw API response:', availabilityResponse.data);
      
      const transformedAvailability: NurseAvailability[] = [];
      
      // Group availability by day
      const availabilityByDay = new Map<number, typeof availabilityResponse.data>();
      
      availabilityResponse.data.forEach(avail => {
        if (!availabilityByDay.has(avail.day_of_week)) {
          availabilityByDay.set(avail.day_of_week, []);
        }
        availabilityByDay.get(avail.day_of_week)!.push(avail);
      });

      // Create availability objects for each day
      days.forEach((day) => {
        const dayOfWeek = day.getDay();
        const dayAvailability = availabilityByDay.get(dayOfWeek) || [];
        
        if (dayAvailability.length > 0) {
          // Create hourly slots based on availability data
          const slots: AvailabilitySlot[] = [];
          
          dayAvailability.forEach(avail => {
            console.log(`Processing day ${dayOfWeek}:`, avail);
            
            // Create slots for ALL availability records, regardless of status
            if (avail.start_time !== avail.end_time) {
              // Parse start and end times
              const [startHour] = avail.start_time.split(':').map(Number);
              const [endHour] = avail.end_time.split(':').map(Number);
              
              console.log(`Creating slots from ${startHour}:00 to ${endHour}:00, preferred: ${avail.is_preferred}, available: ${avail.is_available}`);
              
              // Create slots for each hour in the availability range
              for (let hour = startHour; hour < endHour; hour++) {
                const startTime = new Date(day);
                startTime.setHours(hour, 0, 0, 0);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                
                // Determine status based on API data
                let status: AvailabilityStatus;
                if (avail.is_preferred) {
                  status = 'preferred';        // Yellow
                } else if (avail.is_available) {
                  status = 'available';        // Green
                } else {
                  status = 'unavailable';      // Red
                }
                
                console.log(`Hour ${hour}:00 = ${status} (${avail.is_preferred ? 'preferred' : avail.is_available ? 'available' : 'unavailable'})`);
                
                slots.push({
                  id: `${selectedNurseId}-${startTime.toISOString()}`,
                  startTime,
                  endTime,
                  status
                });
              }
            }
          });

          if (slots.length > 0) {
            transformedAvailability.push({
              nurseId: selectedNurseId,
              date: day,
              slots
            });
          }
        }
      });

      console.log('Transformed availability:', transformedAvailability);
      setAvailability(transformedAvailability);
    } else if (availabilityResponse?.data && availabilityResponse.data.length === 0) {
      // No availability data, clear the local state
      setAvailability([]);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cleanup if needed
    };
  }, [availabilityResponse, selectedNurseId, weekIdentifier]);

  const updateAndSaveAvailability = async (updatedData: NurseAvailability[]) => {
    if (!selectedNurseId) return;

    const previousAvailability = [...availability];
    setAvailability(updatedData);

    try {
      const weekDates = days.map(d => format(d, 'yyyy-MM-dd'));
      const weekAvailabilityToSave = updatedData.filter(a => 
        a.nurseId === selectedNurseId && weekDates.includes(format(a.date, 'yyyy-MM-dd'))
      );

      // Transform the data to match the API format
      const apiAvailabilityData = weekAvailabilityToSave.map(avail => {
        // Group slots by status type
        const availableSlots = avail.slots.filter(slot => slot.status === 'available');
        const preferredSlots = avail.slots.filter(slot => slot.status === 'preferred');
        const unavailableSlots = avail.slots.filter(slot => slot.status === 'unavailable');
        
        const result = [];
        
        // Create availability record for available slots (green)
        if (availableSlots.length > 0) {
          const sortedSlots = availableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
          const firstSlot = sortedSlots[0];
          const lastSlot = sortedSlots[sortedSlots.length - 1];
          const endTime = new Date(lastSlot.endTime.getTime() + 60 * 60 * 1000);
          
          result.push({
            day_of_week: avail.date.getDay(),
            start_time: format(firstSlot.startTime, 'HH:mm'),
            end_time: format(endTime, 'HH:mm'),
            is_preferred: false,
            is_available: true,
            effective_from: format(avail.date, 'yyyy-MM-dd'),
            effective_until: format(avail.date, 'yyyy-MM-dd')
          });
        }
        
        // Create availability record for preferred slots (yellow)
        if (preferredSlots.length > 0) {
          const sortedSlots = preferredSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
          const firstSlot = sortedSlots[0];
          const lastSlot = sortedSlots[sortedSlots.length - 1];
          const endTime = new Date(lastSlot.endTime.getTime() + 60 * 60 * 1000);
          
          result.push({
            day_of_week: avail.date.getDay(),
            start_time: format(firstSlot.startTime, 'HH:mm'),
            end_time: format(endTime, 'HH:mm'),
            is_preferred: true,
            is_available: true,
            effective_from: format(avail.date, 'yyyy-MM-dd'),
            effective_until: format(avail.date, 'yyyy-MM-dd')
          });
        }
        
        // Create availability record for unavailable slots (red) - if needed
        if (unavailableSlots.length > 0) {
          const sortedSlots = unavailableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
          const firstSlot = sortedSlots[0];
          const lastSlot = unavailableSlots[sortedSlots.length - 1];
          const endTime = new Date(lastSlot.endTime.getTime() + 60 * 60 * 1000);
          
          result.push({
            day_of_week: avail.date.getDay(),
            start_time: format(firstSlot.startTime, 'HH:mm'),
            end_time: format(endTime, 'HH:mm'),
            is_preferred: false,
            is_available: false,
            effective_from: format(avail.date, 'yyyy-MM-dd'),
            effective_until: format(avail.date, 'yyyy-MM-dd')
          });
        }
        
        // If no slots exist, create a default unavailable record
        if (result.length === 0) {
          result.push({
            day_of_week: avail.date.getDay(),
            start_time: "00:00",
            end_time: "00:00",
            is_preferred: false,
            is_available: false,
            effective_from: format(avail.date, 'yyyy-MM-dd'),
            effective_until: format(avail.date, 'yyyy-MM-dd')
          });
        }
        
        return result;
      }).flat(); // Flatten the array since each day can have multiple records

      console.log('Sending to API:', apiAvailabilityData);
      
      // Debug: Show what each record represents
      apiAvailabilityData.forEach(record => {
        const statusText = record.is_preferred ? 'PREFERRED (Yellow)' : 
                          record.is_available ? 'AVAILABLE (Green)' : 'UNAVAILABLE (Red)';
        console.log(`Day ${record.day_of_week}: ${record.start_time}-${record.end_time} = ${statusText}`);
      });

      // Use the custom hook mutation
      await updateAvailabilityMutation.mutateAsync(apiAvailabilityData);
    } catch (error) {
      console.error('Failed to save availability', error);
      setAvailability(previousAvailability);
    }
  };

  const handleNurseSelection = (nurseId: string) => {
    setSelectedNurseId(nurseId);
    const selectedNurse = nursesResponse?.data.find(n => n.worker_id.toString() === nurseId) as APINurse | undefined;
    setViewedNurse(selectedNurse);
  };

  const handlePreviousWeek = () => setCurrentDate(subDays(currentDate, 7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const getSlotIdentifier = (day: Date, time: string) => `${format(day, 'yyyy-MM-dd')}_${time}`;

  const getSlot = (day: Date, time: string): AvailabilitySlot | undefined => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const nurseAvailability = availability.find(a => a.nurseId === selectedNurseId && format(a.date, 'yyyy-MM-dd') === dateStr);
    if (!nurseAvailability) return undefined;

    const startTime = new Date(`${dateStr}T${time}`);
    return nurseAvailability.slots.find(s => s.startTime.getTime() === startTime.getTime());
  };

  const handleSlotModification = (slotsToUpdate: Set<string>, status?: AvailabilityStatus) => {
    if (!selectedNurseId) return;

    const nextStatus: Record<AvailabilityStatus, AvailabilityStatus> = {
      unavailable: 'preferred',
      preferred: 'available',
      available: 'unavailable',
    };

    const newAvailability = [...availability];

    slotsToUpdate.forEach(identifier => {
      const [dateStr, time] = identifier.split('_');
      const day = new Date(dateStr);

      let nurseAvail = newAvailability.find(a => a.nurseId === selectedNurseId && format(a.date, 'yyyy-MM-dd') === dateStr);
      if (!nurseAvail) {
        nurseAvail = { nurseId: selectedNurseId, date: day, slots: [] };
        newAvailability.push(nurseAvail);
      }

      const startTime = new Date(`${dateStr}T${time}`);
      const existingSlotIndex = nurseAvail.slots.findIndex(s => s.startTime.getTime() === startTime.getTime());
      
      const currentStatus = existingSlotIndex !== -1 ? nurseAvail.slots[existingSlotIndex].status : undefined;
      const statusToApply = status ?? nextStatus[currentStatus!] ?? 'unavailable';

      if (existingSlotIndex !== -1) {
        nurseAvail.slots[existingSlotIndex].status = statusToApply;
      } else {
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        nurseAvail.slots.push({ id: `${selectedNurseId}-${startTime.toISOString()}`, startTime, endTime, status: statusToApply });
      }
    });

    updateAndSaveAvailability(newAvailability);
  };

  const handleSlotClick = (day: Date, time: string) => {
    if (isDragging) return; // Avoid click event firing during drag
    handleSlotModification(new Set([getSlotIdentifier(day, time)]));
  };

  const handleMouseDown = (day: Date, time: string) => {
    if (!selectedNurseId) return;
    setIsDragging(true);
    setDraggedSlots(new Set([getSlotIdentifier(day, time)]));
  };

  const handleMouseEnter = (day: Date, time: string) => {
    if (isDragging) {
      setDraggedSlots(prev => new Set(prev).add(getSlotIdentifier(day, time)));
    }
  };

  const handleGridMouseUp = () => {
    if (isDragging) {
      if (draggedSlots.size > 1) {
        handleSlotModification(draggedSlots, 'unavailable');
      } else if (draggedSlots.size === 1) {
        const identifier = Array.from(draggedSlots)[0];
        const [dateStr, time] = identifier.split('_');
        handleSlotModification(new Set([identifier]));
      }
    }
    setIsDragging(false);
    setDraggedSlots(new Set());
  };

  const handleGridMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedSlots(new Set());
    }
  };

  const handleClearAll = () => {
    if (!selectedNurseId) return;
    const weekDates = days.map(d => format(d, 'yyyy-MM-dd'));
    const newAvailability = availability.filter(a => a.nurseId !== selectedNurseId || !weekDates.includes(format(a.date, 'yyyy-MM-dd')));
    updateAndSaveAvailability(newAvailability);
  };

  const handleCopyPreviousWeek = () => {
    if (!selectedNurseId) return;
    // This is a simplified example. A real implementation would fetch previous week's data.
    console.log('Copying previous week - not implemented in mock');
  };

  const handleApplyToWeek = (status: AvailabilityStatus) => {
    if (!selectedNurseId) return;

    const newAvailability = [...availability];

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      let nurseAvail = newAvailability.find(a => a.nurseId === selectedNurseId && format(a.date, 'yyyy-MM-dd') === dateStr);

      if (!nurseAvail) {
        nurseAvail = { nurseId: selectedNurseId, date: day, slots: [] };
        newAvailability.push(nurseAvail);
      }

      const newSlots: AvailabilitySlot[] = timeSlots.map(time => {
        const [hour] = time.split(':').map(Number);
        const startTime = new Date(day);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        return {
          id: `${selectedNurseId}-${startTime.toISOString()}`,
          startTime,
          endTime,
          status: status,
        };
      });
      
      nurseAvail.slots = newSlots;
    });

    updateAndSaveAvailability(newAvailability);
  };

  // Show loading state while fetching nurses
  if (nursesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading nurses...</p>
      </div>
    );
  }

  // Show error state if nurses fetch failed
  if (nursesError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading nurses: {nursesError.message}</p>
      </div>
    );
  }

  // Show message if no nurses found
  if (!nursesResponse?.data || nursesResponse.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No nurses found</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 h-full">
      <div className="flex-grow">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Nurse Availability</h2>
                <select 
                  className="w-[200px] border-input bg-transparent px-3 py-2 text-sm rounded-md border shadow-xs focus-visible:border-ring focus-visible:ring-ring/50"
                  onChange={(e) => handleNurseSelection(e.target.value)} 
                  value={selectedNurseId || ''}
                >
                  <option value="" disabled>Select a nurse</option>
                  {nursesResponse.data.map((nurse) => (
                    <option key={nurse.worker_id} value={nurse.worker_id.toString()}>
                      {nurse.user.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleApplyToWeek('available')}>Set All Available</Button>
                  <Button variant="outline" size="sm" onClick={() => handleApplyToWeek('preferred')}>Set All Preferred</Button>
                  <Button variant="outline" size="sm" onClick={() => handleApplyToWeek('unavailable')}>Set All Unavailable</Button>
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>Clear Week</Button>
                  <Button variant="outline" size="sm" onClick={handleCopyPreviousWeek}>Copy Last Week</Button>
                </div>
                <div className="flex items-center gap-2 border-l pl-4">
                  <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(startOfCurrentWeek, 'MMM d')} - {format(addDays(startOfCurrentWeek, 6), 'MMM d, yyyy')}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {(availabilityLoading || updateAvailabilityMutation.isPending) && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                  <p>{availabilityLoading ? 'Loading availability...' : 'Saving availability...'}</p>
                </div>
              )}
              {availabilityError && (
                <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center z-10">
                  <p className="text-red-600">Error loading availability: {availabilityError.message}</p>
                </div>
              )}
              <div className="grid grid-cols-8 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden select-none" onMouseUp={handleGridMouseUp} onMouseLeave={handleGridMouseLeave}>
                <div className="bg-gray-50 p-2 text-xs font-medium text-gray-500 text-center"></div>
                {days.map((day) => (
                  <div key={format(day, 'yyyy-MM-dd')} className="bg-gray-50 p-2 text-xs font-medium text-gray-500 text-center">
                    {format(day, 'EEE d')}
                  </div>
                ))}

                {timeSlots.map((time) => (
                  <React.Fragment key={time}>
                    <div className="bg-gray-50 p-2 text-xs font-medium text-gray-500 text-right pr-4">{time}</div>
                    {days.map((day) => {
                      const identifier = getSlotIdentifier(day, time);
                      const slot = getSlot(day, time);
                      const slotStatus = slot?.status || 'none';
                      
                      return (
                        <div
                          key={identifier}
                          className={`h-12 cursor-pointer transition-colors ${draggedSlots.has(identifier) ? 'bg-blue-300' : getStatusColor(slot?.status)}`}
                          onMouseDown={() => handleMouseDown(day, time)}
                          onMouseEnter={() => handleMouseEnter(day, time)}
                          onClick={() => handleSlotClick(day, time)}
                          title={`${format(day, 'EEE')} ${time} - Status: ${slotStatus}`}
                        ></div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-80">
        <Card>
          <CardHeader>
            <CardTitle>Nurse Details</CardTitle>
          </CardHeader>
          <CardContent>
            {viewedNurse ? (
              <div className="space-y-3">
                <h3 className="font-semibold">{viewedNurse.user.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Employee ID:</span> {viewedNurse.employee_id}</p>
                  <p><span className="font-medium">Specialization:</span> {viewedNurse.specialization || 'Not specified'}</p>
                  <p><span className="font-medium">License:</span> {viewedNurse.license_number || 'Not specified'}</p>
                  <p><span className="font-medium">Employment:</span> {viewedNurse.employment_type}</p>
                  <p><span className="font-medium">Base Rate:</span> ${viewedNurse.base_hourly_rate || '0.00'}/hr</p>
                  <p><span className="font-medium">Max Hours/Week:</span> {viewedNurse.max_hours_per_week}</p>
                </div>
                <div className="pt-2 border-t">
                  <h4 className="font-medium text-sm mb-2">Preferences</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Day Shifts: {viewedNurse.preferences.prefers_day_shifts ? '✓' : '✗'}</p>
                    <p>Night Shifts: {viewedNurse.preferences.prefers_night_shifts ? '✓' : '✗'}</p>
                    <p>Weekend: {viewedNurse.preferences.weekend_availability ? '✓' : '✗'}</p>
                    <p>Holiday: {viewedNurse.preferences.holiday_availability ? '✓' : '✗'}</p>
                  </div>
                </div>
                
                {/* Debug Information */}
                <div className="pt-2 border-t">
                  <h4 className="font-medium text-sm mb-2">Debug Info</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Selected Nurse ID: {selectedNurseId}</p>
                    <p>Current Week: {format(currentDate, 'yyyy-MM-dd')}</p>
                    <p>Local Availability Slots: {availability.reduce((total, day) => total + day.slots.length, 0)}</p>
                    <p>API Response Records: {availabilityResponse?.data?.length || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p>No nurse selected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityManagement;
