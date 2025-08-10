export type AvailabilityStatus = 'available' | 'unavailable' | 'preferred';

export interface AvailabilitySlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AvailabilityStatus;
}

export interface NurseAvailability {
  nurseId: string;
  date: Date;
  slots: AvailabilitySlot[];
}

export interface Nurse {
  id: string;
  name: string;
  avatarUrl?: string;
  // Add other nurse details as needed
}
