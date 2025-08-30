// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, CalendarDaysIcon } from "lucide-react";
import { BsCalendarMonth, BsCalendarWeek } from "react-icons/bs";

// import CreateShiftForm from "@/components/api-forms/create-shift-form";
import DailyView from "./day/daily-view";
import MonthView from "./month/month-view";
import WeeklyView from "./week/week-view";
import { useModal } from "@/providers/modal-context";
import { ClassNames, CustomComponents, Views } from "@/types/index";
import { cn } from "@/lib/utils";
import CustomModal from "@/components/ui/custom-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AutoGenerateForm from "@/components/api-forms/auto-generate-form";
import CreateShiftForm from "@/components/api-forms/create-shift-form";
import { useAutoCreateShifts } from '@/features/shifts/api';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDepartments } from '@/hooks/use-departments';
import { useGetSkills } from '@/components/features/staff/availability/skills/api/useGetSkills';

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
  const [openAutoDialog, setOpenAutoDialog] = useState(false);
  const [openAutoShiftDialog, setOpenAutoShiftDialog] = useState(false);

  // Auto-shift form state
  const [autoShiftForm, setAutoShiftForm] = useState({
    departmentName: '',
    startDate: '',
    endDate: '',
    shiftTypes: [],
    requiredNurses: 1,
    requiredSkillNames: [],
    patientRatioTarget: '',
    notes: '',
  });
  const autoCreateShifts = useAutoCreateShifts();

  // Fetch departments and skills
  const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments();
  const { data: skillsData, isLoading: isLoadingSkills } = useGetSkills();

  console.log("skillsData", skillsData);

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
        <CreateShiftForm />
      </CustomModal>
    );
  }

  function handleAutoShiftSubmit(e) {
    e.preventDefault();
    console.groupCollapsed('%c[AutoCreateShifts] Submit','color:#0ea5e9');
    try {
      // Map department name to ID
      const departmentsArr = departmentsData?.data || [];
      const department = departmentsArr.find(
        (d) => d.deptName === autoShiftForm.departmentName
      );
      // Map skill names to IDs
      const selectedSkillNames = autoShiftForm.requiredSkillNames || [];
      const skillsArr = skillsData || [];
      const skillIds = skillsArr
        .filter((s) => selectedSkillNames.includes(s.skill_name))
        .map((s) => s.skill_id);

      const payload = {
        departmentId: department?.deptId,
        startDate: autoShiftForm.startDate,
        endDate: autoShiftForm.endDate,
        shiftTypes: autoShiftForm.shiftTypes,
        requiredNurses: Number(autoShiftForm.requiredNurses),
        requiredSkills: skillIds,
        patientRatioTarget: autoShiftForm.patientRatioTarget ? Number(autoShiftForm.patientRatioTarget) : undefined,
        notes: autoShiftForm.notes,
      };


      // Debug logs
      console.debug('[AutoCreateShifts] Form state:', JSON.parse(JSON.stringify(autoShiftForm)));
      console.debug('[AutoCreateShifts] Departments count:', departmentsArr.length);
      console.debug('[AutoCreateShifts] Selected department by name:', autoShiftForm.departmentName, '=> mapped:', department);
      console.debug('[AutoCreateShifts] Skills count:', skillsArr.length);
      console.debug('[AutoCreateShifts] Selected skill names:', selectedSkillNames);
      console.debug('[AutoCreateShifts] Mapped skill IDs:', skillIds);
      console.debug('[AutoCreateShifts] Payload to API:', payload);

      // Deep diagnostics: compare current payload to expected schema
      (function debugExpectedVsActual() {
        console.groupCollapsed('%c[AutoCreateShifts] Payload vs Expected Schema','color:#f59e0b');
        const expectedExample = {
          departmentId: 1,
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          shiftTypes: ['day', 'night', 'weekend'],
          requiredNurses: 2,
          requiredSkills: [1, 2],
          patientRatioTarget: 1,
          notes: 'Auto-generated',
        } as const;

        const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
        const allowedShiftTypes = new Set(['day','night','weekend','holiday']);

        // Field-by-field type and value checks
        const checks: Record<string, { expected: string; actual: string; ok: boolean; detail?: any }> = {};
        const addCheck = (key: string, expected: string, actualVal: any, ok: boolean, detail?: any) => {
          checks[key] = { expected, actual: typeof actualVal, ok, detail };
        };

        addCheck('departmentId', 'number(int)', payload.departmentId, Number.isInteger(payload.departmentId));
        addCheck('startDate', 'string(YYYY-MM-DD)', payload.startDate, typeof payload.startDate === 'string' && dateOnlyRegex.test(payload.startDate), { value: payload.startDate });
        addCheck('endDate', 'string(YYYY-MM-DD)', payload.endDate, typeof payload.endDate === 'string' && dateOnlyRegex.test(payload.endDate), { value: payload.endDate });
        addCheck('requiredNurses', 'number(int>=1)', payload.requiredNurses, Number.isInteger(payload.requiredNurses) && payload.requiredNurses >= 1, { value: payload.requiredNurses });

        // shiftTypes array check
        const shiftTypesOk = Array.isArray(payload.shiftTypes)
          && payload.shiftTypes.length > 0
          && payload.shiftTypes.every((s: any) => typeof s === 'string' && allowedShiftTypes.has(s));
        addCheck('shiftTypes', "string[] in {'day','night','weekend','holiday'}", payload.shiftTypes, shiftTypesOk, { value: payload.shiftTypes });

        // requiredSkills array check (optional but when present must be integer[])
        const reqSkillsProvided = Array.isArray(payload.requiredSkills) && payload.requiredSkills.length > 0;
        const reqSkillsOk = !reqSkillsProvided || payload.requiredSkills.every((n: any) => Number.isInteger(n));
        addCheck('requiredSkills', 'number[int][] (optional)', payload.requiredSkills, reqSkillsOk, { value: payload.requiredSkills });

        // patientRatioTarget optional number
        const prt = payload.patientRatioTarget;
        const prtOk = prt === undefined || (typeof prt === 'number' && !Number.isNaN(prt));
        addCheck('patientRatioTarget', 'number (optional)', prt, prtOk, { value: prt });

        addCheck('notes', 'string (optional)', payload.notes, payload.notes === undefined || typeof payload.notes === 'string', { value: payload.notes });

        // Summarize differences
        const diffs = Object.entries(checks)
          .filter(([, v]) => !v.ok)
          .map(([k, v]) => ({ field: k, expected: v.expected, actualType: v.actual, detail: v.detail }));

        console.table(checks);
        if (diffs.length) {
          console.warn('[AutoCreateShifts] Differences found vs expected schema:', diffs);
        } else {
          console.info('[AutoCreateShifts] Payload matches expected schema types');
        }

        // Extra: raw type snapshot
        console.debug('[AutoCreateShifts] typeof snapshot', {
          departmentId: typeof payload.departmentId,
          startDate: typeof payload.startDate,
          endDate: typeof payload.endDate,
          shiftTypes: Array.isArray(payload.shiftTypes) ? 'array' : typeof payload.shiftTypes,
          requiredNurses: typeof payload.requiredNurses,
          requiredSkills: Array.isArray(payload.requiredSkills) ? 'array' : typeof payload.requiredSkills,
          patientRatioTarget: typeof payload.patientRatioTarget,
          notes: typeof payload.notes,
        });

        console.groupEnd();
      })();

      // Client-side validations to avoid 422s
      const errors: string[] = [];
      if (!payload.departmentId) errors.push('Please select a valid department');
      if (!payload.startDate) errors.push('Start date is required');
      if (!payload.endDate) errors.push('End date is required');
      if (payload.startDate && payload.endDate && payload.startDate > payload.endDate) {
        errors.push('End date must be on or after start date');
      }
      if (!Array.isArray(payload.shiftTypes) || payload.shiftTypes.length === 0) {
        errors.push('Select at least one shift type');
      }
      if (Number.isNaN(payload.requiredNurses) || payload.requiredNurses < 1) {
        errors.push('Required nurses must be at least 1');
      }
      if (payload.patientRatioTarget !== undefined && Number.isNaN(payload.patientRatioTarget)) {
        errors.push('Patient ratio target must be a number');
      }

      if (errors.length) {
        console.warn('[AutoCreateShifts] Client validation failed:', errors, 'Payload:', payload);
        toast.error(errors[0]);
        return;
      }

      autoCreateShifts.mutate(payload, {
        onSuccess: (data) => {
          console.info('[AutoCreateShifts] Success response:', data);
          toast.success(data?.message || 'Shifts created successfully!');
          setOpenAutoShiftDialog(false);
          setAutoShiftForm({
            departmentName: '',
            startDate: '',
            endDate: '',
            shiftTypes: [],
            requiredNurses: 1,
            requiredSkillNames: [],
            patientRatioTarget: '',
            notes: '',
          });
        },
        onError: (err) => {
          // Try to surface backend validation details if present
          const maybeResponse = err?.response || err?.cause || err;
          console.error('[AutoCreateShifts] Error:', err);
          if (maybeResponse?.data) console.error('[AutoCreateShifts] Error data:', maybeResponse.data);
          if (maybeResponse?.status) console.error('[AutoCreateShifts] HTTP status:', maybeResponse.status);
          toast.error(err?.message || 'Failed to create shifts');
        },
      });
    } catch (ex) {
      console.error('[AutoCreateShifts] Unexpected exception before request:', ex);
      toast.error('Failed to prepare auto-create payload');
    } finally {
      console.groupEnd();
    }
  }

  function handleShiftTypeChange(type) {
    setAutoShiftForm((prev) => {
      const exists = prev.shiftTypes.includes(type);
      return {
        ...prev,
        shiftTypes: exists
          ? prev.shiftTypes.filter((t) => t !== type)
          : [...prev.shiftTypes, type],
      };
    });
  }

  function handleSkillNameChange(skillName) {
    setAutoShiftForm((prev) => {
      const exists = prev.requiredSkillNames.includes(skillName);
      return {
        ...prev,
        requiredSkillNames: exists
          ? prev.requiredSkillNames.filter((n) => n !== skillName)
          : [...prev.requiredSkillNames, skillName],
      };
    });
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
                {/* Auto-shift button */}
                <Button
                  onClick={() => setOpenAutoShiftDialog(true)}
                  variant="outline"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Auto-shift
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

      {/* Auto-shift Dialog */}
      <Dialog open={openAutoShiftDialog} onOpenChange={setOpenAutoShiftDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Auto-create Shifts</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAutoShiftSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Department</label>
              <select
                value={autoShiftForm.departmentName}
                onChange={e => setAutoShiftForm(f => ({ ...f, departmentName: e.target.value }))}
                required
                className="w-full border rounded px-2 py-1"
                disabled={isLoadingDepartments}
              >
                <option value="">Select department</option>
                {(departmentsData?.data || []).map((dept) => (
                  <option key={dept.deptId} value={dept.deptName}>{dept.deptName}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={autoShiftForm.startDate}
                  onChange={e => setAutoShiftForm(f => ({ ...f, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={autoShiftForm.endDate}
                  onChange={e => setAutoShiftForm(f => ({ ...f, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Shift Types</label>
              <div className="flex gap-2 flex-wrap">
                {['day', 'night', 'weekend', 'holiday'].map(type => (
                  <label key={type} className="flex items-center gap-1">
                    <Checkbox
                      checked={autoShiftForm.shiftTypes.includes(type)}
                      onCheckedChange={() => handleShiftTypeChange(type)}
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Required Nurses</label>
              <Input
                type="number"
                min={1}
                value={autoShiftForm.requiredNurses}
                onChange={e => setAutoShiftForm(f => ({ ...f, requiredNurses: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Required Skills</label>
              <div className="flex gap-2 flex-wrap">
                {(skillsData || []).map(skill => (
                  <label key={skill.skillId} className="flex items-center gap-1">
                    <Checkbox
                      checked={autoShiftForm.requiredSkillNames.includes(skill.skill_name)}
                      onCheckedChange={() => handleSkillNameChange(skill.skill_name)}
                    />
                    <span>{skill.skill_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Patient Ratio Target</label>
              <Input
                type="number"
                value={autoShiftForm.patientRatioTarget}
                onChange={e => setAutoShiftForm(f => ({ ...f, patientRatioTarget: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <Input
                type="text"
                value={autoShiftForm.notes}
                onChange={e => setAutoShiftForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={autoCreateShifts.isPending}>
                {autoCreateShifts.isPending ? 'Creating...' : 'Create Shifts'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Existing Auto-generate Dialog */}
      <Dialog open={openAutoDialog} onOpenChange={setOpenAutoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Schedule</DialogTitle>
          </DialogHeader>
          <AutoGenerateForm onSuccess={() => setOpenAutoDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
