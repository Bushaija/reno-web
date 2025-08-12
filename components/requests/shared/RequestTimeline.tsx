import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, User, Calendar } from 'lucide-react';

interface TimelineEvent {
  id: number;
  status: 'submitted' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  timestamp: string;
  actor?: string;
  notes?: string;
  automated?: boolean;
}

interface RequestTimelineProps {
  requestId: number;
  currentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestType: 'vacation' | 'sick' | 'personal' | 'family' | 'swap';
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
  events?: TimelineEvent[];
}

const RequestTimeline: React.FC<RequestTimelineProps> = ({
  requestId,
  currentStatus,
  requestType,
  submittedAt,
  approvedAt,
  rejectedAt,
  adminNotes,
  events = []
}) => {
  // Generate timeline events based on request data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const timelineEvents: TimelineEvent[] = [
      {
        id: 1,
        status: 'submitted',
        timestamp: submittedAt,
        notes: 'Request submitted by employee'
      }
    ];

    // Add review event for pending requests
    if (currentStatus === 'pending') {
      timelineEvents.push({
        id: 2,
        status: 'pending',
        timestamp: submittedAt,
        notes: 'Under review by management',
        automated: true
      });
    }

    // Add approval/rejection events
    if (currentStatus === 'approved' && approvedAt) {
      timelineEvents.push({
        id: 2,
        status: 'approved',
        timestamp: approvedAt,
        actor: 'Sarah Manager',
        notes: adminNotes || 'Request approved'
      });
    }

    if (currentStatus === 'rejected' && rejectedAt) {
      timelineEvents.push({
        id: 2,
        status: 'rejected',
        timestamp: rejectedAt,
        actor: 'Sarah Manager',
        notes: adminNotes || 'Request rejected'
      });
    }

    // Merge with custom events if provided
    return [...timelineEvents, ...events].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const timelineEvents = generateTimelineEvents();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'family':
        return 'bg-green-100 text-green-800';
      case 'swap':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Request Timeline</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getRequestTypeColor(requestType)}>
              {requestType.charAt(0).toUpperCase() + requestType.slice(1)}
            </Badge>
            <Badge className={getStatusColor(currentStatus)}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => {
            const { date, time } = formatTimestamp(event.timestamp);
            const isLast = index === timelineEvents.length - 1;
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {!isLast && (
                  <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center shadow-sm">
                    {getStatusIcon(event.status)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </h4>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{date}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </div>
                    
                    {event.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.notes}
                      </p>
                    )}
                    
                    {event.actor && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>by {event.actor}</span>
                        {event.automated && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Automated
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        {currentStatus === 'pending' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm">Review in Progress</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Your request is being reviewed. You'll receive a notification once a decision is made.
                  Typical review time is 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStatus === 'approved' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 text-sm">Request Approved</h4>
                <p className="text-green-700 text-sm mt-1">
                  Your time off request has been approved. Please ensure proper handover of responsibilities.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStatus === 'rejected' && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 text-sm">Request Rejected</h4>
                <p className="text-red-700 text-sm mt-1">
                  Your request was not approved. Please contact your supervisor for more information or to discuss alternatives.
                </p>
                {adminNotes && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p className="text-sm font-medium">Manager Notes:</p>
                    <p className="text-sm">{adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestTimeline;