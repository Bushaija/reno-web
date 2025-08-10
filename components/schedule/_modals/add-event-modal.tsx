// @ts-nocheck
"use client";

// Temporary shim: re-export CreateShiftForm to replace legacy AddEventModal
import CreateShiftForm from "@/components/api-forms/create-shift-form";

export default function AddEventModal() {
  return <CreateShiftForm />;
}
