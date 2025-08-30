"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateUser } from "@/features/users/api"
import { toast } from "sonner"

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "healthcare_worker"]),
  employeeId: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
  certification: z.string().optional(),
  availableStart: z.string().optional(),
  availableEnd: z.string().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<UserFormData>
  mode?: "create" | "edit"
}

export function UserForm({ onSuccess, onCancel, initialData, mode = "create" }: UserFormProps) {
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      role: "healthcare_worker",
      employeeId: "",
      specialization: "",
      department: "",
      licenseNumber: "",
      certification: "",
      availableStart: "",
      availableEnd: "",
    },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: UserFormData) => {
    try {
      if (mode === "create") {
        await createUser.mutateAsync(data)
        toast.success("User created successfully")
      }
      // TODO: Add edit functionality when needed
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save user:", error)
      toast.error("Failed to save user")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter full name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue("role", value as "admin" | "healthcare_worker")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthcare_worker">Healthcare Worker</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedRole === "healthcare_worker" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                {...register("employeeId")}
                placeholder="Enter employee ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                {...register("specialization")}
                placeholder="Enter specialization"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                {...register("licenseNumber")}
                placeholder="Enter license number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certification">Certification</Label>
            <Textarea
              id="certification"
              {...register("certification")}
              placeholder="Enter certifications"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availableStart">Available Start Time</Label>
              <Input
                id="availableStart"
                type="time"
                {...register("availableStart")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableEnd">Available End Time</Label>
              <Input
                id="availableEnd"
                type="time"
                {...register("availableEnd")}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
        </Button>
      </div>
    </form>
  )
} 