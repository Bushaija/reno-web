/* eslint-disable */
// @ts-nocheck
"use client"

import React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useUpdateNurseAvailability } from "@/features/nurses/api"

const availabilityItemSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/, "Invalid time format (HH:MM:SS)"),
  end_time: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$/, "Invalid time format (HH:MM:SS)"),
  is_preferred: z.boolean(),
  is_available: z.boolean(),
})

const availabilitySchema = z.object({
  availabilities: z.array(availabilityItemSchema).min(1, "At least one availability entry is required"),
})

export type AvailabilityFormData = z.infer<typeof availabilitySchema>

interface NurseAvailabilityFormProps {
  nurseId: string | number
  initialData?: AvailabilityFormData
  onSuccess?: () => void
  onCancel?: () => void
}

export function NurseAvailabilityForm({ nurseId, initialData, onSuccess, onCancel }: NurseAvailabilityFormProps) {
  const updateAvailability = useUpdateNurseAvailability(nurseId)

  const defaultAvailabilities = Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    start_time: "07:00:00",
    end_time: "19:00:00",
    is_preferred: false,
    is_available: true,
  }))

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: initialData
      ? { availabilities: initialData }
      : { availabilities: defaultAvailabilities },
  })

  const { fields } = useFieldArray({ control, name: "availabilities" })

  const onSubmit = async (data: AvailabilityFormData) => {
    try {
      await updateAvailability.mutateAsync(data.availabilities)
      toast.success("Availability updated successfully")
      onSuccess?.()
    } catch (error) {
      console.error("Failed to update availability:", error)
      toast.error("Failed to update availability")
    }
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Weekly Availability</h3>
        <div className="space-y-3">
          {fields.map((field, index) => {
            const base = `availabilities.${index}` as const
            return (
              <div key={field.id} className="grid grid-cols-7 items-end gap-2">
                {/* Day selector */}
                <div className="col-span-1">
                  <Label>Day</Label>
                  <Select
                    value={String(watch(`${base}.day_of_week`))}
                    onValueChange={(val) => {
                      const num = parseInt(val, 10)
                      control.setValue(`${base}.day_of_week` as any, num)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((n, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start time */}
                <div className="col-span-2">
                  <Label>Start Time</Label>
                  <Input type="time" step="1" {...register(`${base}.start_time`)} />
                </div>

                {/* End time */}
                <div className="col-span-2">
                  <Label>End Time</Label>
                  <Input type="time" step="1" {...register(`${base}.end_time`)} />
                </div>

                {/* Preferred */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={watch(`${base}.is_preferred`)}
                    onCheckedChange={(v) => control.setValue(`${base}.is_preferred` as any, v === true)}
                  />
                  <Label>Preferred</Label>
                </div>

                {/* Available */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={watch(`${base}.is_available`)}
                    onCheckedChange={(v) => control.setValue(`${base}.is_available` as any, v === true)}
                  />
                  <Label>Available</Label>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || updateAvailability.isPending}>
          {isSubmitting || updateAvailability.isPending ? "Saving..." : "Update Availability"}
        </Button>
      </div>
    </form>
  )
}
