/**
 * @file A card component for displaying a single compliance statistic.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ComplianceStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
}

export function ComplianceStatCard({ title, value, icon: Icon, description }: ComplianceStatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
