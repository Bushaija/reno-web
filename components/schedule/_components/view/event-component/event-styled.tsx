"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-context";
import AddEventModal from "@/components/schedule/_modals/add-event-modal";
import { Event, CustomEventModal } from "@/types";
import { TrashIcon, CalendarIcon, ClockIcon, BuildingIcon, FileTextIcon } from "lucide-react";
import { useScheduler } from "@/providers/schedular-provider";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { useDeleteShift } from "@/features/shifts/api";
import { toast } from "sonner";

// Function to format date
const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Function to format time only
const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Color variants based on event type
const variantColors = {
  primary: {
    bg: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  danger: {
    bg: "bg-red-100",
    border: "border-red-200",
    text: "text-red-800",
  },
  success: {
    bg: "bg-green-100",
    border: "border-green-200",
    text: "text-green-800",
  },
  warning: {
    bg: "bg-yellow-100",
    border: "border-yellow-200",
    text: "text-yellow-800",
  },
};

interface EventStyledProps extends Event {
  minmized?: boolean;
  CustomEventComponent?: React.FC<Event>;
}

export default function EventStyled({
  event,
  onDelete,
  CustomEventModal,
}: {
  event: EventStyledProps;
  CustomEventModal?: CustomEventModal;
  onDelete?: (id: string) => void;
}) {
  const { setOpen } = useModal();
  const { handlers } = useScheduler();
  const deleteShift = useDeleteShift();

  // Check if this is a shift event (has shiftData)
  const isShiftEvent = !!event.shiftData;

  // Determine if delete button should be shown
  // Hide it for minimized events to save space, show on hover instead
  const shouldShowDeleteButton = !event?.minmized;

  // Handler function
  function handleEditEvent(event: Event) {
    // Open the modal with the content
    setOpen(
      <CustomModal title="Edit Event">
        <AddEventModal
          CustomAddEventModal={
            CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />
      </CustomModal>,
      async () => {
        return {
          ...event,
        };
      }
    );
  }

  // Get background color class based on variant
  const getBackgroundColor = (variant: string | undefined) => {
    const variantKey = variant as keyof typeof variantColors || "primary";
    const colors = variantColors[variantKey] || variantColors.primary;
    return `${colors.bg} ${colors.text} ${colors.border}`;
  };

  return (
    <div
      key={event?.id}
      className={cn(
        "w-full z-50 relative cursor-pointer border group rounded-lg flex flex-col flex-grow shadow-sm hover:shadow-md transition-shadow duration-200",
        event?.minmized ? "border-transparent" : "border-default-400/60"
      )}
    >
      {/* Delete button - shown by default for non-minimized, or on hover for minimized */}
      <Button
        onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          
          if (isShiftEvent && event.shiftData) {
            // Delete from API first
            try {
              await deleteShift.mutateAsync(event.shiftData.id);
              // Then remove from local state
              handlers.handleDeleteEvent(event?.id);
              onDelete?.(event?.id);
            } catch (error) {
              console.error('Failed to delete shift:', error);
            }
          } else {
            // Regular event deletion
            handlers.handleDeleteEvent(event?.id);
            onDelete?.(event?.id);
          }
        }}
        variant="destructive"
        size="icon"
        disabled={deleteShift.isPending}
        className={cn(
          "absolute z-[100] right-1 top-[-8px] h-6 w-6 p-0 shadow-md hover:bg-destructive/90 transition-all duration-200",
          event?.minmized ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <TrashIcon size={14} className="text-destructive-foreground" />
      </Button>

      {event.CustomEventComponent ? (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
            });
          }}
        >
          <event.CustomEventComponent {...event} />
        </div>
      ) : (
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleEditEvent({
              id: event?.id,
              title: event?.title,
              startDate: event?.startDate,
              endDate: event?.endDate,
              description: event?.description,
              variant: event?.variant,
            });
          }}
          className={cn(
            "w-full p-2 rounded",
            getBackgroundColor(event?.variant),
            event?.minmized ? "flex-grow overflow-hidden" : "min-h-fit"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="font-semibold text-xs truncate mb-1">
              {event?.title || "Untitled Event"}
            </div>
            
            {/* Show enhanced information in minimized mode */}
            {event?.minmized && (
              <div className="text-[10px] opacity-80 space-y-1">
                <div>
                  {isShiftEvent && event.shiftData?.startTime && event.shiftData?.endTime
                    ? `${event.shiftData.startTime} - ${event.shiftData.endTime}`
                    : `${formatTime(event?.startDate)} - ${formatTime(event?.endDate)}`}
                </div>
                {isShiftEvent && (
                  <div className="flex items-center gap-1">
                    <span>
                      {typeof event.shiftData?.assignedNurses === 'number' && typeof event.shiftData?.requiredNurses === 'number'
                        ? `${event.shiftData.assignedNurses}/${event.shiftData.requiredNurses}`
                        : null}
                    </span>
                    {event.shiftData?.coverageState && (
                      <Badge variant={
                        event.shiftData.coverageState === 'under' ? 'destructive' :
                        event.shiftData.coverageState === 'over' ? 'secondary' : 'outline'
                      } className="text-[9px]">
                        {event.shiftData.coverageState}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!event?.minmized && event?.description && (
              <div className="my-2 text-sm">{event?.description}</div>
            )}
            
            {/* Show shift-specific information */}
            {!event?.minmized && isShiftEvent && event.shiftData && (
              <div className="text-xs space-y-2 mt-2">
                {/* Department and shift type */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <BuildingIcon className="mr-1 h-3 w-3" />
                    <span className="font-medium">{event.shiftData.departmentName || (event.shiftData.departmentId ? `Dept ${event.shiftData.departmentId}` : 'Department')}</span>
                  </div>
                  {event.shiftData.shiftType && (
                    <Badge variant="outline" className="text-[10px]">{String(event.shiftData.shiftType)}</Badge>
                  )}
                  {event.shiftData.multiDay && (
                    <Badge variant="secondary" className="text-[10px]">Multi-day</Badge>
                  )}
                </div>

                {/* Timing Information */}
                {event.shiftData.startTime && event.shiftData.endTime && (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <ClockIcon className="mr-1 h-3 w-3" />
                      <span>{event.shiftData.startTime} - {event.shiftData.endTime}</span>
                    </div>
                    {event.shiftData.duration && (
                      <div className="flex items-center text-[10px] opacity-80">
                        <span>Duration: {event.shiftData.duration}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Staffing coverage */}
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-[10px]',
                    event.shiftData.coverageState === 'under' ? 'bg-red-100 text-red-800' :
                    event.shiftData.coverageState === 'over' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  )}>
                    {`${event.shiftData.assignedNurses ?? 0}/${event.shiftData.requiredNurses ?? 0}`}
                  </Badge>
                  {typeof event.shiftData.coverageDelta === 'number' && event.shiftData.coverageDelta !== 0 && (
                    <span className="text-[10px] opacity-80">{event.shiftData.coverageDelta > 0 ? `+${event.shiftData.coverageDelta}` : `${event.shiftData.coverageDelta}`}</span>
                  )}
                </div>

                {/* Patient ratio */}
                {event.shiftData.patientRatioTarget && (
                  <div className="text-[10px] opacity-80">Patient ratio target: {event.shiftData.patientRatioTarget}</div>
                )}

                {/* Required skills */}
                {Array.isArray(event.shiftData.requiredSkills) && event.shiftData.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {event.shiftData.requiredSkills.map((s: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[10px]">{String(s)}</Badge>
                    ))}
                  </div>
                )}

                {/* Status / Auto / Priority and Notes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {event.shiftData.status && (
                      <Badge 
                        variant={
                          event.shiftData.status === 'cancelled' ? 'destructive' :
                          event.shiftData.status === 'understaffed' ? 'destructive' :
                          event.shiftData.status === 'scheduled' ? 'default' : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {String(event.shiftData.status).replace('_', ' ')}
                      </Badge>
                    )}
                    {event.shiftData.autoGenerated && (
                      <Badge variant="secondary" className="text-[10px]">Auto</Badge>
                    )}
                    {typeof event.shiftData.priorityScore === 'number' && event.shiftData.priorityScore > 0 && (
                      <Badge variant="outline" className="text-[10px]">Priority: {event.shiftData.priorityScore}</Badge>
                    )}
                  </div>
                  {event.shiftData.notes && (
                    <div className="flex items-center text-[10px] opacity-80 max-w-[140px] truncate" title={event.shiftData.notes}>
                      <FileTextIcon className="mr-1 h-3 w-3" />
                      <span className="truncate">{event.shiftData.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Show regular event information for non-shift events */}
            {!event?.minmized && !isShiftEvent && (
              <div className="text-xs space-y-1 mt-2">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {formatDate(event?.startDate)}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  {formatDate(event?.endDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
