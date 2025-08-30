/**
 * @file A card component for displaying a single compliance statistic.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComplianceStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
  trend?: number;
  trendLabel?: string;
}

export function ComplianceStatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  trendLabel 
}: ComplianceStatCardProps) {
  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return <TrendingUp className="h-3 w-3" />;
    if (trendValue < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendVariant = (trendValue: number) => {
    if (trendValue > 0) return "default";
    if (trendValue < 0) return "destructive";
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
}
