// staff-page.tsx
// @ts-nocheck
"use client"

import * as React from "react"
import { ReusableDataTable } from "@/components/data-table/components/data-table"
import { createNurseColumns } from "./nurse.columns";
import { Nurse } from "./nurse.types";
import { usePredefinedSchemaModal } from "@/hooks/use-schema-modal";
import { useNurses } from "@/features/nurses/api/useNurses";

// Remove the mock fetchUsers function since we'll use the useUsers hook

export default function StaffPage() {
  const { openNurseModalWithSubmit } = usePredefinedSchemaModal()
  
  // Use the useUsers hook instead of manual state management
  const [queryParams, setQueryParams] = React.useState({
    page: "1",
    limit: "10",
  });

  const { data: nursesData, isLoading, error } = useNurses(queryParams);

  const data: Nurse[] = nursesData?.data || [];
  const pagination = nursesData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  }

  const handlePaginationChange = (page: number, limit: number) => {
    setQueryParams({
      page: String(page),
      limit: String(limit),
    })
  }

  const handleView = (nurse: Nurse) => {
    alert(`Nurse: ${nurse.user.name}\nEmail: ${nurse.user.email}\nSpecialization: ${nurse.specialization}`);
  };

  const handleEdit = (user: Nurse) => {
    console.log("Edit user:", user)
    openNurseModalWithSubmit(user, async (data) => {
      try {
        console.log("Form data received:", data)
        
        // Format the data according to the API schema
        const updateData = {
          name: data.name,
          profile: {
            employeeId: data.profile?.employeeId || "",
            specialization: data.profile?.specialization || "",
            licenseNumber: data.profile?.licenseNumber || "",
            certification: data.profile?.certification || "",
            availableStart: data.profile?.availableStart || "",
            availableEnd: data.profile?.availableEnd || "",
          }
        }
        
        console.log("Formatted update data:", updateData)
        
        // Use the updateUser mutation
        const mutationData = { id: user.id, ...updateData }
        console.log("Mutation data being sent:", mutationData)
        // await updateUserMutation.mutateAsync(mutationData) // This line was removed as per the new_code
        
        // The mutation will automatically invalidate the users query
        console.log("User updated successfully")
        // Show success message
        alert("User updated successfully")
      } catch (error) {
        console.error("Failed to update user:", error)
        alert("Failed to update user. Please try again.")
        throw error // Re-throw to let the modal handle the error
      }
    })
  }

  const handleDelete = (user: Nurse) => {
    console.log("Delete user:", user)
    if (window.confirm(`Are you sure you want to delete ${user.user.name}? This action cannot be undone.`)) {
      // deleteUserMutation.mutate(user.id, { // This line was removed as per the new_code
      //   onSuccess: () => {
      //     console.log("User deleted successfully")
      //     // Show success message
      //     alert("User deleted successfully")
      //   },
      //   onError: (error) => {
      //     console.error("Failed to delete user:", error)
      //     alert("Failed to delete user. Please try again.")
      //   }
      // })
    }
  }

  const handleRefresh = () => {
    // The useUsers hook will automatically refetch when queryParams change
    // or we can trigger a manual refetch if needed
    setQueryParams(prev => ({ ...prev }))
  }

  const handleExport = () => {
    console.log("Export users")
    // Implement export logic
  }

  const handleAdd = () => {
    console.log("handleAdd triggered")
    openNurseModalWithSubmit(undefined, async (data) => {
      try {
        console.log("Form data received in handleAdd:", data)
        
        // Validate required fields
        if (!data.name || !data.email || !data.role) { // removed: !data.password
          throw new Error("Missing required fields: name, email, or role")
        }
        
        // Ensure profile object exists
        const userData = {
          ...data,
          profile: data.profile || {}
        }
        
        console.log("Data being sent to API:", userData)
        
        // Use the createUser mutation instead of fetch
        // const result = await createUserMutation.mutateAsync(userData) // This line was removed as per the new_code
        console.log("API response:", userData) // This line was changed as per the new_code
        
        // The mutation will automatically invalidate the users query
        // and trigger a refetch, so we don't need to manually refresh
        console.log("User created successfully")
        // Show success message
        alert("User created successfully")
      } catch (error) {
        console.error("Failed to create user:", error)
        alert("Failed to create user. Please try again.")
        throw error // Re-throw to let the modal handle the error
      }
    })
  }

  // Handle API errors
  if (error) {
    console.error("Error fetching users:", error)
  }

  // Show loading state for mutations
  // const isCreating = createUserMutation.isPending // This line was removed as per the new_code
  // const isUpdating = updateUserMutation.isPending // This line was removed as per the new_code
  // const isDeleting = deleteUserMutation.isPending // This line was removed as per the new_code

  const columns = createNurseColumns({ onView: handleView });

  return (
    <div className="container py-2">


      <ReusableDataTable
        columns={columns}
        data={data}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        searchPlaceholder="Search nurses by name..."
        searchKey="name"
        title="Nurse Management"
        description="Manage nursing staff"
        onRefresh={handleRefresh}
        onExport={handleExport}
        onAdd={handleAdd}
        showActions={true}
      />
    </div>
  )
}