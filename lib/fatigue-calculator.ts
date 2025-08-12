export interface FatigueFactors {
  shiftHoursLast7Days: number;
  avgSleepPerNight: number;
  consecutiveShifts: number;
  selfReportedStress: 'low' | 'medium' | 'high';
}

const WEIGHTS = {
  shiftHours: 0.4,
  sleep: 0.3,
  consecutiveShifts: 0.2,
  stress: 0.1,
};

const MAX_VALUES = {
  shiftHours: 84, // Max reasonable hours in a week
  sleep: 4,       // Deficit from 8 hours recommended
  consecutiveShifts: 7, // Max consecutive shifts
  stress: 2, // high = 2, medium = 1, low = 0
};

const stressToNumeric = (level: 'low' | 'medium' | 'high'): number => {
    if (level === 'high') return 2;
    if (level === 'medium') return 1;
    return 0;
}

export const calculateFatigueScore = (factors: FatigueFactors): number => {
  const normalizedShiftHours = (factors.shiftHoursLast7Days / MAX_VALUES.shiftHours) * 100;
  const sleepDeficit = Math.max(0, 8 - factors.avgSleepPerNight);
  const normalizedSleep = (sleepDeficit / MAX_VALUES.sleep) * 100;
  const normalizedConsecutiveShifts = (factors.consecutiveShifts / MAX_VALUES.consecutiveShifts) * 100;
  const normalizedStress = (stressToNumeric(factors.selfReportedStress) / MAX_VALUES.stress) * 100;

  const score =
    normalizedShiftHours * WEIGHTS.shiftHours +
    normalizedSleep * WEIGHTS.sleep +
    normalizedConsecutiveShifts * WEIGHTS.consecutiveShifts +
    normalizedStress * WEIGHTS.stress;

  return Math.min(100, Math.round(score));
};
