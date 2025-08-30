"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Calendar, User, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChangeRequest } from "@/components/data-table/resources/change-request.types"

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to format time only
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get status color and icon
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        icon: Clock,
        label: "Pending"
      };
    case "approved":
      return {
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: CheckCircle,
        label: "Approved"
      };
    case "rejected":
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: XCircle,
        label: "Rejected"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        icon: Clock,
        label: status
      };
  }
};

// Helper function to get priority based on time since submission
const getUrgencyLevel = (submittedAt: string) => {
  const submitted = new Date(submittedAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 7) return { level: "high", color: "text-red-600", label: "High Priority" };
  if (daysDiff >= 3) return { level: "medium", color: "text-yellow-600", label: "Medium Priority" };
  return { level: "low", color: "text-green-600", label: "Low Priority" };
};

interface ChangeRequestColumnsProps {
  onView?: (request: ChangeRequest) => void;
  onApprove?: (request: ChangeRequest) => void;
  onReject?: (request: ChangeRequest) => void;
  onReviewDetails?: (request: ChangeRequest) => void;
}

export const createChangeRequestColumns = ({ 
  onView, 
  onApprove, 
  onReject, 
  onReviewDetails 
}: ChangeRequestColumnsProps = {}): ColumnDef<ChangeRequest>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Request ID",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    id: "requester.name",
    accessorKey: "requester.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <User className="mr-2 h-4 w-4" />
          Requester
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{request.requester.name}</div>
          <div className="text-sm text-muted-foreground">
            ID: {request.requester.employeeId}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "shift.department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Building className="mr-2 h-4 w-4" />
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const request = row.original;
      return (
        <Badge variant="outline" className="font-medium">
          {request.shift.department}
        </Badge>
      );
    },
  },
  {
    accessorKey: "shift",
    header: "Shift Details",
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Calendar className="mr-1 h-3 w-3" />
            <span className="font-medium">Shift #{request.shift.id}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatTime(request.shift.startTime)} - {formatTime(request.shift.endTime)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      const truncatedReason = reason.length > 50 ? `${reason.substring(0, 50)}...` : reason;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate text-sm cursor-help">
                {truncatedReason}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p className="whitespace-normal">{reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusConfig = getStatusConfig(status);
      const StatusIcon = statusConfig.icon;
      
      return (
        <Badge className={statusConfig.color}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusConfig.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const submittedAt = row.getValue("submittedAt") as string;
      const urgency = getUrgencyLevel(submittedAt);
      
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {formatDateTime(submittedAt)}
          </div>
          <div className={`text-xs ${urgency.color}`}>
            {urgency.label}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const request = row.original;
      const isPending = request.status === "pending";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(request.id.toString())}
            >
              Copy request ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {onView && (
              <DropdownMenuItem onClick={() => onView(request)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
            )}
            
            {onReviewDetails && (
              <DropdownMenuItem onClick={() => onReviewDetails(request)}>
                <Calendar className="mr-2 h-4 w-4" />
                Review shift details
              </DropdownMenuItem>
            )}
            
            {isPending && (
              <>
                <DropdownMenuSeparator />
                {onApprove && (
                  <DropdownMenuItem 
                    onClick={() => onApprove(request)}
                    className="text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve request
                  </DropdownMenuItem>
                )}
                {onReject && (
                  <DropdownMenuItem 
                    onClick={() => onReject(request)}
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject request
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
