"use client";
// @ts-nocheck
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Nurse } from "./nurse.types";

const formatEmployment = (e: string) => e.replace("_", " ");

interface NurseColumnsProps {
  onView?: (nurse: Nurse) => void;
}

export const createNurseColumns = ({ onView }: NurseColumnsProps = {}): ColumnDef<Nurse>[] => [
  {
    accessorKey: "worker_id",
    header: "ID",
  },
  {
    accessorKey: "user.name",
    id: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Name <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => row.original.user.name,
  },
  {
    accessorKey: "user.email",
    id: "email",
    header: "Email",
    cell: ({ row }) => row.original.user.email,
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    accessorKey: "employment_type",
    header: "Employment",
    cell: ({ row }) => formatEmployment(row.getValue("employment_type")),
  },
  {
    accessorKey: "fatigue_score",
    header: "Fatigue",
    cell: ({ row }) => (
      <Badge>{row.getValue("fatigue_score") ?? "-"}</Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const nurse = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(nurse)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


