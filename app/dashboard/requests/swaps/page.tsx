"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { PlusCircle, Users, Filter } from 'lucide-react';
import { useSwapRequests } from '@/hooks/useTimeOffRequests';
import SwapRequestCard from '@/components/requests/swaps/SwapRequestCard';
import { RequestFilters, SwapRequest } from '@/types/requests';

export default function SwapsPage() {
  const [filters, setFilters] = useState<RequestFilters>({});
  const { swapRequests: requests, loading: isLoading, error } = useSwapRequests(filters);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Swap Requests</h1>
          <p className="text-muted-foreground">
            View and manage all your shift swap requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button asChild>
            <Link href="/dashboard/requests/swaps/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Swap
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/requests/opportunities">
              <Users className="mr-2 h-4 w-4" />
              Marketplace
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Swap Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading requests...</p>}
          {error && <p className="text-destructive">Error loading requests: {error}</p>}
          {!isLoading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.length > 0 ? (
                requests.map((request: SwapRequest) => (
                  <SwapRequestCard key={request.swap_id} request={request} />
                ))
              ) : (
                <p>No swap requests found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}