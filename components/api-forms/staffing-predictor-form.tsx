"use client";
// @ts-nocheck
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePredictStaffing } from "@/features/scheduling/api/usePredictStaffing";
import { toast } from "sonner";

const formSchema = z.object({
  department_id: z.coerce.number().int().positive(),
  prediction_date: z.string().min(10, "Date required"),
  shift_type: z.enum(["day", "night", "evening"]).default("day"),
  expected_patient_count: z.coerce.number().int().positive(),
  expected_acuity: z.enum(["low", "medium", "high"]).default("medium"),
});

export type StaffingPredictorFormValues = z.infer<typeof formSchema>;

const defaultValues: StaffingPredictorFormValues = {
  department_id: 1,
  prediction_date: new Date().toISOString().slice(0, 10),
  shift_type: "day",
  expected_patient_count: 0,
  expected_acuity: "medium",
};

export default function StaffingPredictorForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<StaffingPredictorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { mutateAsync: predict, isPending } = usePredictStaffing();
  const [result, setResult] = useState<any | null>(null);

  const onSubmit = async (values: StaffingPredictorFormValues) => {
    try {
      const res = await predict(values);
      setResult(res.data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Prediction Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 text-sm font-medium">
                <span>Department ID</span>
                <Input type="number" {...register("department_id")} />
                {errors.department_id && (
                  <span className="text-xs text-red-500">
                    {errors.department_id.message}
                  </span>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium">
                <span>Prediction Date</span>
                <Input type="date" {...register("prediction_date")} />
                {errors.prediction_date && (
                  <span className="text-xs text-red-500">
                    {errors.prediction_date.message}
                  </span>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1 text-sm font-medium">
                <span>Shift Type</span>
                <Select value={watch("shift_type")} onValueChange={(v)=>control.setValue("shift_type", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["day", "night", "evening"] as const).map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shift_type && (
                  <span className="text-xs text-red-500">
                    {errors.shift_type.message}
                  </span>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium">
                <span>Expected Patient Count</span>
                <Input type="number" {...register("expected_patient_count")} />
                {errors.expected_patient_count && (
                  <span className="text-xs text-red-500">
                    {errors.expected_patient_count.message}
                  </span>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium">
                <span>Expected Acuity</span>
                <Select value={watch("expected_acuity")} onValueChange={(v)=>control.setValue("expected_acuity", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["low", "medium", "high"] as const).map((value) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.expected_acuity && (
                  <span className="text-xs text-red-500">
                    {errors.expected_acuity.message}
                  </span>
                )}
              </label>
            </div>
            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending ? "Predicting…" : "Predict Staffing"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Prediction Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <span className="font-semibold">Required Nurses: </span>
                {result.required_nurses}
              </p>
              <p>
                <span className="font-semibold">Confidence Score: </span>
                {(result.confidence_score * 100).toFixed(1)}%
              </p>
            </div>
            {result.risk_indicators?.length ? (
              <div>
                <h4 className="font-semibold mb-2">Risk Indicators</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.risk_indicators.map((ri: any, idx: number) => (
                    <li key={idx}>
                      {ri.label}: <span className="italic">{ri.level}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {result.notes && (
              <p className="text-muted-foreground text-sm">{result.notes}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
