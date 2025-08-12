import React from 'react';
import { TimeOffRequest } from '@/types/requests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@ui/card';
import { Button } from '@ui/button';
import RequestStatusBadge from '@/components/requests/shared/RequestStatusBadge';
import { Calendar, User, MessageSquare } from 'lucide-react';
import { UpdateTimeOffRequestDialog } from '@/app/dashboard/requests/time-off/components';

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
          <div className="flex items-center gap-2">
            <RequestStatusBadge status={request.status} />
            {request.status === 'pending' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                ⏳ Requires Action
              </span>
            )}
          </div>
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
        <UpdateTimeOffRequestDialog 
          request={request}
          onSuccess={() => {
            // The hook will automatically refresh data
            console.log("Time-off request updated successfully!");
          }}
          trigger={
            <Button size="sm" variant={request.status === 'pending' ? 'default' : 'outline'}>
              {request.status === 'pending' ? 'Take Action' : 'Update Status'}
            </Button>
          }
        />
      </CardFooter>
    </Card>
  );
};

export default TimeOffRequestCard;
