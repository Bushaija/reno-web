import { NurseAvailability, AvailabilityStatus } from '@/lib/types/availability';
import { format, addDays, startOfWeek } from 'date-fns';

// Mock database
let mockAvailability: NurseAvailability[] = [];

const generateInitialData = () => {
  const nurse1Id = '1'; // Dr. Eleanor Vance
  const today = new Date();
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });

  const availability: NurseAvailability[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfThisWeek, i);
    const dailySlots: { id: string, startTime: Date, endTime: Date, status: AvailabilityStatus }[] = [];

    // Simulate some initial availability
    if (i < 5) { // Weekdays
      for (let hour = 9; hour < 17; hour++) {
        if (Math.random() > 0.3) { // Randomly available slots
            const startTime = new Date(day);
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            dailySlots.push({
                id: `${nurse1Id}-${startTime.toISOString()}`,
                startTime,
                endTime,
                status: 'available'
            });
        }
      }
    }

    if (dailySlots.length > 0) {
        availability.push({
            nurseId: nurse1Id,
            date: day,
            slots: dailySlots
        });
    }
  }
  mockAvailability = availability;
};

generateInitialData();

export const getNurseAvailability = async (
  nurseId: string,
  week: Date
): Promise<NurseAvailability[]> => {
  console.log(`Fetching availability for nurse ${nurseId} for week of ${format(week, 'yyyy-MM-dd')}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  const weekDates = Array.from({ length: 7 }).map((_, i) => format(addDays(startOfWeek(week, { weekStartsOn: 1 }), i), 'yyyy-MM-dd'));

  return mockAvailability.filter(a => 
    a.nurseId === nurseId && weekDates.includes(format(a.date, 'yyyy-MM-dd'))
  );
};

export const saveNurseAvailability = async (
  nurseId: string,
  updatedAvailability: NurseAvailability[]
): Promise<void> => {
    console.log(`Saving availability for nurse ${nurseId}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const otherNursesAvailability = mockAvailability.filter(a => a.nurseId !== nurseId);
    const thisNurseOtherWeeks = mockAvailability.filter(a => {
        if (a.nurseId === nurseId) {
            const updatedDates = updatedAvailability.map(ua => format(ua.date, 'yyyy-MM-dd'));
            return !updatedDates.includes(format(a.date, 'yyyy-MM-dd'));
        }
        return false;
    });

    mockAvailability = [...otherNursesAvailability, ...thisNurseOtherWeeks, ...updatedAvailability];
    console.log('Saved availability:', mockAvailability);
};
