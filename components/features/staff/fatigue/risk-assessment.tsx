import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Edit, UserCheck } from 'lucide-react';
import { calculateFatigueScore, FatigueFactors } from '@/lib/fatigue-calculator';
import { getRecommendations } from '@/lib/intervention-recommender';

const mockNurseData: FatigueFactors = {
  shiftHoursLast7Days: 48,
  avgSleepPerNight: 6.2,
  consecutiveShifts: 5,
  selfReportedStress: 'high',
};

const RiskAssessment = () => {
  const score = calculateFatigueScore(mockNurseData);
  const recommendations = getRecommendations(score);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment & Interventions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold flex items-center"><Shield className="h-5 w-5 mr-2" />Intervention Recommendations</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec.text}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
            <Button className="w-full justify-start pl-4">
                <Edit className="h-4 w-4 mr-2" />
                Fatigue Self-Assessment
            </Button>
            <Button variant="outline" className="w-full justify-start pl-4">
                <UserCheck className="h-4 w-4 mr-2" />
                Manager Assignment Override
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessment;
