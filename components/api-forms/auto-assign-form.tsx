"use client"
// @ts-nocheck

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAutoAssign } from "@/features/shifts/api/useAutoAssign"
import { toast } from "sonner"

export default function AutoAssignForm({ shiftId }: { shiftId: number }) {
  const router = useRouter()
  const { mutateAsync, isPending } = useAutoAssign()

  const [prefs, setPrefs] = useState({
    prefer_seniority: true,
    max_fatigue_score: 70,
    avoid_overtime: true,
    prioritize_availability: true,
  })

  const toggle = (k: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [k]: !p[k] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutateAsync({ shift_id: shiftId, preferences: prefs })
      toast.success("Auto-assign request sent")
      router.back()
    } catch (err: any) {
      toast.error(err.message || "Failed to auto-assign")
    }
  }

  return (
    <div className="space-y-8 max-w-md">
      <h2 className="text-2xl font-semibold">Auto-Assign Nurses</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="flex items-center gap-2">
              <Checkbox checked={prefs.prefer_seniority} onCheckedChange={() => toggle("prefer_seniority")} />
              Prefer seniority
            </Label>
            <Label className="flex items-center gap-2">
              <Checkbox checked={prefs.avoid_overtime} onCheckedChange={() => toggle("avoid_overtime")} />
              Avoid overtime
            </Label>
            <Label className="flex items-center gap-2">
              <Checkbox checked={prefs.prioritize_availability} onCheckedChange={() => toggle("prioritize_availability")} />
              Prioritize availability
            </Label>
            <div className="space-y-1 pt-2">
              <Label>Max fatigue score</Label>
              <Input type="number" min="0" max="100" value={prefs.max_fatigue_score} onChange={(e) => setPrefs({ ...prefs, max_fatigue_score: Number(e.target.value) })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Assigning..." : "Auto-Assign"}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
