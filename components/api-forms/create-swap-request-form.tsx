// @ts-nocheck
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useCreateSwapRequest } from "@/features/swap/api/useCreateSwapRequest"
import { toast } from "sonner"

export default function CreateSwapRequestForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateSwapRequest()

  const [form, setForm] = useState({
    original_shift_id: "",
    target_nurse_id: "",
    requested_shift_id: "",
    swap_type: "full_shift",
    reason: "",
    expires_in_hours: "72",
  })

  const handleChange = (field: string, v: any) => setForm((p) => ({ ...p, [field]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutateAsync({
        original_shift_id: Number(form.original_shift_id),
        target_nurse_id: Number(form.target_nurse_id),
        requested_shift_id: Number(form.requested_shift_id),
        swap_type: form.swap_type as any,
        reason: form.reason,
        expires_in_hours: Number(form.expires_in_hours),
      })
      toast.success("Swap request submitted")
      router.back()
    } catch (err: any) {
      toast.error(err.message || "Failed to create request")
    }
  }

  return (
    <div className="space-y-8 max-w-md">
      <h2 className="text-2xl font-semibold">Create Swap Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Original shift ID</Label>
              <Input type="number" value={form.original_shift_id} onChange={(e) => handleChange("original_shift_id", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Requested shift ID</Label>
              <Input type="number" value={form.requested_shift_id} onChange={(e) => handleChange("requested_shift_id", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Target nurse ID</Label>
              <Input type="number" value={form.target_nurse_id} onChange={(e) => handleChange("target_nurse_id", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Swap type</Label>
              <Select value={form.swap_type} onValueChange={(v) => handleChange("swap_type", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_shift">Full shift</SelectItem>
                  <SelectItem value="partial_shift">Partial shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => handleChange("reason", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Expires in hours</Label>
              <Input type="number" value={form.expires_in_hours} onChange={(e) => handleChange("expires_in_hours", e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit"}</Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
