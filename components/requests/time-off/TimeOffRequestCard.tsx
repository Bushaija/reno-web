import React from 'react';
import { TimeOffRequest } from '@/types/requests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@ui/card';
import { Button } from '@ui/button';
import RequestStatusBadge from '@/components/requests/shared/RequestStatusBadge';
import { Calendar, User, MessageSquare } from 'lucide-react';

interface TimeOffRequestCardProps {
  request: TimeOffRequest;
}

const TimeOffRequestCard: React.FC<TimeOffRequestCardProps> = ({ request }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <Card key={request.request_id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg font-semibold">
          <span>{request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)} Leave</span>
          <RequestStatusBadge status={request.status} />
        </CardTitle>
        <CardDescription className="pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>{request.nurse.user.name} ({request.nurse.employee_id})</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{formatDate(request.start_date)} - {formatDate(request.end_date)}</span>
          <span className="ml-2 text-xs text-muted-foreground">({request.days_requested} days)</span>
        </div>
        <div className="flex items-start text-sm">
          <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground italic">{request.reason}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm">Details</Button>
        {request.status === 'pending' && (
          <Button size="sm">Take Action</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TimeOffRequestCard;
