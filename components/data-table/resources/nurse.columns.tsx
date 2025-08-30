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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { useAssignShift } from "@/features/shifts/api/useAssignShift";
import { useAllShifts } from "@/features/shifts/api";

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
      const [open, setOpen] = React.useState(false);
      const [shiftId, setShiftId] = React.useState<number | ''>('');
      const [isPrimary, setIsPrimary] = React.useState(false);
      const [patientLoad, setPatientLoad] = React.useState<number | ''>('');
      const [overrideWarnings, setOverrideWarnings] = React.useState(false);
      const assignShift = useAssignShift();
      const { data: allShifts = [], isLoading: loadingShifts } = useAllShifts();

      const handleSubmit = () => {
        if (!shiftId || !patientLoad) return; // simple guard
        assignShift.mutate({
          shiftId: Number(shiftId),
          nurseId: nurse.worker_id,
          isPrimary,
          patientLoad: Number(patientLoad),
          overrideWarnings,
        }, {
          onSuccess: () => {
            setOpen(false);
            setShiftId('');
            setIsPrimary(false);
            setPatientLoad('');
            setOverrideWarnings(false);
          },
        });
      };
      return (
        <>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Assign Shift
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Shift</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor={`shift-${nurse.worker_id}`}>Select Shift (start - end)</Label>
                  <select
                    id={`shift-${nurse.worker_id}`}
                    className="border rounded px-3 py-2"
                    value={shiftId === '' ? '' : String(shiftId)}
                    onChange={(e) => setShiftId(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={loadingShifts}
                  >
                    <option value="">{loadingShifts ? 'Loading shifts...' : 'Choose a shift'}</option>
                    {allShifts?.map((s: any) => (
                      <option key={s.shiftId} value={s.shiftId}>
                        {s.startTime} - {s.endTime}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id={`primary-${nurse.worker_id}`} checked={isPrimary} onCheckedChange={(v) => setIsPrimary(Boolean(v))} />
                  <Label htmlFor={`primary-${nurse.worker_id}`}>Primary Assignment</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`load-${nurse.worker_id}`}>Patient Load</Label>
                  <Input
                    id={`load-${nurse.worker_id}`}
                    type="number"
                    value={patientLoad}
                    onChange={(e) => setPatientLoad(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={"1"}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id={`override-${nurse.worker_id}`} checked={overrideWarnings} onCheckedChange={(v) => setOverrideWarnings(Boolean(v))} />
                  <Label htmlFor={`override-${nurse.worker_id}`}>Override Warnings</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={assignShift.isPending || !shiftId || !patientLoad}>
                  {assignShift.isPending ? 'Assigning...' : 'Assign'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];


