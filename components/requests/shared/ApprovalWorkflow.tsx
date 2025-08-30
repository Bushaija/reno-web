import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar,
  FileText,
  UserCheck,
  Filter
} from 'lucide-react';

interface PendingRequest {
  request_id: number;
  type: 'time_off' | 'swap';
  nurse: {
    name: string;
    employee_id: string;
    specialization: string;
    department: string;
    seniority_points: number;
  };
  details: {
    start_date: string;
    end_date: string;
    reason: string;
    request_type?: string;
    shift_info?: string;
  };
  submitted_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conflicts: string[];
  impact_assessment: {
    coverage_impact: 'low' | 'medium' | 'high';
    replacement_available: boolean;
    department_capacity: number;
  };
  auto_approval_eligible: boolean;
}

const ApprovalWorkflow: React.FC = () => {
  const [pendingRequests] = useState<PendingRequest[]>([
    {
      request_id: 1001,
      type: 'time_off',
      nurse: {
        name: 'Jane Smith',
        employee_id: 'RN001234',
        specialization: 'ICU',
        department: 'Critical Care',
        seniority_points: 150
      },
      details: {
        start_date: '2024-03-25',
        end_date: '2024-03-27',
        reason: 'Family wedding celebration',
        request_type: 'vacation'
      },
      submitted_at: '2024-03-15T10:00:00Z',
      priority: 'medium',
      conflicts: ['Weekend shift coverage needed'],
      impact_assessment: {
        coverage_impact: 'medium',
        replacement_available: true,
        department_capacity: 85
      },
      auto_approval_eligible: false
    },
    {
      request_id: 1002,
      type: 'time_off',
      nurse: {
        name: 'Robert Johnson',
        employee_id: 'RN005678',
        specialization: 'Emergency',
        department: 'Emergency',
        seniority_points: 95
      },
      details: {
        start_date: '2024-03-20',
        end_date: '2024-03-20',
        reason: 'Medical appointment',
        request_type: 'personal'
      },
      submitted_at: '2024-03-14T14:30:00Z',
      priority: 'low',
      conflicts: [],
      impact_assessment: {
        coverage_impact: 'low',
        replacement_available: true,
        department_capacity: 92
      },
      auto_approval_eligible: true
    }
  ]);

  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [approvalNotes, setApprovalNotes] = useState<Record<number, string>>({});
  const [bulkAction, setBulkAction] = useState('');
  const [filters, setFilters] = useState({
    priority: '',
    department: '',
    type: '',
    impact: ''
  });

  const handleSelectRequest = (requestId: number, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(pendingRequests.map(req => req.request_id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleIndividualAction = async (requestId: number, action: 'approve' | 'reject') => {
    const notes = approvalNotes[requestId] || '';
    
    try {
      console.log(`${action} request ${requestId} with notes: ${notes}`);
      // API call would go here
      // await updateRequest(requestId, { status: action === 'approve' ? 'approved' : 'rejected', admin_notes: notes });
      
      // Remove from pending list (optimistic update)
      // In real implementation, this would trigger a refetch
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRequests.length === 0) return;
    
    try {
      console.log(`Bulk ${bulkAction} for requests:`, selectedRequests);
      // API call for bulk actions would go here
      
      setSelectedRequests([]);
      setBulkAction('');
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const filteredRequests = pendingRequests.filter(request => {
    if (filters.priority && request.priority !== filters.priority) return false;
    if (filters.department && request.nurse.department !== filters.department) return false;
    if (filters.type && request.type !== filters.type) return false;
    if (filters.impact && request.impact_assessment.coverage_impact !== filters.impact) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approval Workflow</h2>
          <p className="text-muted-foreground">
            Review and approve pending requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pendingRequests.length} pending
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="filters">Filters & Bulk Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Bulk Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    <SelectItem value="Critical Care">Critical Care</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="time_off">Time Off</SelectItem>
                    <SelectItem value="swap">Shift Swap</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.impact} onValueChange={(value) => setFilters(prev => ({ ...prev, impact: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Impact Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Impact Levels</SelectItem>
                    <SelectItem value="low">Low Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="high">High Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedRequests.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedRequests.length} request(s) selected
                    </p>
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Bulk Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve All</SelectItem>
                        <SelectItem value="reject">Reject All</SelectItem>
                        <SelectItem value="delegate">Delegate to Senior Staff</SelectItem>
                        <SelectItem value="schedule_review">Schedule Review Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkAction} disabled={!bulkAction}>
                      Apply Action
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Checkbox
              checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select all ({filteredRequests.length} requests)
            </label>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedRequests.includes(request.request_id)}
                        onCheckedChange={(checked) => handleSelectRequest(request.request_id, checked as boolean)}
                      />
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {request.nurse.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {request.nurse.employee_id}
                          </Badge>
                          <span>{request.nurse.specialization}</span>
                          <span>•</span>
                          <span>{request.nurse.department}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority.toUpperCase()}
                      </Badge>
                      {request.auto_approval_eligible && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Auto-Eligible
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {formatDateRange(request.details.start_date, request.details.end_date)}
                        </span>
                      </div>
                      
                      {request.details.request_type && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{request.details.request_type}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Reason:</strong> {request.details.reason}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Coverage Impact: </span>
                        <span className={getImpactColor(request.impact_assessment.coverage_impact)}>
                          {request.impact_assessment.coverage_impact.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Replacement: </span>
                        <span className={request.impact_assessment.replacement_available ? 'text-green-600' : 'text-red-600'}>
                          {request.impact_assessment.replacement_available ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Dept. Capacity: </span>
                        <span className={request.impact_assessment.department_capacity >= 90 ? 'text-green-600' : 'text-yellow-600'}>
                          {request.impact_assessment.department_capacity}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conflicts */}
                  {request.conflicts.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Potential Conflicts:</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {request.conflicts.map((conflict, index) => (
                            <li key={index} className="text-sm">{conflict}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Notes (Optional)</label>
                    <Textarea
                      placeholder="Add notes for approval/rejection..."
                      value={approvalNotes[request.request_id] || ''}
                      onChange={(e) => setApprovalNotes(prev => ({
                        ...prev,
                        [request.request_id]: e.target.value
                      }))}
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleIndividualAction(request.request_id, 'approve')}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleIndividualAction(request.request_id, 'reject')}
                      className="flex-1"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Delegate
                    </Button>
                  </div>

                  {/* Auto-approval suggestion */}
                  {request.auto_approval_eligible && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        This request meets auto-approval criteria
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No pending requests match your current filters.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalWorkflow;