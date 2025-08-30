"use client"
// @ts-nocheck

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useGenerateSchedule } from "@/features/scheduling/api/useGenerateSchedule"
import { toast } from "sonner"

const departmentsMock = [
  { id: 1, name: "ICU" },
  { id: 2, name: "Emergency" },
  { id: 3, name: "Medical/Surgical" },
]

export default function GenerateScheduleForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useGenerateSchedule()

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    departments: [] as string[],
    options: {
      balance_workload: true,
      respect_preferences: true,
      minimize_overtime: true,
      fair_rotation: true,
      max_consecutive_shifts: 3,
      min_days_off: 2,
    },
  })

  const toggleDept = (id: string) => {
    setForm((prev) => {
      const exists = prev.departments.includes(id)
      return {
        ...prev,
        departments: exists ? prev.departments.filter((d) => d !== id) : [...prev.departments, id],
      }
    })
  }

  const toggleOption = (key: keyof typeof form.options) => {
    setForm((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: !prev.options[key] },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutateAsync({
        start_date: form.start_date,
        end_date: form.end_date,
        departments: form.departments.map(Number),
        options: {
          ...form.options,
          max_consecutive_shifts: Number(form.options.max_consecutive_shifts),
          min_days_off: Number(form.options.min_days_off),
        },
      })
      toast.success("Schedule generation request sent")
      router.back()
    } catch (err: any) {
      toast.error(err.message || "Failed to generate schedule")
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-2xl font-semibold">Generate Automated Schedule</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-2">
              <Label>Departments</Label>
              <div className="flex flex-wrap gap-4">
                {departmentsMock.map((d) => (
                  <Label key={d.id} className="flex items-center gap-2">
                    <Checkbox checked={form.departments.includes(String(d.id))} onCheckedChange={() => toggleDept(String(d.id))} />
                    {d.name}
                  </Label>
                ))}
              </div>
            </div>

            {/* Scheduling Options */}
            <div className="space-y-4">
              <Label className="block mb-1">Priorities & Constraints</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Label className="flex items-center gap-2">
                  <Checkbox checked={form.options.balance_workload} onCheckedChange={() => toggleOption("balance_workload")} />
                  Balance workload
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox checked={form.options.respect_preferences} onCheckedChange={() => toggleOption("respect_preferences")} />
                  Respect preferences
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox checked={form.options.minimize_overtime} onCheckedChange={() => toggleOption("minimize_overtime")} />
                  Minimize overtime
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox checked={form.options.fair_rotation} onCheckedChange={() => toggleOption("fair_rotation")} />
                  Fair rotation
                </Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <Label>Max consecutive shifts</Label>
                  <Input type="number" min="1" value={form.options.max_consecutive_shifts} onChange={(e) => setForm({ ...form, options: { ...form.options, max_consecutive_shifts: Number(e.target.value) } })} />
                </div>
                <div className="space-y-1">
                  <Label>Min days off</Label>
                  <Input type="number" min="0" value={form.options.min_days_off} onChange={(e) => setForm({ ...form, options: { ...form.options, min_days_off: Number(e.target.value) } })} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Generating..." : "Generate"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
