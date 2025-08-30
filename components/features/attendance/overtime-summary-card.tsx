import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OvertimeSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  progress?: number; // Value from 0 to 100
  trend?: number;
  trendLabel?: string;
}

export const OvertimeSummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  progress,
  trend,
  trendLabel,
}: OvertimeSummaryCardProps) => {
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-3 w-3" />;
    if (trendValue < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendVariant = (trendValue: number) => {
    if (trendValue > 0) return "destructive"; // Overtime increase is bad
    if (trendValue < 0) return "default"; // Overtime decrease is good
    return "secondary";
  };

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
        
        {trend !== undefined && trendLabel && (
          <div className="mt-2">
            <Badge 
              variant={getTrendVariant(trend)} 
              className="text-xs flex items-center gap-1"
            >
              {getTrendIcon(trend)}
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              <span className="text-xs opacity-75">{trendLabel}</span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
