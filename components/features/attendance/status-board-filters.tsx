import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Department, nurseStatusEnum } from '@/types/attendance-status.types';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface StatusBoardFilters {
  search: string;
  departmentId: string;
  status: string;
}

interface StatusBoardFiltersProps {
  departments: Department[];
  onFilterChange: (filters: StatusBoardFilters) => void;
}

const initialFilters: StatusBoardFilters = {
  search: '',
  departmentId: 'all',
  status: 'all',
};

export const StatusBoardFilters = ({ departments, onFilterChange }: StatusBoardFiltersProps) => {
  const [filters, setFilters] = useState<StatusBoardFilters>(initialFilters);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 300); // Debounce input

    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilterChange]);

  const handleReset = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="p-4 bg-card border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Filters</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      <Select value={filters.departmentId} onValueChange={(value) => setFilters({ ...filters, departmentId: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Select Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map(dep => (
            <SelectItem key={dep.department_id} value={dep.department_id}>{dep.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {nurseStatusEnum.options.map(status => (
            <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" className="w-full justify-center" onClick={handleReset}>
        <X className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );
};
