"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays, format } from "date-fns"
import type { ReportRequest } from "@/hooks/use-outcome-report"

interface ExportReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (reportRequest: ReportRequest) => void
  isLoading?: boolean
}

export function ExportReportModal({ open, onOpenChange, onExport, isLoading }: ExportReportModalProps) {
  const [formData, setFormData] = React.useState<ReportRequest>({
    reportType: "shifts",
    format: "Excel",
    title: "",
    filters: {
      dateRange: {
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      },
      nurses: {},
      shifts: {},
      assignmentStatus: [],
    },
    options: {
      includeMetrics: true,
      includeCosts: false,
      includeCompliance: false,
      groupBy: "department",
      sortBy: "date",
      sortOrder: "desc",
    },
    saveReport: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const title = formData.title || `Staff Report - ${format(new Date(formData.filters.dateRange.startDate), "MMM yyyy")}`
    onExport({ ...formData, title })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Report Configuration</DialogTitle>
          <DialogDescription>Configure the filters and options for your staff report export.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={formData.reportType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, reportType: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shifts">Shifts</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="workload">Workload</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={formData.format} onValueChange={(value: any) => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Report Title</Label>
                  <Input
                    placeholder="Enter report title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="text-sm text-muted-foreground">
                  Current range: {formData.filters.dateRange.startDate} to {formData.filters.dateRange.endDate}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.filters.dateRange.startDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        dateRange: { ...prev.filters.dateRange, startDate: e.target.value }
                      }
                    }))}
                  />
                  <Input
                    type="date"
                    value={formData.filters.dateRange.endDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        dateRange: { ...prev.filters.dateRange, endDate: e.target.value }
                      }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Shift Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["day", "night", "evening", "weekend", "holiday", "on_call", "float"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shift-${type}`}
                        checked={formData.filters.shifts?.shiftTypes?.includes(type)}
                        onCheckedChange={(checked) => {
                          const currentTypes = formData.filters.shifts?.shiftTypes || []
                          const newTypes = checked ? [...currentTypes, type] : currentTypes.filter(t => t !== type)
                          setFormData(prev => ({
                            ...prev,
                            filters: { ...prev.filters, shifts: { ...prev.filters.shifts, shiftTypes: newTypes } }
                          }))
                        }}
                      />
                      <Label htmlFor={`shift-${type}`} className="text-sm font-normal capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-medium">Assignment Status</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {["assigned", "completed", "cancelled", "no_show", "partially_completed"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignment-${status}`}
                        checked={formData.filters.assignmentStatus?.includes(status)}
                        onCheckedChange={(checked) => {
                          const currentStatuses = formData.filters.assignmentStatus || []
                          const newStatuses = checked ? [...currentStatuses, status] : currentStatuses.filter(s => s !== status)
                          setFormData(prev => ({ ...prev, filters: { ...prev.filters, assignmentStatus: newStatuses } }))
                        }}
                      />
                      <Label htmlFor={`assignment-${status}`} className="text-sm font-normal capitalize">
                        {status.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Include in Report</Label>
                  <div className="space-y-2">
                    {[
                      { id: "includeMetrics", label: "Include Metrics", key: "includeMetrics" },
                      { id: "includeCosts", label: "Include Costs", key: "includeCosts" },
                      { id: "includeCompliance", label: "Include Compliance", key: "includeCompliance" }
                    ].map(({ id, label, key }) => (
                      <div key={id} className="flex items-center space-x-2">
                        <Checkbox
                          id={id}
                          checked={formData.options?.[key as keyof typeof formData.options] as boolean}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            options: { ...prev.options, [key]: !!checked }
                          }))}
                        />
                        <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Group By</Label>
                    <Select value={formData.options?.groupBy} onValueChange={(value: any) => setFormData(prev => ({ ...prev, options: { ...prev.options, groupBy: value } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="shift_type">Shift Type</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select value={formData.options?.sortOrder} onValueChange={(value: any) => setFormData(prev => ({ ...prev, options: { ...prev.options, sortOrder: value } }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF Preview Section */}
          {formData.format === "PDF" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PDF Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center space-y-3">
                    <div className="text-2xl font-bold text-gray-800">Shift Med</div>
                    <div className="text-lg font-semibold text-gray-700">
                      {formData.title || `Staff Report - ${format(new Date(formData.filters.dateRange.startDate), "MMM yyyy")}`}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</div>
                      <div>Report Type: {formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1)}</div>
                    </div>
                    <div className="pt-2">
                      <div className="text-sm font-semibold text-gray-700">Executive Summary</div>
                      <div className="text-xs text-gray-600 mt-1">
                        • Summary statistics will appear here<br/>
                        • Detailed table with shift information<br/>
                        • Professional formatting with company branding
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  This is a preview of how your PDF report will look
                </div>
                
                {/* PDF-specific options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Page Orientation</Label>
                    <Select value="portrait" disabled>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait (A4)</SelectItem>
                        <SelectItem value="landscape">Landscape (A4)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500">Portrait mode optimized for reports</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Table Style</Label>
                    <Select value="professional" disabled>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional Blue</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-500">Professional blue theme applied</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setFormData({
                reportType: "shifts",
                format: "Excel",
                title: "",
                filters: {
                  dateRange: {
                    startDate: format(new Date(), "yyyy-MM-dd"),
                    endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
                  },
                  nurses: {},
                  shifts: {},
                  assignmentStatus: [],
                },
                options: {
                  includeMetrics: true,
                  includeCosts: false,
                  includeCompliance: false,
                  groupBy: "department",
                  sortBy: "date",
                  sortOrder: "desc",
                },
                saveReport: true,
              })
            }}>
              Reset
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Generating..." : "Generate Report"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
