"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ui/button';
import { PlusCircle, Users, Filter, RefreshCw } from 'lucide-react';
import { 
  useGetSwapRequests, 
  type SwapRequest, 
  type SwapRequestFilters 
} from '@/hooks';
import { ReusableDataTable } from '@/components/data-table/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function SwapsPage() {
  const [filters, setFilters] = useState<SwapRequestFilters>({
    page: 1,
    limit: 10,
  });

  const { data: requestsResponse, isLoading, error, refetch } = useGetSwapRequests(filters);

  const handlePaginationChange = (page: number, limit: number) => {
    setFilters(prev => ({ ...prev, page, limit }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleAdd = () => {
    // Navigate to create swap page
    window.location.href = '/dashboard/requests/swaps/create';
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting swap requests...');
  };

  // Define table columns
  const columns: ColumnDef<SwapRequest>[] = [
    {
      accessorKey: "swap_id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-sm">#{row.getValue("swap_id")}</span>,
    },
    {
      accessorKey: "requesting_nurse.name",
      header: "Requesting Nurse",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.requesting_nurse.name}</span>
          <span className="text-sm text-muted-foreground">{row.original.requesting_nurse.specialization || 'No specialization'}</span>
        </div>
      ),
    },
    {
      accessorKey: "target_nurse.name",
      header: "Target Nurse",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.target_nurse.name}</span>
          <span className="text-sm text-muted-foreground">{row.original.target_nurse.specialization || 'No specialization'}</span>
        </div>
      ),
    },
    {
      accessorKey: "swap_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.getValue("swap_type") === "full_shift" ? "default" : "secondary"}>
          {row.getValue("swap_type") === "full_shift" ? "Full Shift" : "Partial Shift"}
        </Badge>
      ),
    },
    {
      accessorKey: "original_shift.date",
      header: "Original Shift",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{format(new Date(row.original.original_shift.date), 'MMM dd, yyyy')}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.original_shift.start_time} - {row.original.original_shift.end_time}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "requested_shift.date",
      header: "Requested Shift",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{format(new Date(row.original.requested_shift.date), 'MMM dd, yyyy')}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.requested_shift.start_time} - {row.original.requested_shift.end_time}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusVariant = (status: string) => {
          switch (status) {
            case 'pending': return 'secondary';
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            case 'cancelled': return 'outline';
            case 'expired': return 'secondary';
            default: return 'outline';
          }
        };
        
        return (
          <Badge variant={getStatusVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "expires_at",
      header: "Expires",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.getValue("expires_at")), 'MMM dd, HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.getValue("created_at")), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              View
            </Button>
            {request.status === 'pending' && (
              <Button variant="outline" size="sm">
                Edit
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Swap Requests</h1>
            <p className="text-muted-foreground">
              View and manage all your shift swap requests.
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-destructive">Error Loading Swap Requests</h3>
            <p className="text-sm text-destructive/80 mt-2">{error instanceof Error ? error.message : String(error)}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

      <ReusableDataTable
        columns={columns}
        data={requestsResponse?.data || []}
        pagination={requestsResponse?.pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        searchPlaceholder="Search swap requests..."
        searchKey="requesting_nurse.name"
        title=""
        description=""
        onRefresh={handleRefresh}
        onExport={handleExport}
        onAdd={handleAdd}
        showActions={true}
      />
    </div>
  );
}