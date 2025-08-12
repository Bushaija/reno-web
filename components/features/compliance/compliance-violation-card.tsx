/**
 * @file A card component to display a single compliance violation.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { ComplianceViolation, ComplianceSeverity } from '@/types/compliance.types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComplianceViolationCardProps {
  violation: ComplianceViolation;
  onResolve: (violationId: string) => void;
}

const severityStyles: Record<ComplianceSeverity, string> = {
  critical: 'border-red-500 bg-red-50',
  high: 'border-orange-500 bg-orange-50',
  medium: 'border-yellow-500 bg-yellow-50',
  low: 'border-blue-500 bg-blue-50',
};

export function ComplianceViolationCard({ violation, onResolve }: ComplianceViolationCardProps) {
  return (
    <Card className={cn('w-full', severityStyles[violation.severity])}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{violation.violation_type}</span>
          <Badge variant={violation.status === 'resolved' ? 'default' : 'destructive'}>
            {violation.status.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm"><strong>Nurse:</strong> {`Nurse #${violation.nurse_id}`}</p>
        <p className="text-sm"><strong>Date:</strong> {new Date(violation.timestamp).toLocaleDateString()}</p>
        <p className="text-sm text-muted-foreground">{violation.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm">View Details</Button>
        {violation.status !== 'resolved' && (
          <Button size="sm" onClick={() => onResolve(violation.violation_id)}>
            Mark as Resolved
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
