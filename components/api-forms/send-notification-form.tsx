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
import { useSendNotification } from "@/features/notifications/api/useSendNotification"
import { toast } from "sonner"

export default function SendNotificationForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useSendNotification()

  const [form, setForm] = useState({
    recipients: "",
    category: "shift_update",
    title: "",
    message: "",
    priority: "high",
    action_required: true,
    action_url: "",
  })

  const handleChange = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutateAsync({
        recipients: form.recipients.split(/[,\s]+/).filter(Boolean).map(Number),
        category: form.category,
        title: form.title,
        message: form.message,
        priority: form.priority as any,
        action_required: form.action_required,
        action_url: form.action_url || undefined,
      })
      toast.success("Notification sent")
      router.back()
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification")
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h2 className="text-2xl font-semibold">Send Notification</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Recipients (IDs, comma separated)</Label>
              <Input value={form.recipients} onChange={(e) => handleChange("recipients", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea value={form.message} onChange={(e) => handleChange("message", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Label className="flex items-center gap-2">
              <Checkbox checked={form.action_required} onCheckedChange={() => handleChange("action_required", !form.action_required)} />
              Action required
            </Label>
            <div className="space-y-1">
              <Label>Action URL</Label>
              <Input value={form.action_url} onChange={(e) => handleChange("action_url", e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>{isPending ? "Sending..." : "Send"}</Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
