import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDepartments } from '@/hooks/use-departments';
import { StatusBoardFilters } from '@/hooks/use-get-real-time-attendance';
import { Search, X, Filter, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusBoardFiltersProps {
  onFilterChange: (filters: StatusBoardFilters) => void;
}

const initialFilters: StatusBoardFilters = {
  search: '',
  departmentId: 'all',
  status: 'all',
};

export const StatusBoardFilters = ({ onFilterChange }: StatusBoardFiltersProps) => {
  const [filters, setFilters] = useState<StatusBoardFilters>(initialFilters);
  
  // Fetch departments using our custom hook
  const { data: departmentsResponse, isLoading: departmentsLoading } = useDepartments({
    limit: 100 // Get all departments for the filter
  });

  const departments = departmentsResponse?.data || [];

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

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== '' && value !== 'all'
  ).length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by nurse name..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <Separator />

        {/* Department Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Department
          </label>
          <Select 
            value={filters.departmentId} 
            onValueChange={(value) => setFilters({ ...filters, departmentId: value })}
            disabled={departmentsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "All Departments"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading departments...
                </SelectItem>
              ) : (
                departments.map(dept => (
                  <SelectItem key={dept.deptId} value={dept.deptId.toString()}>
                    {dept.deptName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Status
          </label>
          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PRESENT">Present</SelectItem>
              <SelectItem value="LATE">Late</SelectItem>
              <SelectItem value="ABSENT">Absent</SelectItem>
              <SelectItem value="ON_BREAK">On Break</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Reset Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-center" 
          onClick={handleReset}
          disabled={activeFiltersCount === 0}
        >
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-1">
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Search: {filters.search}
                </Badge>
              )}
              {filters.departmentId !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Dept: {departments.find(d => d.deptId.toString() === filters.departmentId)?.deptName || filters.departmentId}
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Status: {filters.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
