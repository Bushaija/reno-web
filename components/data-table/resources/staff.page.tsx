// staff-page.tsx
// @ts-nocheck
"use client"

import * as React from "react"
import { ReusableDataTable } from "@/components/data-table/components/data-table"
import { createNurseColumns } from "./nurse.columns";
import { Nurse } from "./nurse.types";
import { usePredefinedSchemaModal } from "@/hooks/use-schema-modal";
import { useNurses } from "@/features/nurses/api/useNurses";
import { useCreateNurse } from "@/features/nurses/api";
import { toast } from "sonner";
import { useGenerateReport } from "@/hooks/use-outcome-report";
import { ExportReportModal } from "./export-report-modal";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Remove the mock fetchUsers function since we'll use the useUsers hook

export default function StaffPage() {
  const { openNurseModalWithSubmit } = usePredefinedSchemaModal()
  const generateReport = useGenerateReport();
  
  // State for export modal
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  
  // State for AlertDialog
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedNurse, setSelectedNurse] = React.useState<Nurse | null>(null);

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
    setSelectedNurse(nurse);
    setViewDialogOpen(true);
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
    // Open the export modal instead of directly generating report
    setExportModalOpen(true);
  };

  const handleExportSubmit = async (reportRequest: any) => {
    try {
      const result = await generateReport.mutateAsync(reportRequest);
      
      if (result.success) {
        toast.success(`Report "${result.fileName}" generated and downloaded successfully!`);
      } else {
        toast.error("Failed to generate report");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

  const createNurse = useCreateNurse();

  const handleAdd = () => {
    console.log("handleAdd triggered");
    openNurseModalWithSubmit(undefined, async (data) => {
      try {
        console.log("Form data received in handleAdd:", data);

        // Call create nurse mutation via Hono client
        await createNurse.mutateAsync(data);

        toast.success("Nurse created successfully");
      } catch (error) {
        console.error("Failed to create nurse:", error);
        toast.error("Failed to create nurse. Please try again.");
        throw error; // Let modal display the error
      }
    });
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

      {/* Nurse Details AlertDialog */}
      <AlertDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nurse Details</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedNurse ? (
                <div className="space-y-2 text-left">
                  <div><span className="font-semibold">Name:</span> {selectedNurse.user.name}</div>
                  <div><span className="font-semibold">Email:</span> {selectedNurse.user.email}</div>
                  <div><span className="font-semibold">Specialization:</span> {selectedNurse.specialization}</div>
                </div>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Report Modal */}
      <ExportReportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExportSubmit}
        isLoading={generateReport.isPending}
      />
    </div>
  )
}