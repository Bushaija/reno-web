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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useCreateTimeOffRequest } from "@/hooks/useTimeOffRequests";
import { toast } from "sonner";

interface CreateTimeOffRequestDialogProps {
  onSuccess?: () => void;
}

export function CreateTimeOffRequestDialog({ onSuccess }: CreateTimeOffRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    worker_id: "",
    start_date: "",
    end_date: "",
    request_type: "vacation" as const,
    reason: "",
  });

  const createRequest = useCreateTimeOffRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.worker_id || !formData.start_date || !formData.end_date || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error("End date must be after start date");
      return;
    }

    if (formData.reason.length < 10) {
      toast.error("Reason must be at least 10 characters long");
      return;
    }

    try {
      const payload = {
        worker_id: Number(formData.worker_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        request_type: formData.request_type,
        reason: formData.reason,
      }
      console.log("payload", payload);
      await createRequest.mutateAsync(payload);

      toast.success("Time-off request created successfully!");
      setOpen(false);
      resetForm();
      onSuccess?.();
         } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "Failed to create time-off request";
       toast.error(errorMessage);
       console.error("Error creating time-off request:", error);
       
       // Log additional debugging information
       console.log("Form data that was submitted:", formData);
       console.log("Payload that was sent:", {
         worker_id: Number(formData.worker_id),
         start_date: formData.start_date,
         end_date: formData.end_date,
         request_type: formData.request_type,
         reason: formData.reason,
       });
     }
  };

  const resetForm = () => {
    setFormData({
      worker_id: "",
      start_date: "",
      end_date: "",
      request_type: "vacation",
      reason: "",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Time-Off Request</DialogTitle>
          <DialogDescription>
            Submit a new time-off request. Please fill in all required fields.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="worker_id">Nurse ID *</Label>
              <Input
                id="worker_id"
                type="number"
                placeholder="Enter nurse ID"
                value={formData.worker_id}
                onChange={(e) => setFormData(prev => ({ ...prev, worker_id: e.target.value }))}
                required
              />
              <div className="text-xs text-gray-500">
                Enter the ID of the nurse requesting time off
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type *</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, request_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                  <SelectItem value="jury_duty">Jury Duty</SelectItem>
                  <SelectItem value="military">Military</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your time-off request..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              maxLength={1000}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.reason.length}/1000 characters
            </div>
          </div>

          {/* Days Requested Summary */}
          {formData.start_date && formData.end_date && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Request Summary</div>
              <div className="text-xs text-gray-600 mt-1">
                {(() => {
                  const startDate = new Date(formData.start_date);
                  const endDate = new Date(formData.end_date);
                  const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return `${daysRequested} day${daysRequested !== 1 ? 's' : ''} requested`;
                })()}
              </div>
            </div>
          )}

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
              disabled={createRequest.isPending}
            >
              {createRequest.isPending ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
