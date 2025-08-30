// @ts-nocheck
/* eslint-disable */
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateShift } from "@/features/shifts/api/useCreateShiftPublic"
import { toast } from "sonner"

// TODO: Replace with real fetched data
const departments = [
  { id: 1, name: "ICU" },
  { id: 2, name: "Emergency" },
  { id: 3, name: "Medical/Surgical" },
]

const skills = [
  { id: 1, name: "Ventilator" },
  { id: 3, name: "Pediatric" },
  { id: 7, name: "IV Certified" },
]

export type FormState = {
  department_id: string
  start_time: string
  end_time: string
  shift_type: "day" | "night" | "evening" | "weekend" | "holiday" | "on_call" | "float"
  required_nurses: string
  required_skills: string[]
  patient_ratio_target: string
  notes: string
}

// Shift windows are opinionated defaults you can tweak.
// Times are local 24h clock hours.
const SHIFT_WINDOWS: Record<string, { startHour: number; endHour: number; spansMidnight?: boolean; defaultStart: number; defaultEnd: number }> = {
  day: { startHour: 6, endHour: 20, spansMidnight: false, defaultStart: 7, defaultEnd: 19 },
  evening: { startHour: 14, endHour: 24, spansMidnight: false, defaultStart: 15, defaultEnd: 23 },
  night: { startHour: 18, endHour: 8, spansMidnight: true, defaultStart: 19, defaultEnd: 7 },
  weekend: { startHour: 0, endHour: 24, spansMidnight: false, defaultStart: 7, defaultEnd: 19 },
  holiday: { startHour: 0, endHour: 24, spansMidnight: false, defaultStart: 7, defaultEnd: 19 },
  on_call: { startHour: 0, endHour: 24, spansMidnight: false, defaultStart: 8, defaultEnd: 17 },
  float: { startHour: 0, endHour: 24, spansMidnight: false, defaultStart: 8, defaultEnd: 17 },
}

const pad = (n: number) => String(n).padStart(2, "0")

function toDatetimeLocalString(d: Date) {
  // yyyy-MM-ddTHH:mm (without seconds)
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function withDateAtHour(base: Date, hour: number) {
  const d = new Date(base)
  d.setHours(hour, 0, 0, 0)
  return d
}

function parseMaybeDate(v: string) {
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

function diffHours(a: Date, b: Date) {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60)
}

type FormErrors = Partial<Record<keyof FormState | "_form", string>>

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {}

  // Basic required checks
  if (!form.department_id) errors.department_id = "Department is required"
  if (!form.start_time) errors.start_time = "Start time is required"
  if (!form.end_time) errors.end_time = "End time is required"
  if (!form.shift_type) errors.shift_type = "Shift type is required"
  if (!form.required_nurses || Number(form.required_nurses) < 1)
    errors.required_nurses = "Required nurses must be at least 1"
  if (form.patient_ratio_target && Number(form.patient_ratio_target) < 0)
    errors.patient_ratio_target = "Patient ratio cannot be negative"

  const start = parseMaybeDate(form.start_time)
  const end = parseMaybeDate(form.end_time)
  if (start && end) {
    if (end <= start) {
      errors.end_time = "End time must be after start time"
    } else {
      const hrs = diffHours(start, end)
      if (hrs > 24) errors._form = "Shift cannot exceed 24 hours"
      if (hrs < 0.25) errors._form = "Shift must be at least 15 minutes"
    }

    // Shift window validation for types that specify windows
    const window = SHIFT_WINDOWS[form.shift_type]
    if (window) {
      const startHour = start.getHours()
      const endHour = end.getHours()
      const validStart = window.spansMidnight
        ? startHour >= window.startHour || startHour < window.endHour
        : startHour >= window.startHour && startHour < window.endHour
      const validEnd = window.spansMidnight
        ? endHour > window.startHour || endHour <= window.endHour
        : endHour > window.startHour && endHour <= window.endHour

      // Only enforce for day/evening/night strictly; others are flexible.
      if (["day", "evening", "night"].includes(form.shift_type)) {
        if (!validStart)
          errors.start_time = `Start must be within ${form.shift_type} hours`
        if (!validEnd)
          errors.end_time = `End must be within ${form.shift_type} hours`
      }
    }
  }

  return errors
}

export default function CreateShiftForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateShift()

  const [form, setForm] = useState<FormState>({
    department_id: "1",
    start_time: "",
    end_time: "",
    shift_type: "day",
    required_nurses: "",
    required_skills: [],
    patient_ratio_target: "",
    notes: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const applyDefaultTimesForShift = (shiftType: FormState["shift_type"]) => {
    const now = parseMaybeDate(form.start_time) || new Date()
    const baseDate = new Date(now)
    baseDate.setSeconds(0, 0)
    const win = SHIFT_WINDOWS[shiftType]
    if (!win) return

    const start = withDateAtHour(baseDate, win.defaultStart)
    let end = withDateAtHour(baseDate, win.defaultEnd)
    if (win.spansMidnight && win.defaultEnd < win.defaultStart) {
      // moves end to next day morning
      end.setDate(end.getDate() + 1)
    }

    setForm((prev) => ({
      ...prev,
      start_time: toDatetimeLocalString(start),
      end_time: toDatetimeLocalString(end),
    }))
  }

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // clear field-specific error on change
    setErrors((prev) => ({ ...prev, [field]: undefined, _form: undefined }))
    if (field === "shift_type") {
      applyDefaultTimesForShift(value)
    }
  }

  const handleSkillToggle = (skillId: string) => {
    setForm((prev) => {
      const exists = prev.required_skills.includes(skillId)
      return {
        ...prev,
        required_skills: exists
          ? prev.required_skills.filter((id) => id !== skillId)
          : [...prev.required_skills, skillId],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // client-side validation
    const v = validateForm(form)
    const hasErrors = Object.values(v).some(Boolean)
    if (hasErrors) {
      setErrors(v)
      const firstError = v._form || v.start_time || v.end_time || v.required_nurses || v.department_id || v.shift_type
      if (firstError) toast.error(firstError)
      return
    }

    try {
      await mutateAsync({
        department_id: Number(form.department_id),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        shift_type: form.shift_type,
        required_nurses: Number(form.required_nurses),
        required_skills: form.required_skills.map(Number),
        patient_ratio_target: Number(form.patient_ratio_target),
        notes: form.notes,
      })
      toast.success("Shift created successfully")
      router.push("/dashboard/shift-scheduling")
    } catch (err: any) {
      toast.error(err.message || "Failed to create shift")
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-2xl font-semibold">Create Individual Shift</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Shift Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.department_id}
                onValueChange={(v) => handleChange("department_id", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => handleChange("start_time", e.target.value)}
              />
              {errors.start_time && (
                <p className="text-sm text-red-600">{errors.start_time}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => handleChange("end_time", e.target.value)}
              />
              {errors.end_time && (
                <p className="text-sm text-red-600">{errors.end_time}</p>
              )}
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select
                value={form.shift_type}
                onValueChange={(v) => handleChange("shift_type", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "day",
                    "night",
                    "evening",
                    "weekend",
                    "holiday",
                    "on_call",
                    "float",
                  ].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.shift_type && ["day", "evening", "night"].includes(form.shift_type) && (
                <p className="text-xs text-muted-foreground">
                  Suggested {form.shift_type} hours are enforced. Changing shift type will pre-fill typical times.
                </p>
              )}
            </div>

            {/* Required Nurses */}
            <div className="space-y-2">
              <Label>Required Nurses</Label>
              <Input
                type="number"
                min="1"
                value={form.required_nurses}
                onChange={(e) => handleChange("required_nurses", e.target.value)}
              />
              {errors.required_nurses && (
                <p className="text-sm text-red-600">{errors.required_nurses}</p>
              )}
            </div>

            {/* Patient Ratio Target */}
            <div className="space-y-2">
              <Label>Patient Ratio Target</Label>
              <Input
                type="number"
                step="0.1"
                value={form.patient_ratio_target}
                onChange={(e) => handleChange("patient_ratio_target", e.target.value)}
              />
              {errors.patient_ratio_target && (
                <p className="text-sm text-red-600">{errors.patient_ratio_target}</p>
              )}
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-4">
                {skills.map((s) => (
                  <Label key={s.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={form.required_skills.includes(String(s.id))}
                      onCheckedChange={() => handleSkillToggle(String(s.id))}
                    />
                    {s.name}
                  </Label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Shift"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
        {errors._form && (
          <p className="text-sm text-red-600">{errors._form}</p>
        )}
      </form>
    </div>
  )
}
