// users-page.tsx
"use client"

import * as React from "react"
import { ReusableDataTable } from "@/components/data-table/components/data-table"
import { createUserColumns } from "./user.columns"
import { User, ApiResponse } from "@/components/data-table/resources/user.types"

// Mock API call - replace with your actual API call
async function fetchUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<User>> {
  // This would be your actual API call
  const response = await fetch(`/api/users?page=${page}&limit=${limit}`)
  return response.json()
}

export default function UsersPage() {
  const [data, setData] = React.useState<User[]>([])
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const loadUsers = React.useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true)
    try {
      const response = await fetchUsers(page, limit)
      if (response.success) {
        setData(response.data.users || [])
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handlePaginationChange = (page: number, limit: number) => {
    loadUsers(page, limit)
  }

  const handleView = (user: User) => {
    console.log("View user:", user)
    // Implement view logic
  }

  const handleEdit = (user: User) => {
    console.log("Edit user:", user)
    // Implement edit logic
  }

  const handleDelete = (user: User) => {
    console.log("Delete user:", user)
    // Implement delete logic
  }

  const handleRefresh = () => {
    loadUsers(pagination.page, pagination.limit)
  }

  const handleExport = () => {
    console.log("Export users")
    // Implement export logic
  }

  const handleAdd = () => {
    console.log("Add new user")
    // Implement add logic
  }

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