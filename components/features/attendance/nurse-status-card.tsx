import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NurseStatusRecord, NurseStatus } from '@/types/attendance-status.types';
import { AlertTriangle, MessageCircle, ShieldAlert, User } from 'lucide-react';

interface NurseStatusCardProps {
  nurse: NurseStatusRecord;
  onSendMessage: (nurseId: string) => void;
  onViewSchedule: (nurseId: string) => void;
}

const statusStyles: Record<NurseStatus, string> = {
  PRESENT: 'bg-green-500 hover:bg-green-600',
  LATE: 'bg-yellow-500 hover:bg-yellow-600',
  ABSENT: 'bg-red-500 hover:bg-red-600',
  ON_BREAK: 'bg-blue-500 hover:bg-blue-600',
};

export const NurseStatusCard = ({ nurse, onSendMessage, onViewSchedule }: NurseStatusCardProps) => {
  const patientRatioPercentage = (nurse.patient_ratio.current / nurse.patient_ratio.max) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{nurse.department.name}</CardTitle>
        <Badge className={statusStyles[nurse.status]}>{nurse.status.replace('_', ' ')}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={nurse.avatar_url} alt={`${nurse.first_name} ${nurse.last_name}`} />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{`${nurse.first_name} ${nurse.last_name}`}</p>
            <p className="text-xs text-muted-foreground">ID: {nurse.nurse_id.substring(0, 8)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <div className="flex justify-between text-xs font-medium">
              <span>Patient Ratio</span>
              <span>{`${nurse.patient_ratio.current}/${nurse.patient_ratio.max}`}</span>
            </div>
            <Progress value={patientRatioPercentage} className="h-2 mt-1" />
          </div>

          {nurse.alerts.length > 0 && (
            <div className="space-y-1 pt-2">
              {nurse.alerts.map(alert => (
                <div key={alert.alert_id} className="flex items-center text-xs text-destructive">
                  {alert.type === 'OVERTIME' ? <AlertTriangle className="h-4 w-4 mr-1.5" /> : <ShieldAlert className="h-4 w-4 mr-1.5" />}
                  {alert.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onSendMessage(nurse.nurse_id)}>
            <MessageCircle className="h-4 w-4 mr-1.5" />
            Message
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onViewSchedule(nurse.nurse_id)}>
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
