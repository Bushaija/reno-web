/* eslint-disable */
// @ts-nocheck
"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useCreateNurse } from "@/features/nurses/api"

const nurseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
  employee_id: z.string().min(1, "Employee ID is required"),
  specialization: z.string().min(1, "Specialization is required"),
  license_number: z.string().min(1, "License number is required"),
  employment_type: z.enum(["full_time", "part_time", "per_diem"]),
  base_hourly_rate: z.string().min(1, "Rate is required"),
  max_hours_per_week: z.string().min(1, "Max hours is required"),
  prefers_day_shifts: z.boolean().default(false).optional(),
  prefers_night_shifts: z.boolean().default(false).optional(),
  weekend_availability: z.boolean().default(false).optional(),
})

export type NurseFormData = z.infer<typeof nurseFormSchema>

interface NurseFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<NurseFormData>
  mode?: "create" | "edit"
}

export function NurseForm({ onSuccess, onCancel, initialData, mode = "create" }: NurseFormProps) {
  const createNurse = useCreateNurse()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NurseFormData>({
    resolver: zodResolver(nurseFormSchema) as any,
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      employee_id: "",
      specialization: "",
      license_number: "",
      employment_type: "full_time",
      base_hourly_rate: "",
      max_hours_per_week: "",
      prefers_day_shifts: false,
      prefers_night_shifts: false,
      weekend_availability: false,
    },
  })

  const onSubmit = async (data: NurseFormData) => {
    try {
      const payload = {
        user: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
        },
        employee_id: data.employee_id,
        specialization: data.specialization,
        license_number: data.license_number,
        employment_type: data.employment_type,
        base_hourly_rate: parseFloat(data.base_hourly_rate),
        max_hours_per_week: parseFloat(data.max_hours_per_week),
        preferences: {
          prefers_day_shifts: data.prefers_day_shifts,
          prefers_night_shifts: data.prefers_night_shifts,
          weekend_availability: data.weekend_availability,
        }
      }

      if (mode === "create") {
        await createNurse.mutateAsync(payload)
        toast.success("Nurse created successfully")
      }
      // TODO: implement edit functionality
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save nurse:", error)
      toast.error("Failed to save nurse")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" placeholder="John Smith" {...register("name")} className={errors.name ? "border-red-500" : ""} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="john.smith@hospital.com" {...register("email")} className={errors.email ? "border-red-500" : ""} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" placeholder="+1-555-0123" {...register("phone")} className={errors.phone ? "border-red-500" : ""} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
            <Input id="emergency_contact_name" {...register("emergency_contact_name")} placeholder="Jane Smith" className={errors.emergency_contact_name ? "border-red-500" : ""} />
            {errors.emergency_contact_name && <p className="text-sm text-red-500">{errors.emergency_contact_name.message}</p>}
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
            <Input id="emergency_contact_phone" {...register("emergency_contact_phone")} placeholder="+1-555-0456" className={errors.emergency_contact_phone ? "border-red-500" : ""} />
            {errors.emergency_contact_phone && <p className="text-sm text-red-500">{errors.emergency_contact_phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Employment details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employment Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee ID *</Label>
            <Input id="employee_id" placeholder="RN002345" {...register("employee_id")} className={errors.employee_id ? "border-red-500" : ""} />
            {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization *</Label>
            <Input id="specialization" placeholder="Emergency" {...register("specialization")} className={errors.specialization ? "border-red-500" : ""} />
            {errors.specialization && <p className="text-sm text-red-500">{errors.specialization.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="license_number">License Number *</Label>
            <Input id="license_number" placeholder="RN987654321" {...register("license_number")} className={errors.license_number ? "border-red-500" : ""} />
            {errors.license_number && <p className="text-sm text-red-500">{errors.license_number.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type *</Label>
            <Select value={watch("employment_type")} onValueChange={(val: "full_time" | "part_time" | "per_diem") => setValue("employment_type", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="per_diem">Per Diem</SelectItem>
              </SelectContent>
            </Select>
            {errors.employment_type && <p className="text-sm text-red-500">{errors.employment_type.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_hourly_rate">Base Hourly Rate *</Label>
            <Input id="base_hourly_rate" type="number" step="0.01" placeholder="38.50" {...register("base_hourly_rate")} className={errors.base_hourly_rate ? "border-red-500" : ""} />
            {errors.base_hourly_rate && <p className="text-sm text-red-500">{errors.base_hourly_rate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_hours_per_week">Max Hours / Week *</Label>
            <Input id="max_hours_per_week" type="number" placeholder="40" {...register("max_hours_per_week")} className={errors.max_hours_per_week ? "border-red-500" : ""} />
            {errors.max_hours_per_week && <p className="text-sm text-red-500">{errors.max_hours_per_week.message}</p>}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shift Preferences</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="prefers_day_shifts" checked={watch("prefers_day_shifts")} onCheckedChange={(v: boolean | "indeterminate") => setValue("prefers_day_shifts", v as boolean)} />
            <Label htmlFor="prefers_day_shifts">Prefers Day Shifts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="prefers_night_shifts" checked={watch("prefers_night_shifts")} onCheckedChange={(v: boolean | "indeterminate") => setValue("prefers_night_shifts", v as boolean)} />
            <Label htmlFor="prefers_night_shifts">Prefers Night Shifts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="weekend_availability" checked={watch("weekend_availability")} onCheckedChange={(v: boolean | "indeterminate") => setValue("weekend_availability", v as boolean)} />
            <Label htmlFor="weekend_availability">Weekend Availability</Label>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Nurse" : "Update Nurse"}
        </Button>
      </div>
    </form>
  )
}
