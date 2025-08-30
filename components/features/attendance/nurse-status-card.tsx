import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NurseStatusRecord } from '@/hooks/use-get-real-time-attendance';
import { AlertTriangle, MessageCircle, ShieldAlert, User, Clock, Users } from 'lucide-react';

interface NurseStatusCardProps {
  nurse: NurseStatusRecord;
  onSendMessage: (nurseId: string) => void;
  onViewSchedule: (nurseId: string) => void;
}

const statusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  PRESENT: { 
    bg: 'bg-green-500 hover:bg-green-600', 
    text: 'text-green-700',
    icon: <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  },
  LATE: { 
    bg: 'bg-yellow-500 hover:bg-yellow-600', 
    text: 'text-yellow-700',
    icon: <div className="w-2 h-2 bg-yellow-500 rounded-full" />
  },
  ABSENT: { 
    bg: 'bg-red-500 hover:bg-red-600', 
    text: 'text-red-700',
    icon: <div className="w-2 h-2 bg-red-500 rounded-full" />
  },
  ON_BREAK: { 
    bg: 'bg-blue-500 hover:bg-blue-600', 
    text: 'text-blue-700',
    icon: <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
  },
};

export const NurseStatusCard = ({ nurse, onSendMessage, onViewSchedule }: NurseStatusCardProps) => {
  const patientRatioPercentage = (nurse.patient_ratio.current / nurse.patient_ratio.max) * 100;
  const statusStyle = statusStyles[nurse.status] || statusStyles.PRESENT;
  
  // Format shift times
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Calculate shift duration
  const shiftStart = new Date(nurse.shift_start_time);
  const shiftEnd = new Date(nurse.shift_end_time);
  const shiftDuration = Math.round((shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60));

  return (
    <TooltipProvider>
      <Card className="w-full hover:shadow-md transition-shadow duration-200 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {nurse.department.name}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`${statusStyle.bg} text-white flex items-center gap-1.5`}>
                {statusStyle.icon}
                {nurse.status.replace('_', ' ')}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current status: {nurse.status.replace('_', ' ').toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Nurse Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-muted">
              <AvatarImage src={nurse.avatar_url} alt={`${nurse.first_name} ${nurse.last_name}`} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {nurse.first_name.charAt(0)}{nurse.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold truncate">
                {nurse.first_name} {nurse.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {nurse.nurse_id.substring(0, 8)}...
              </p>
            </div>
          </div>

          {/* Shift Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Shift
              </span>
              <span className="font-medium">
                {formatTime(nurse.shift_start_time)} - {formatTime(nurse.shift_end_time)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {shiftDuration} hour{shiftDuration !== 1 ? 's' : ''} shift
            </div>
          </div>

          {/* Patient Ratio */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Patient Load
              </span>
              <span className="font-medium">
                {nurse.patient_ratio.current}/{nurse.patient_ratio.max}
              </span>
            </div>
            <Progress 
              value={patientRatioPercentage} 
              className="h-2" 
              indicatorClassName={patientRatioPercentage > 80 ? 'bg-orange-500' : 'bg-green-500'}
            />
            <div className="text-xs text-muted-foreground text-center">
              {patientRatioPercentage.toFixed(0)}% capacity
            </div>
          </div>

          {/* Alerts */}
          {nurse.alerts.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground">Alerts</p>
              <div className="space-y-1.5">
                {nurse.alerts.map(alert => (
                  <div key={alert.alert_id} className="flex items-start gap-2 text-xs">
                    {alert.type === 'OVERTIME' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-muted-foreground leading-relaxed">
                      {alert.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={() => onSendMessage(nurse.nurse_id)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Message
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={() => onViewSchedule(nurse.nurse_id)}
            >
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
