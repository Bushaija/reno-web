'use client';

/**
 * @file A sidebar component for filtering compliance violations.
 * @version 1.0.0
 * @since 2024-07-26
 */

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComplianceSeverity, ViolationStatus } from '@/types/compliance.types';

export interface ComplianceFilters {
  dateRange: { from: Date | undefined; to: Date | undefined };
  severity: ComplianceSeverity | 'all';
  status: ViolationStatus | 'all';
}

interface ComplianceFilterSidebarProps {
  filters: ComplianceFilters;
  onFilterChange: (newFilters: Partial<ComplianceFilters>) => void;
  onReset: () => void;
}

export function ComplianceFilterSidebar({ filters, onFilterChange, onReset }: ComplianceFilterSidebarProps) {
  return (
    <aside className="space-y-6 p-4 border-r">
      <h3 className="text-lg font-semibold">Filters</h3>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <Calendar
          mode="range"
          selected={filters.dateRange}
                    onSelect={(range: DateRange | undefined) => onFilterChange({ dateRange: range || { from: undefined, to: undefined } })}
          className="rounded-md border"
        />
      </div>

      {/* Severity Filter */}
      <div className="space-y-2">
        <Label htmlFor="severity-filter">Severity</Label>
        <Select
          value={filters.severity}
          onValueChange={(value: ComplianceSeverity | 'all') => onFilterChange({ severity: value })}
        >
          <SelectTrigger id="severity-filter">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value: ViolationStatus | 'all') => onFilterChange({ status: value })}
        >
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onReset} variant="outline" className="w-full">Reset Filters</Button>
    </aside>
  );
}
