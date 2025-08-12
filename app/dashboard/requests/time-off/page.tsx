"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, Filter } from 'lucide-react';
import { useTimeOffRequests } from '@/hooks/useTimeOffRequests';
import TimeOffRequestCard from '@/components/requests/time-off/TimeOffRequestCard';
import { RequestFilters, TimeOffRequest } from '@/types/requests';

export default function TimeOffPage() {
  const [filters, setFilters] = useState<RequestFilters>({});
  const { requests, loading: isLoading, error } = useTimeOffRequests(filters);

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
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button asChild>
            <Link href="/dashboard/requests/time-off/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading requests...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.length > 0 ? (
                requests.map((request: TimeOffRequest) => (
                  <TimeOffRequestCard key={request.request_id} request={request} />
                ))
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