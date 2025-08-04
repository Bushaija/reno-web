// users-page.tsx
"use client"

import * as React from "react"
import { ReusableDataTable } from "@/components/data-table/components/data-table"
import { createUserColumns } from "./user.columns"
import { User, ApiResponse } from "@/components/data-table/resources/user.types"
import { usePredefinedSchemaModal } from "@/hooks/use-schema-modal"
import { useCreateUser, useUsers, useUpdateUser, useDeleteUser, useUser } from "@/features/users/api"

// Remove the mock fetchUsers function since we'll use the useUsers hook

export default function UsersPage() {
  const { openUserModalWithSubmit } = usePredefinedSchemaModal()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  
  // Use the useUsers hook instead of manual state management
  const [queryParams, setQueryParams] = React.useState({
    page: "1",
    limit: "10",
  })
  
  const { data: usersData, isLoading, error } = useUsers(queryParams)

  // Extract data and pagination from the hook response
  const data = usersData?.users || []
  const pagination = usersData?.pagination || {
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

  const handleView = (user: User) => {
    console.log("View user:", user)
    // Show user details in a more detailed alert
    const profile = user.profile || {}
    const details = `
      User Details:
      Name: ${user.name}
      Email: ${user.email}
      Role: ${user.role}
      ${user.role === 'healthcare_worker' ? `
      Employee ID: ${profile.employeeId || 'N/A'}
      Specialization: ${profile.specialization || 'N/A'}
      License Number: ${profile.licenseNumber || 'N/A'}
      Available Hours: ${profile.availableStart || 'N/A'} - ${profile.availableEnd || 'N/A'}
      Certification: ${profile.certification || 'N/A'}
      ` : user.role === 'admin' ? `
      Department: ${profile.department || 'N/A'}
      ` : ''}
      Created: ${new Date(user.createdAt).toLocaleDateString()}
      Status: ${user.status}
          `.trim()
          
          alert(details)
  }

  const handleEdit = (user: User) => {
    console.log("Edit user:", user)
    openUserModalWithSubmit(user, async (data) => {
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
        await updateUserMutation.mutateAsync(mutationData)
        
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

  const handleDelete = (user: User) => {
    console.log("Delete user:", user)
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id, {
        onSuccess: () => {
          console.log("User deleted successfully")
          // Show success message
          alert("User deleted successfully")
        },
        onError: (error) => {
          console.error("Failed to delete user:", error)
          alert("Failed to delete user. Please try again.")
        }
      })
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
    openUserModalWithSubmit(undefined, async (data) => {
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
        const result = await createUserMutation.mutateAsync(userData)
        console.log("API response:", result)
        
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
  const isCreating = createUserMutation.isPending
  const isUpdating = updateUserMutation.isPending
  const isDeleting = deleteUserMutation.isPending

  const columns = createUserColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  return (
    <div className="container py-2">


      <ReusableDataTable
        columns={columns}
        data={data}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        searchPlaceholder="Search users by name..."
        searchKey="name"
        title="Users Management"
        description="Manage your system users and their roles."
        onRefresh={handleRefresh}
        onExport={handleExport}
        onAdd={handleAdd}
        showActions={true}
      />
    </div>
  )
}