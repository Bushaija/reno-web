"use client"

import * as React from "react"
import { ReusableDataTable } from "@/components/data-table/components/data-table"
import { createChangeRequestColumns } from "@/components/data-table/resources/change-request.columns"
import { ChangeRequest, ChangeRequestsListResponse } from "@/components/data-table/resources/change-request.types"
import { useToast } from "@/hooks/use-toast"
import { useChangeRequests, useUpdateChangeRequest } from "@/features/change-requests/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Remove mock API calls - we'll use the real hooks instead

export default function ChangeRequestsPage() {
  const { toast } = useToast();
  const updateChangeRequestMutation = useUpdateChangeRequest();
  
  // Use the real API hook for fetching change requests
  const [queryParams, setQueryParams] = React.useState({
    page: "1",
    limit: "10",
  });
  
  const { data: changeRequestsData, isLoading, error } = useChangeRequests(queryParams);
  
  // Show loading state for mutations
  const isUpdating = updateChangeRequestMutation.isPending;
  
  // Extract data and pagination from the hook response
  const data = changeRequestsData?.requests || [];
  const pagination = changeRequestsData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };
  
  const [actionDialog, setActionDialog] = React.useState<{
    isOpen: boolean;
    request: ChangeRequest | null;
    action: "approve" | "reject" | null;
  }>({
    isOpen: false,
    request: null,
    action: null,
  });

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching change requests:", error);
      toast({
        title: "Error",
        description: "Failed to load change requests. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handlePaginationChange = (page: number, limit: number) => {
    setQueryParams({
      page: String(page),
      limit: String(limit),
    });
  };

  const handleView = (request: ChangeRequest) => {
    console.log("View request:", request);
    
    // Create a detailed view of the change request
    const details = `
Change Request Details:
Request ID: ${request.id}
Status: ${request.status}
Submitted: ${new Date(request.submittedAt).toLocaleDateString()}

Requester Information:
Name: ${request.requester.name}
Employee ID: ${request.requester.employeeId}

Shift Information:
Shift ID: ${request.shift.id}
Department: ${request.shift.department}
Start Time: ${new Date(request.shift.startTime).toLocaleString()}
End Time: ${new Date(request.shift.endTime).toLocaleString()}

Reason for Change:
${request.reason}
    `.trim();
    
    alert(details);
  };

  const handleApprove = (request: ChangeRequest) => {
    // Check if request is already processed
    if (request.status !== "pending") {
      toast({
        title: "Cannot Approve",
        description: `This request is already ${request.status}.`,
        variant: "destructive",
      });
      return;
    }
    
    setActionDialog({
      isOpen: true,
      request,
      action: "approve",
    });
  };

  const handleReject = (request: ChangeRequest) => {
    // Check if request is already processed
    if (request.status !== "pending") {
      toast({
        title: "Cannot Reject",
        description: `This request is already ${request.status}.`,
        variant: "destructive",
      });
      return;
    }
    
    setActionDialog({
      isOpen: true,
      request,
      action: "reject",
    });
  };

  const handleReviewDetails = (request: ChangeRequest) => {
    console.log("Review shift details:", request.shift);
    
    // Create a detailed view of the shift information
    const shiftDetails = `
Shift Details for Review:
Shift ID: ${request.shift.id}
Department: ${request.shift.department}
Start Time: ${new Date(request.shift.startTime).toLocaleString()}
End Time: ${new Date(request.shift.endTime).toLocaleString()}
Duration: ${Math.round((new Date(request.shift.endTime).getTime() - new Date(request.shift.startTime).getTime()) / (1000 * 60 * 60))} hours

Requester Information:
Name: ${request.requester.name}
Employee ID: ${request.requester.employeeId}

Change Request:
Reason: ${request.reason}
Status: ${request.status}
Submitted: ${new Date(request.submittedAt).toLocaleDateString()}

This shift is being requested for change by the healthcare worker.
    `.trim();
    
    alert(shiftDetails);
  };

  const confirmAction = async () => {
    if (!actionDialog.request || !actionDialog.action) return;

    try {
      // Map the action to the correct status
      const status = actionDialog.action === "approve" ? "approved" : "rejected";
      
      // Use the mutation to update the request
      await updateChangeRequestMutation.mutateAsync({
        id: actionDialog.request.id,
        status,
        reviewNote: `Request ${actionDialog.action}d by admin`,
      });

      toast({
        title: "Success",
        description: `Request ${actionDialog.action === "approve" ? "approved" : "rejected"} successfully.`,
      });
    } catch (error) {
      console.error("Failed to update change request:", error);
      toast({
        title: "Error",
        description: `Failed to ${actionDialog.action} request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setActionDialog({ isOpen: false, request: null, action: null });
    }
  };

  const handleRefresh = () => {
    // The useChangeRequests hook will automatically refetch when queryParams change
    setQueryParams(prev => ({ ...prev }));
  };

  const handleExport = () => {
    console.log("Export change requests");
    // Implement export logic
  };

  const columns = createChangeRequestColumns({
    onView: handleView,
    onApprove: handleApprove,
    onReject: handleReject,
    onReviewDetails: handleReviewDetails,
  });

  // Calculate summary stats
  const pendingCount = data.filter(r => r.status === "pending").length;
  const approvedCount = data.filter(r => r.status === "approved").length;
  const rejectedCount = data.filter(r => r.status === "rejected").length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {pendingCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {approvedCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {rejectedCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Declined requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <ReusableDataTable
        columns={columns}
        data={data}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        isLoading={isLoading}
        searchPlaceholder="Search by requester name..."
        searchKey="requester.name"
        title="Change Requests"
        description="Manage shift change requests from healthcare workers."
        onRefresh={handleRefresh}
        onExport={handleExport}
        showActions={true}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog.isOpen} onOpenChange={(open) => 
        setActionDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "approve" ? "Approve" : "Reject"} Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionDialog.action} the change request from{" "}
              <strong>{actionDialog.request?.requester.name}</strong>?
              <br />
              <strong>Shift:</strong> {actionDialog.request?.shift.department} - {new Date(actionDialog.request?.shift.startTime || '').toLocaleDateString()}
              <br />
              <strong>Reason:</strong> {actionDialog.request?.reason}
              {actionDialog.action === "reject" && (
                <span className="block mt-2 text-red-600">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={isUpdating}
              className={
                actionDialog.action === "approve" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isUpdating 
                ? "Processing..." 
                : (actionDialog.action === "approve" ? "Approve" : "Reject")
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}