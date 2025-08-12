import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users } from 'lucide-react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';

const riskLevels = [
  { title: 'High Risk', count: 12, icon: <AlertCircle className="h-6 w-6 text-red-500" /> },
  { title: 'Medium Risk', count: 34, icon: <AlertCircle className="h-6 w-6 text-yellow-500" /> },
  { title: 'Low Risk', count: 78, icon: <Users className="h-6 w-6 text-green-500" /> },
];

const chartData = [
  { name: 'High Risk', value: 12 },
  { name: 'Medium Risk', value: 34 },
  { name: 'Low Risk', value: 78 },
];

const COLORS = ['#EF4444', '#FBBF24', '#22C55E'];

const highRiskAlerts = [
  { name: 'Nurse Alex', score: 92, time: '5m ago' },
  { name: 'Nurse Ben', score: 85, time: '30m ago' },
  { name: 'Nurse Casey', score: 78, time: '1h ago' },
];

const FatigueOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatigue Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nurses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
            </CardContent>
          </Card>
        </div>
        {riskLevels.map((risk) => (
          <div key={risk.title} className="md:col-span-1 lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{risk.title}</CardTitle>
                {risk.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{risk.count}</div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div className="md:col-span-2 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer> */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <h3 className="font-semibold mb-2">Recent High-Risk Alerts</h3>
          <div className="space-y-2">
            {highRiskAlerts.map((alert) => (
              <div key={alert.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <p className="font-medium">{alert.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Score: {alert.score}</Badge>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FatigueOverview;
