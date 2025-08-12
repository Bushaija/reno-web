import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { SwapRequest } from '../../../types/requests';
import RequestStatusBadge from '../shared/RequestStatusBadge';

interface SwapRequestCardProps {
  request: SwapRequest;
}

const SwapRequestCard: React.FC<SwapRequestCardProps> = ({ request }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Swap Request</CardTitle>
          <RequestStatusBadge status={request.status} />
        </div>
        <CardDescription>
          Requested by {request.requesting_nurse.user.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Original Shift</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(request.original_shift.start_time)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatTime(request.original_shift.start_time)} - {formatTime(request.original_shift.end_time)}</span>
          </div>
        </div>
        
        {request.requested_shift && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Requested Shift</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(request.requested_shift.start_time)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTime(request.requested_shift.start_time)} - {formatTime(request.requested_shift.end_time)}</span>
            </div>
          </div>
        )}

        {request.target_nurse && (
          <div>
            <h4 className="font-semibold text-sm">Target Nurse</h4>
            <p className="text-sm text-muted-foreground">{request.target_nurse.user.name}</p>
          </div>
        )}

        <Badge variant="outline">{request.swap_type.replace('_', ' ')}</Badge>

      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Details <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SwapRequestCard;
