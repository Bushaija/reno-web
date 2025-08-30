"use client"

import { useParams } from "next/navigation"
import AutoAssignForm from "@/components/api-forms/auto-assign-form"

export default function AutoAssignPage() {
  const params = useParams()
  const shiftId = Number(params?.id)
  if (Number.isNaN(shiftId)) return <p>Invalid shift id</p>
  return <AutoAssignForm shiftId={shiftId} />
}
