"use client"

import * as React from "react"
import { ReusableDataTable } from "@/components/data-table/components/data-table"
import { createChangeRequestColumns } from "@/components/data-table/resources/change-request.columns"
import { ChangeRequest, ChangeRequestsListResponse } from "@/components/data-table/resources/change-request.types"
import { useToast } from "@/hooks/use-toast"
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

// Mock API call - replace with your actual API call
async function fetchChangeRequests(
  page: number = 1, 
  limit: number = 10,
  status?: string,
  department?: string
): Promise<ChangeRequestsListResponse> {
  // This would be your actual API call
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(department && { department }),
  });
  
  const response = await fetch(`/api/change-requests?${params}`);
  return response.json();
}

async function updateRequestStatus(requestId: number, status: "approved" | "rejected"): Promise<void> {
  const response = await fetch(`/api/change-requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update request status');
  }
}

export default function ChangeRequestsPage() {
  const { toast } = useToast();
  const [data, setData] = React.useState<ChangeRequest[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [actionDialog, setActionDialog] = React.useState<{
    isOpen: boolean;
    request: ChangeRequest | null;
    action: "approve" | "reject" | null;
  }>({
    isOpen: false,
    request: null,
    action: null,
  });

  const loadChangeRequests = React.useCallback(async (
    page: number = 1, 
    limit: number = 10,
    filters?: { status?: string; department?: string }
  ) => {
    setIsLoading(true);
    try {
      const response = await fetchChangeRequests(page, limit, filters?.status, filters?.department);
      if (response.success) {
        setData(response.data.requests);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch change requests:", error);
      toast({
        title: "Error",
        description: "Failed to load change requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadChangeRequests();
  }, [loadChangeRequests]);

  const handlePaginationChange = (page: number, limit: number) => {
    loadChangeRequests(page, limit);
  };

  const handleView = (request: ChangeRequest) => {
    console.log("View request:", request);
    // Implement view logic - could open a modal or navigate to detail page
  };

  const handleApprove = (request: ChangeRequest) => {
    setActionDialog({
      isOpen: true,
      request,
      action: "approve",
    });
  };

  const handleReject = (request: ChangeRequest) => {
    setActionDialog({
      isOpen: true,
      request,
      action: "reject",
    });
  };

  const handleReviewDetails = (request: ChangeRequest) => {
    console.log("Review shift details:", request.shift);
    // Implement logic to show shift details
  };

  const confirmAction = async () => {
    if (!actionDialog.request || !actionDialog.action) return;

    try {
      await updateRequestStatus(actionDialog.request.id, actionDialog.action);
      
      // Update local state
      setData(prevData =>
        prevData.map(item =>
          item.id === actionDialog.request!.id
            ? { ...item, status: actionDialog.action! as "approved" | "rejected" }
            : item
        )
      );

      toast({
        title: "Success",
        description: `Request ${actionDialog.action === "approve" ? "approved" : "rejected"} successfully.`,
      });
    } catch (error) {
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
    loadChangeRequests(pagination.page, pagination.limit);
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
              className={
                actionDialog.action === "approve" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionDialog.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}