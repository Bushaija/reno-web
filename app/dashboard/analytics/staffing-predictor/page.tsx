"use client"
import StaffingPredictorForm from "@/components/api-forms/staffing-predictor-form";

export default function StaffingPredictorPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Staffing Predictor</h1>
      <StaffingPredictorForm />
    </div>
  );
}