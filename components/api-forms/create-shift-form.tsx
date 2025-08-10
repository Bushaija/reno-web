"use client"
// @ts-nocheck

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateShiftPublic } from "@/features/shifts/api/useCreateShiftPublic"
import { toast } from "sonner"

// TODO: Replace with real fetched data
const departments = [
  { id: 1, name: "ICU" },
  { id: 2, name: "Emergency" },
  { id: 3, name: "Med/Surg" },
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
  shift_type: "day" | "night"
  required_nurses: string
  required_skills: string[]
  patient_ratio_target: string
  notes: string
}

export default function CreateShiftForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateShiftPublic()

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

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => handleChange("end_time", e.target.value)}
              />
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
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
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
      </form>
    </div>
  )
}
