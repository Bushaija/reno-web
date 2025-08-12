import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { LucideIcon } from 'lucide-react';

interface OvertimeSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  progress?: number; // Value from 0 to 100
}

export const OvertimeSummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  progress,
}: OvertimeSummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {progress !== undefined && (
          <Progress value={progress} className="mt-2" />
        )}
      </CardContent>
    </Card>
  );
};
