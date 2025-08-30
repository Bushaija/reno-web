"use client";
// @ts-nocheck

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useBulkCreateShifts } from "@/features/scheduling/api/useBulkCreateShifts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { BulkCreateShiftsDTO, ShiftType } from "@/types/scheduling";

// ---------------------------------------
// Schema & Types
// ---------------------------------------

const shiftTypeEnum = z.enum([
  "day",
  "night",
  "evening",
  "weekend",
  "holiday",
  "on_call",
  "float",
]);

const timeSlotSchema = z.object({
  start_time: z.string().min(4, "Start time required"), // HH:mm
  shift_type: shiftTypeEnum,
});

const bulkSchema = z.object({
  department_id: z.string().min(1, "Dept ID required"),
  required_nurses: z.number().min(1),
  duration_hours: z.number().min(1),
  date_range: z.object({
    start_date: z.string().min(10, "Start date required"),
    end_date: z.string().min(10, "End date required"),
  }),
  time_slots: z.array(timeSlotSchema).min(1),
  skip_dates: z.string().optional(), // comma-separated dates
});

export type BulkFormValues = z.infer<typeof bulkSchema>;

const defaultValues: BulkFormValues = {
  department_id: "",
  required_nurses: 4,
  duration_hours: 12,
  date_range: {
    start_date: "",
    end_date: "",
  },
  time_slots: [
    { start_time: "07:00:00", shift_type: "day" },
    { start_time: "19:00:00", shift_type: "night" },
  ],
  skip_dates: "",
};

// ---------------------------------------
// UI Component
// ---------------------------------------

export default function BulkCreatePage() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BulkFormValues>({
    resolver: zodResolver(bulkSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "time_slots",
  });

  const { mutate: bulkCreate, isPending } = useBulkCreateShifts();

  const onSubmit = (values: BulkFormValues) => {
    // Transform into DTO expected by API
    const dto: BulkCreateShiftsDTO = {
      template: {
        department_id: parseInt(values.department_id, 10),
        shift_type: "day" as ShiftType, // default
        required_nurses: values.required_nurses,
        duration_hours: values.duration_hours,
        required_skills: [],
      },
      date_range: {
        start_date: values.date_range.start_date,
        end_date: values.date_range.end_date,
      },
      time_slots: values.time_slots,
      skip_dates: values.skip_dates
        ? values.skip_dates.split(",").map((d) => d.trim())
        : undefined,
    };

    bulkCreate(dto, {
      onSuccess: (res) => toast.success(res.message),
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Shift Creation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quickly create recurring shifts across a date range using templates.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Template fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department ID</label>
                <Input type="number" {...register("department_id")} />
                {errors.department_id && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.department_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Required nurses per shift
                </label>
                <Input
                  type="number"
                  min={1}
                  {...register("required_nurses", { valueAsNumber: true })}
                />
                {errors.required_nurses && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.required_nurses.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shift duration (hours)
                </label>
                <Input
                  type="number"
                  min={1}
                  {...register("duration_hours", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start date</label>
                <Input type="date" {...register("date_range.start_date")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End date</label>
                <Input type="date" {...register("date_range.end_date")} />
              </div>
            </div>

            {/* Time slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Time slots</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ start_time: "07:00:00", shift_type: "day" })}
                >
                  + Add Slot
                </Button>
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start time (HH:mm:ss)
                    </label>
                    <Input
                      placeholder="07:00:00"
                      {...register(`time_slots.${index}.start_time` as const)}
                    />
                    {errors.time_slots?.[index]?.start_time && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.time_slots[index]?.start_time?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Shift type
                    </label>
                    <Select
                      onValueChange={(val: string) =>
                        setValue(`time_slots.${index}.shift_type`, val as any)
                      }
                      value={field.shift_type}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {shiftTypeEnum.options.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      type="button"
                      className="text-red-500"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Skip dates */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Skip dates (comma-separated YYYY-MM-DD)
              </label>
              <Input placeholder="2024-03-17, 2024-03-24" {...register("skip_dates")} />
            </div>

            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending ? "Creating…" : "Create Shifts"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}