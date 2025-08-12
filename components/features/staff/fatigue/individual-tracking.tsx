import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Progress } from '@/components/ui/progress';
// import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Clock, Bed, TrendingUp, Briefcase } from 'lucide-react';
import { calculateFatigueScore, FatigueFactors } from '@/lib/fatigue-calculator';

const historyData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: 40 + Math.sin(i / 3) * 20 + Math.random() * 10,
}));

const mockNurseData: FatigueFactors = {
  shiftHoursLast7Days: 48,
  avgSleepPerNight: 6.2,
  consecutiveShifts: 5,
  selfReportedStress: 'high',
};

const IndividualTracking = () => {
  const fatigueScore = calculateFatigueScore(mockNurseData);

  const getProgressColor = (value: number) => {
    if (value > 70) return 'bg-red-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Fatigue Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a Nurse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nurse-1">Nurse Jackie</SelectItem>
            <SelectItem value="nurse-2">Nurse Ratched</SelectItem>
            <SelectItem value="nurse-3">Nurse Chapel</SelectItem>
          </SelectContent>
        </Select> */}

        <div>
          <h3 className="font-semibold">Fatigue Score: {fatigueScore}/100</h3>
          {/* <Progress value={fatigueScore} /> */}
          <div className="h-4 w-full rounded-full bg-secondary relative overflow-hidden">
            <div style={{ width: `${fatigueScore}%`}} className={`h-full ${getProgressColor(fatigueScore)}`}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fatigue History (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {/* <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer> */}
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-2">Contributing Factors</h3>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span><strong>Shift Hours:</strong> {mockNurseData.shiftHoursLast7Days} hours (last 7 days)</span>
            </li>
            <li className="flex items-center text-sm text-muted-foreground">
              <Bed className="h-4 w-4 mr-2 text-purple-500" />
              <span><strong>Avg. Sleep:</strong> {mockNurseData.avgSleepPerNight} hours/night</span>
            </li>
            <li className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              <span><strong>Stress Level:</strong> {mockNurseData.selfReportedStress.charAt(0).toUpperCase() + mockNurseData.selfReportedStress.slice(1)} (self-reported)</span>
            </li>
             <li className="flex items-center text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2 text-green-500" />
              <span><strong>Consecutive Shifts:</strong> {mockNurseData.consecutiveShifts} days</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualTracking;
