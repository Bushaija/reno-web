'use client';

/**
 * @file Defines the columns for the attendance data table.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table/components/data-table-column-header';
import { AttendanceRecord } from '@/types/attendance.types';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './attendance-table-row-actions';

export const columns: ColumnDef<AttendanceRecord>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'assignment_id', // Assuming nurse name is part of assignment
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nurse" />,
    cell: ({ row }) => <div>{`Nurse #${row.original.assignment_id}`}</div>, // Replace with actual nurse name
  },
  {
    accessorKey: 'scheduled_start',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => new Date(row.original.scheduled_start).toLocaleDateString(),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const variant: 'default' | 'secondary' | 'destructive' | 'outline' = 
        status === 'present' ? 'default' :
        status === 'late' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'scheduled_time',
    header: 'Scheduled Time',
    cell: ({ row }) => {
      const start = new Date(row.original.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const end = new Date(row.original.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${start} - ${end}`;
    }
  },
  {
    id: 'actual_time',
    header: 'Actual Time',
    cell: ({ row }) => {
      if (!row.original.clock_in_time) return 'N/A';
      const start = new Date(row.original.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const end = row.original.clock_out_time ? new Date(row.original.clock_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
      return `${start} - ${end}`;
    }
  },
  {
    accessorKey: 'overtime_minutes',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Overtime (min)" />,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
