'use client';

import React, { useState, useEffect } from 'react';
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Nurse, AvailabilitySlot, AvailabilityStatus, NurseAvailability } from '@/lib/types/availability';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNurseAvailability, saveNurseAvailability } from '@/lib/api/staff';

// Placeholder data - replace with API call
const nurses: Nurse[] = [
  { id: '1', name: 'Dr. Eleanor Vance' },
  { id: '2', name: 'Nurse Jackie Peyton' },
  { id: '3', name: 'Dr. John Carter' },
];

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 6; i <= 22; i++) {
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
  const [selectedNurseId, setSelectedNurseId] = useState<string | undefined>(nurses[0]?.id);
  const [viewedNurse, setViewedNurse] = useState<Nurse | undefined>(nurses[0]);
  const [availability, setAvailability] = useState<NurseAvailability[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSlots, setDraggedSlots] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStartsOn = 1; // Monday
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn });
  const days = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (!selectedNurseId) return;

    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const data = await getNurseAvailability(selectedNurseId, currentDate);
        setAvailability(prev => {
          const weekDates = days.map(d => format(d, 'yyyy-MM-dd'));
          const otherAvail = prev.filter(a => a.nurseId !== selectedNurseId || !weekDates.includes(format(a.date, 'yyyy-MM-dd')));
          return [...otherAvail, ...data];
        });
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedNurseId, currentDate]);

  const updateAndSaveAvailability = async (updatedData: NurseAvailability[]) => {
    if (!selectedNurseId) return;

    const previousAvailability = [...availability];
    setAvailability(updatedData);

    try {
      const weekDates = days.map(d => format(d, 'yyyy-MM-dd'));
      const weekAvailabilityToSave = updatedData.filter(a => 
        a.nurseId === selectedNurseId && weekDates.includes(format(a.date, 'yyyy-MM-dd'))
      );
      await saveNurseAvailability(selectedNurseId, weekAvailabilityToSave);
    } catch (error) {
      console.error('Failed to save availability', error);
      setAvailability(previousAvailability);
    }
  };

  const handleNurseSelection = (nurseId: string) => {
    setSelectedNurseId(nurseId);
    setViewedNurse(nurses.find(n => n.id === nurseId));
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
        const startTime = new Date(`${dateStr}T${time}`);
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
                  {nurses.map((nurse) => (
                    <option key={nurse.id} value={nurse.id}>
                      {nurse.name}
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
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                  <p>Loading...</p>
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
                      return (
                        <div
                          key={identifier}
                          className={`h-12 cursor-pointer transition-colors ${draggedSlots.has(identifier) ? 'bg-blue-300' : getStatusColor(slot?.status)}`}
                          onMouseDown={() => handleMouseDown(day, time)}
                          onMouseEnter={() => handleMouseEnter(day, time)}
                          onClick={() => handleSlotClick(day, time)}
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
              <div>
                <h3 className="font-semibold">{viewedNurse.name}</h3>
                <p className="text-sm text-gray-500">ID: {viewedNurse.id}</p>
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
