"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Workload = {
  id: string;
  name: string;
  specialization: string;
  hoursWorked: number;
  overtime: number;
  shifts: number;
  patientRatio: number;
  balanceScore: number;
  status: "overworked" | "balanced" | "underutilized";
};

const statusVariantMap: Record<Workload["status"], "destructive" | "default" | "secondary"> = {
    overworked: "destructive",
    balanced: "default",
    underutilized: "secondary",
}

export const columns: ColumnDef<Workload>[] = [
  {
    accessorKey: "name",
    header: "Nurse",
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    accessorKey: "hoursWorked",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Hours Worked
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "overtime",
    header: "Overtime",
  },
  {
    accessorKey: "shifts",
    header: "Shifts",
  },
  {
    accessorKey: "patientRatio",
    header: "Patient Ratio",
  },
  {
    accessorKey: "balanceScore",
    header: "Balance Score",
    cell: ({ row }) => {
        const score = parseFloat(row.getValue("balanceScore"));
        return <div className="font-medium">{score}%</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as Workload["status"];
        return <Badge variant={statusVariantMap[status]}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const workload = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(workload.id)}
            >
              Copy nurse ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Suggest shift swap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
