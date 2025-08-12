"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useUpdateTimeOffRequest, type TimeOffRequest } from "@/hooks/useTimeOffRequests";
import { toast } from "sonner";

interface UpdateTimeOffRequestDialogProps {
  request: TimeOffRequest;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function UpdateTimeOffRequestDialog({ 
  request, 
  onSuccess, 
  trigger 
}: UpdateTimeOffRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: request.status,
    admin_notes: "",
    reason: request.reason || "",
  });

  const updateRequest = useUpdateTimeOffRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.status) {
      toast.error("Please select a status");
      return;
    }

    try {
      const payload = {
        id: request.request_id,
        updates: {
          status: formData.status,
          admin_notes: formData.admin_notes || undefined,
          reason: formData.reason || undefined,
        },
      }
      console.log("payload action", payload);
      
      // Validate the payload before sending
      if (!formData.status) {
        toast.error("Status is required");
        return;
      }
      
      // Only send fields that have values
      const cleanUpdates: any = { status: formData.status };
      if (formData.admin_notes && formData.admin_notes.trim()) {
        cleanUpdates.admin_notes = formData.admin_notes.trim();
      }
      if (formData.reason && formData.reason.trim()) {
        cleanUpdates.reason = formData.reason.trim();
      }
      
      console.log("Clean updates payload:", cleanUpdates);
      
      await updateRequest.mutateAsync({
        id: request.request_id,
        updates: cleanUpdates,
      });

      toast.success("Time-off request updated successfully!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update time-off request";
      toast.error(errorMessage);
      console.error("Error updating time-off request:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      status: request.status,
      admin_notes: "",
      reason: request.reason || "",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Time-Off Request Status</DialogTitle>
          <DialogDescription>
            Update the status and add admin notes for this time-off request.
          </DialogDescription>
        </DialogHeader>
        
        {/* Request Summary */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              {request.nurse.name} - {request.request_type}
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="ml-1">{request.status.toUpperCase()}</span>
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <div>Request ID: {request.request_id}</div>
            <div>Dates: {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</div>
            <div>Reason: {request.reason || 'No reason provided'}</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_notes">Admin Notes</Label>
            <Textarea
              id="admin_notes"
              placeholder="Add any administrative notes or comments..."
              value={formData.admin_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.admin_notes.length}/500 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Updated Reason</Label>
            <Textarea
              id="reason"
              placeholder="Update the reason if needed..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={2}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.reason.length}/1000 characters
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateRequest.isPending}
            >
              {updateRequest.isPending ? "Updating..." : "Update Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
