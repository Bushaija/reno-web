"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter, Search } from 'lucide-react';
import { useGetTimeOffRequests, type TimeOffRequestFilters } from '@/hooks/useTimeOffRequests';
import TimeOffRequestCard from '@/components/requests/time-off/TimeOffRequestCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTimeOffRequestDialog, UpdateTimeOffRequestDialog } from './components';
import { toast } from 'sonner';

export default function TimeOffPage() {
  const [filters, setFilters] = useState<TimeOffRequestFilters>({});
  const { data: requestsResponse, isLoading, error } = useGetTimeOffRequests(filters);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Off Requests</h1>
          <p className="text-muted-foreground">
            View and manage all time off requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setFilters({})}
            disabled={Object.keys(filters).length === 0}
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
          <CreateTimeOffRequestDialog 
            onSuccess={() => {
              // The hook will automatically refresh the data
              console.log("Time-off request created successfully!");
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  status: value === "all" ? undefined : [value] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Request Type</label>
              <Select 
                value={filters.request_type?.[0] || "all"} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  request_type: value === "all" ? undefined : [value] 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                  <SelectItem value="jury_duty">Jury Duty</SelectItem>
                  <SelectItem value="military">Military</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Nurse ID</label>
              <Input
                type="number"
                placeholder="Filter by nurse ID"
                value={filters.nurse_id || ""}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  nurse_id: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.start_date || ""}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  start_date: e.target.value || undefined 
                }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.end_date || ""}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  end_date: e.target.value || undefined 
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {(filters.status || filters.request_type || filters.nurse_id || filters.start_date || filters.end_date) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.status && filters.status.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {filters.status.join(', ')}
                </span>
              )}
              {filters.request_type && filters.request_type.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Type: {filters.request_type.join(', ')}
                </span>
              )}
              {filters.nurse_id && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Nurse ID: {filters.nurse_id}
                </span>
              )}
              {filters.start_date && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  From: {filters.start_date}
                </span>
              )}
              {filters.end_date && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  To: {filters.end_date}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Time Off Requests
            {requestsResponse?.data && (
              <span className="text-sm font-normal text-gray-500">
                {requestsResponse.data.length} request{requestsResponse.data.length !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
          {requestsResponse?.data && requestsResponse.data.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Quick Actions:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement bulk approve for pending requests
                  const pendingRequests = requestsResponse.data.filter(req => req.status === 'pending');
                  if (pendingRequests.length > 0) {
                    toast.info(`${pendingRequests.length} pending requests found`);
                  } else {
                    toast.info("No pending requests to approve");
                  }
                }}
              >
                Bulk Approve Pending
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading requests...</p>}
          {error && <p className="text-red-500">Error: {error instanceof Error ? error.message : String(error)}</p>}
          {!isLoading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requestsResponse?.data && requestsResponse.data.length > 0 ? (
                requestsResponse.data.map((request) => {
                  // Calculate days requested
                  const startDate = new Date(request.start_date);
                  const endDate = new Date(request.end_date);
                  const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  
                  // Create enhanced request object with computed properties
                  const enhancedRequest = {
                    ...request,
                    days_requested: daysRequested,
                    nurse: {
                      ...request.nurse,
                      user: {
                        user_id: request.nurse.worker_id, // Use worker_id as user_id
                        name: request.nurse.name,
                        email: request.nurse.email,
                      },
                      employee_id: request.nurse.employee_id,
                      specialization: request.nurse.specialization || '', // Convert null to empty string
                    }
                  };
                  
                  return (
                    <TimeOffRequestCard key={request.request_id} request={enhancedRequest as any} />
                  );
                })
              ) : (
                <p>No time off requests found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}