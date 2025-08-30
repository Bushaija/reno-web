"use client";
// @ts-nocheck

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  generateScheduleSchema,
  GenerateScheduleFormValues,
} from "@/types/scheduling";
import { useAutoGenerateSchedule } from "@/features/scheduling/api/useAutoGenerateSchedule";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const defaultValues: GenerateScheduleFormValues = {
  start_date: "",
  end_date: "",
  departments: [],
  options: {
    balance_workload: true,
    respect_preferences: true,
    minimize_overtime: true,
    fair_rotation: true,
    max_consecutive_shifts: 3,
    min_days_off: 2,
  },
};

export default function AutoGenerateForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateScheduleFormValues>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues,
  });

  const { mutate: autoGenerate, isPending } = useAutoGenerateSchedule();

  const onSubmit = (data: GenerateScheduleFormValues) => {
    autoGenerate(data, {
      onSuccess: () => {
        toast.success("Schedule generation requested");
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input type="date" {...register("start_date")} />
          {errors.start_date && (
            <p className="text-xs text-red-500 mt-1">
              {errors.start_date.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input type="date" {...register("end_date")} />
          {errors.end_date && (
            <p className="text-xs text-red-500 mt-1">
              {errors.end_date.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Departments (IDs)</label>
        <Input
          placeholder="e.g. 1,2,3"
          {...register("departments", {
            setValueAs: (v) =>
              String(v)
                .split(",")
                .map((s) => parseInt(s.trim()))
                .filter(Boolean),
          })}
        />
        {errors.departments && (
          <p className="text-xs text-red-500 mt-1">
            {errors.departments.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(
          [
            { key: "balance_workload", label: "Balance workload" },
            { key: "respect_preferences", label: "Respect preferences" },
            { key: "minimize_overtime", label: "Minimize overtime" },
            { key: "fair_rotation", label: "Fair rotation" },
          ] as const
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 border-muted rounded"
              {...register(`options.${key}` as const)}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Max consecutive shifts</label>
          <Input
            type="number"
            min={1}
            max={7}
            {...register("options.max_consecutive_shifts", { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Min days off</label>
          <Input
            type="number"
            min={0}
            max={7}
            {...register("options.min_days_off", { valueAsNumber: true })}
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? "Generating…" : "Generate Schedule"}
      </Button>
    </form>
  );
}




