"use client"
// @ts-nocheck

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useBroadcastNotification } from "@/features/notifications/api/useBroadcastNotification"
import { toast } from "sonner"

const departmentsMock = [
  { id: 1, name: "ICU" },
  { id: 2, name: "Emergency" },
  { id: 3, name: "Medical/Surgical" },
]

export default function BroadcastAlertForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useBroadcastNotification()

  const [form, setForm] = useState({
    target_audience: "department_staff",
    department_ids: [] as string[],
    title: "",
    message: "",
    priority: "urgent",
    emergency: true,
  })

  const toggleDept = (id: string) => {
    setForm((prev) => ({
      ...prev,
      department_ids: prev.department_ids.includes(id) ? prev.department_ids.filter((d) => d !== id) : [...prev.department_ids, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutateAsync({
        target_audience: form.target_audience as any,
        department_ids: form.department_ids.map(Number),
        title: form.title,
        message: form.message,
        priority: form.priority as any,
        emergency: form.emergency,
      })
      toast.success("Broadcast alert sent")
      router.back()
    } catch (err: any) {
      toast.error(err.message || "Failed to send broadcast")
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h2 className="text-2xl font-semibold">Broadcast Emergency Alert</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Alert Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audience */}
            <div className="space-y-1">
              <Label>Target audience</Label>
              <Select value={form.target_audience} onValueChange={(v) => setForm({ ...form, target_audience: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All staff</SelectItem>
                  <SelectItem value="department_staff">Department staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.target_audience === "department_staff" && (
              <div className="space-y-1">
                <Label>Departments</Label>
                <div className="flex flex-wrap gap-4">
                  {departmentsMock.map((d) => (
                    <Label key={d.id} className="flex items-center gap-2">
                      <Checkbox checked={form.department_ids.includes(String(d.id))} onCheckedChange={() => toggleDept(String(d.id))} />
                      {d.name}
                    </Label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Label className="flex items-center gap-2">
              <Checkbox checked={form.emergency} onCheckedChange={(v) => setForm({ ...form, emergency: !form.emergency })} />
              Emergency broadcast
            </Label>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>{isPending ? "Sending..." : "Broadcast"}</Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
