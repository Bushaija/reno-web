"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CalendarDaysIcon } from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek } from "react-icons/bs";

import AddEventModal from "../../_modals/add-event-modal";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Animation settings for Framer Motion
const animationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, type: "spring" as const, stiffness: 250 },
};

export default function SchedulerViewFilteration({
  views = {
    views: ["day", "week", "month"],
    mobileViews: ["day"],
  },
  stopDayEventSummary = false,
  CustomComponents,
  classNames,
}: {
  views?: Views;
  stopDayEventSummary?: boolean;
  CustomComponents?: CustomComponents;
  classNames?: ClassNames;
}) {
  const { setOpen } = useModal();
  const [activeView, setActiveView] = useState<string>("day");
  const [clientSide, setClientSide] = useState(false);
  const [openAutoDialog, setOpenAutoDialog] = useState(false)

  console.log("activeView", activeView);

  useEffect(() => {
    setClientSide(true);
  }, []);

  const [isMobile, setIsMobile] = useState(
    clientSide ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    if (!clientSide) return;
    setIsMobile(window.innerWidth <= 768);
    function handleResize() {
      if (window && window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    window && window.addEventListener("resize", handleResize);

    return () => window && window.removeEventListener("resize", handleResize);
  }, [clientSide]);

  function handleAddEvent(selectedDay?: number) {
    // Create the modal content with proper data
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      selectedDay ?? new Date().getDate(),
      0,
      0,
      0,
      0
    );

    const endDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      selectedDay ?? new Date().getDate(),
      23,
      59,
      59,
      999
    );

    // Create a wrapper component to handle data passing
    const ModalWrapper = () => {
      const title =
        CustomComponents?.CustomEventModal?.CustomAddEventModal?.title ||
        "Add Shift";

      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        </div>
      );
    };

    // Open the modal with the content
    setOpen(
      <CustomModal title="Add Shift">
        <AddEventModal
          CustomAddEventModal={
            CustomComponents?.CustomEventModal?.CustomAddEventModal?.CustomForm
          }
        />{" "}
      </CustomModal>
    );
  }

  const viewsSelector = isMobile ? views?.mobileViews : views?.views;

  // Set initial active view
  useEffect(() => {
    if (viewsSelector?.length) {
      setActiveView(viewsSelector[0]);
    }
  }, []);

  function handleAutoScheduleEvent() {
    setOpenAutoDialog(true)
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div className="dayly-weekly-monthly-selection relative w-full">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className={cn("w-full", classNames?.tabs)}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList className="grid grid-cols-3">
                {viewsSelector?.includes("day") && (
                  <TabsTrigger value="day">
                    {CustomComponents?.customTabs?.CustomDayTab ? (
                      CustomComponents.customTabs.CustomDayTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon size={15} />
                        <span>Day</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("week") && (
                  <TabsTrigger value="week">
                    {CustomComponents?.customTabs?.CustomWeekTab ? (
                      CustomComponents.customTabs.CustomWeekTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarWeek />
                        <span>Week</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}

                {viewsSelector?.includes("month") && (
                  <TabsTrigger value="month">
                    {CustomComponents?.customTabs?.CustomMonthTab ? (
                      CustomComponents.customTabs.CustomMonthTab
                    ) : (
                      <div className="flex items-center space-x-2">
                        <BsCalendarMonth />
                        <span>Month</span>
                      </div>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex items-center gap-4">
              {/* Auto-schedule button */}
              <Button 
              onClick={() => handleAutoScheduleEvent()}
              variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Auto-schedule
              </Button>

              {/* Add Shift Button */}
              {CustomComponents?.customButtons?.CustomAddEventButton ? (
                <div onClick={() => handleAddEvent()}>
                  {CustomComponents?.customButtons.CustomAddEventButton}
                </div>
              ) : (
                <Button
                  onClick={() => handleAddEvent()}
                  className={classNames?.buttons?.addEvent}
                  variant="default"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              )}
              </div>
            </div>

            {viewsSelector?.includes("day") && (
              <TabsContent value="day">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <DailyView
                      stopDayEventSummary={stopDayEventSummary}
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes("week") && (
              <TabsContent value="week">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <WeeklyView
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}

            {viewsSelector?.includes("month") && (
              <TabsContent value="month">
                <AnimatePresence mode="wait">
                  <motion.div {...animationConfig}>
                    <MonthView
                      classNames={classNames?.buttons}
                      prevButton={
                        CustomComponents?.customButtons?.CustomPrevButton
                      }
                      nextButton={
                        CustomComponents?.customButtons?.CustomNextButton
                      }
                      CustomEventComponent={
                        CustomComponents?.CustomEventComponent
                      }
                      CustomEventModal={CustomComponents?.CustomEventModal}
                    />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <Dialog open={openAutoDialog} onOpenChange={setOpenAutoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Schedule</DialogTitle>
          </DialogHeader>

          {/* Date Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">From</Label>
                <Input id="startDate" type="date" defaultValue="2024-03-20" />
              </div>
              <div>
                <Label htmlFor="endDate">To</Label>
                <Input id="endDate" type="date" defaultValue="2024-04-05" />
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium">Departments</h3>
            <div className="flex flex-wrap gap-4">
              <Label className="flex items-center gap-2">
                <Checkbox defaultChecked />
                ICU
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox defaultChecked />
                Emergency
              </Label>
              <Label className="flex items-center gap-2">
                <Checkbox />
                Med/Surg
              </Label>
            </div>
          </div>

          {/* Scheduling Priorities */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium">Scheduling Priorities</h3>
            <div className="border rounded-md max-h-40 overflow-y-auto p-4 space-y-2 bg-muted/10">
              {[
                "Respect nurse preferences",
                "Balance workload fairly",
                "Minimize overtime costs",
                "Ensure fair day/night rotation",
                "Consider fatigue scores",
                "Prioritize seniority",
              ].map((priority, idx) => (
                <Label key={idx} className="flex items-center gap-2">
                  <Checkbox defaultChecked={idx < 5} />
                  {priority}
                </Label>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-2 pt-4">
            <h3 className="text-sm font-medium">Constraints</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxConsecutive">Max consecutive shifts (days)</Label>
                <Input id="maxConsecutive" type="number" defaultValue={3} min={1} />
              </div>
              <div>
                <Label htmlFor="minRest">Min rest between shifts (hours)</Label>
                <Input id="minRest" type="number" defaultValue={8} min={1} />
              </div>
              <div>
                <Label htmlFor="maxWeekly">Max weekly hours</Label>
                <Input id="maxWeekly" type="number" defaultValue={48} min={1} />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button variant="outline" onClick={() => {/* preview logic */}}>
              Preview Schedule
            </Button>
            <Button
              onClick={() => {
                /* generate logic */
                setOpenAutoDialog(false)
              }}
            >
              Generate & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
