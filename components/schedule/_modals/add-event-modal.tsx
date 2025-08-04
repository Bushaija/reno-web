"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useModal } from "@/providers/modal-context";
import SelectDate from "@/components/schedule/_components/add-event-components/select-date";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormData, eventSchema, Variant, Event } from "@/types/index";
import { useScheduler } from "@/providers/schedular-provider";
import { v4 as uuidv4 } from "uuid"; // Use UUID to generate event IDs
import { useCreateShift } from "@/features/shifts/api";
import { useUsers } from "@/features/users/api";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddEventModal({
  CustomAddEventModal,
}: {
  CustomAddEventModal?: React.FC<{ register: any; errors: any }>;
}) {
  const { setClose, data } = useModal();
  const createShift = useCreateShift();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  
  // Fetch healthcare workers for the dropdown
  const { data: usersData } = useUsers({ 
    role: "healthcare_worker",
    limit: "100" // Get all workers
  });
  
  const healthcareWorkers = usersData?.users || [];

  const [selectedColor, setSelectedColor] = useState<string>(
    getEventColor(data?.variant || "primary")
  );

  const typedData = data as { default: Event };

  const { handlers } = useScheduler();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      variant: data?.variant || "primary",
      color: data?.color || "blue",
    },
  });

  // Reset the form on initialization
  useEffect(() => {
    if (data?.default) {
      const eventData = data?.default;
      reset({
        title: eventData.title,
        description: eventData.description || "",
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        variant: eventData.variant || "primary",
        color: eventData.color || "blue",
      });
    }
  }, [data, reset]);

  const colorOptions = [
    { key: "blue", name: "Blue" },
    { key: "red", name: "Red" },
    { key: "green", name: "Green" },
    { key: "yellow", name: "Yellow" },
  ];

  function getEventColor(variant: Variant) {
    switch (variant) {
      case "primary":
        return "blue";
      case "danger":
        return "red";
      case "success":
        return "green";
      case "warning":
        return "yellow";
      default:
        return "blue";
    }
  }

  function getEventStatus(color: string) {
    switch (color) {
      case "blue":
        return "primary";
      case "red":
        return "danger";
      case "green":
        return "success";
      case "yellow":
        return "warning";
      default:
        return "default";
    }
  }

  const getButtonVariant = (color: string) => {
    switch (color) {
      case "blue":
        return "default";
      case "red":
        return "destructive";
      case "green":
        return "success";
      case "yellow":
        return "warning";
      default:
        return "default";
    }
  };

  const onSubmit: SubmitHandler<EventFormData> = async (formData) => {
    try {
      if (!selectedWorkerId) {
        toast.error("Please select a healthcare worker");
        return;
      }

      // Validate that end time is after start time
      if (formData.endDate <= formData.startDate) {
        toast.error("End time must be after start time");
        return;
      }

      // Create shift data for API
      const shiftData = {
        workerId: parseInt(selectedWorkerId),
        startTime: formData.startDate.toISOString(),
        endTime: formData.endDate.toISOString(),
        department: formData.title,
        maxStaff: 1, // TODO: This could be made configurable
        notes: formData.description,
        status: "scheduled" as const,
      };

      // Create shift via API
      const result = await createShift.mutateAsync(shiftData);

      // The calendar will automatically refetch and update via the API
      // No need to manually add to local state since we're using API data
      
      // Show success message with formatted dates
      const startTimeFormatted = format(formData.startDate, "MMM dd, yyyy 'at' h:mm a");
      const endTimeFormatted = format(formData.endDate, "MMM dd, yyyy 'at' h:mm a");
      toast.success(`Shift created successfully! ${startTimeFormatted} - ${endTimeFormatted}`);
      setClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error creating shift:", error);
      toast.error("Failed to create shift. Please try again.");
    }
  };

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit(onSubmit)}>
      {CustomAddEventModal ? (
        <CustomAddEventModal register={register} errors={errors} />
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="worker">Healthcare Worker</Label>
            <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a healthcare worker" />
              </SelectTrigger>
              <SelectContent>
                {healthcareWorkers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id.toString()}>
                    {worker.name} - {worker.profile?.employeeId || 'No ID'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Department</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter department name"
              className={cn(errors.title && "border-red-500")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
            />
          </div>

          <SelectDate
            data={{
              startDate: data?.default?.startDate || new Date(),
              endDate: data?.default?.endDate || new Date(),
            }}
            setValue={setValue}
          />

          <div className="grid gap-2">
            <Label>Color</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={getButtonVariant(selectedColor)}
                  className="w-fit my-2"
                >
                  {
                    colorOptions.find((color) => color.key === selectedColor)
                      ?.name
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {colorOptions.map((color) => (
                  <DropdownMenuItem
                    key={color.key}
                    onClick={() => {
                      setSelectedColor(color.key);
                      setValue("variant", getEventStatus(color.key));
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        style={{
                          backgroundColor: `var(--${color.key})`,
                        }}
                        className={`w-4 h-4 rounded-full mr-2`}
                      />
                      {color.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createShift.isPending}>
              {createShift.isPending ? "Creating..." : "Save Shift"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
