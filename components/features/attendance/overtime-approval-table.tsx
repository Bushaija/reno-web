'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { ReusableDataTable as DataTable } from '@/components/data-table/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OvertimeRecord, OvertimeStatus } from '@/types/overtime.types';

// Mock handler functions
const handleApprove = (recordId: string) => {
  console.log(`Approving overtime record: ${recordId}`);
  // In a real app, this would trigger a mutation
};

const handleReject = (recordId: string) => {
  console.log(`Rejecting overtime record: ${recordId}`);
  // In a real app, this would trigger a mutation
};

const getStatusBadgeVariant = (status: OvertimeStatus) => {
  switch (status) {
    case 'APPROVED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    case 'PENDING':
    default:
      return 'secondary';
  }
};

export const columns: ColumnDef<OvertimeRecord>[] = [
  {
    accessorKey: 'nurse_name',
    header: 'Nurse',
  },
  {
    accessorKey: 'department_name',
    header: 'Department',
  },
  {
    accessorKey: 'overtime_hours',
    header: 'Hours',
    cell: ({ row }) => `${row.original.overtime_hours.toFixed(1)}h`,
  },
  {
    accessorKey: 'submitted_at',
    header: 'Submitted',
    cell: ({ row }) => new Date(row.original.submitted_at).toLocaleDateString(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>{row.original.status}</Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const record = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleApprove(record.record_id)}>Approve</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReject(record.record_id)}>Reject</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface OvertimeApprovalTableProps {
  data: OvertimeRecord[];
}

export const OvertimeApprovalTable = ({ data }: OvertimeApprovalTableProps) => {
  return <DataTable columns={columns} data={data} />;
};
