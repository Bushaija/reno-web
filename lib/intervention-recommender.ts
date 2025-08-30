export interface Recommendation {
  level: 'High' | 'Medium' | 'Low';
  text: string;
}

const ALL_RECOMMENDATIONS: Recommendation[] = [
  { level: 'High', text: 'Mandatory rest period of at least 10 hours before next shift.' },
  { level: 'High', text: 'Re-assign to non-patient-facing duties for the remainder of the shift.' },
  { level: 'High', text: 'Manager check-in required to discuss workload.' },
  { level: 'Medium', text: 'Assign an additional 15-minute break.' },
  { level: 'Medium', text: 'Ensure nurse takes their full meal break.' },
  { level: 'Medium', text: 'Pair with a support nurse for high-acuity tasks.' },
  { level: 'Low', text: 'Encourage a short walk or stretching session.' },
  { level: 'Low', text: 'Promote hydration and a healthy snack.' },
];

export const getRecommendations = (score: number): Recommendation[] => {
  if (score > 70) {
    return ALL_RECOMMENDATIONS.filter(r => r.level === 'High');
  }
  if (score > 30) {
    return ALL_RECOMMENDATIONS.filter(r => r.level === 'Medium');
  }
  return ALL_RECOMMENDATIONS.filter(r => r.level === 'Low');
};
