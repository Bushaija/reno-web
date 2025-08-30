import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

export interface Department {
  department_id: number;
  name: string;
  code: string;
  is_active: boolean;
  staff_count: number;
  location: string;
}

export interface DepartmentFilterState {
  selectedDepartments: number[];
  availableDepartments: Department[];
  isLoading: boolean;
  error: Error | null;
}

export const useDepartmentFilter = () => {
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  // Fetch available departments
  // Using /departments endpoint from API design
  const { 
    data: availableDepartments, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/departments'].$get({
          query: {
            limit: 100,
            // Add any additional filters if needed
          },
          header: {},
          cookie: {},
        });
        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        throw new Error('Failed to fetch departments');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set department filter
  const setDepartmentFilter = useCallback((departmentIds: number[]) => {
    setSelectedDepartments(departmentIds);
  }, []);

  // Add a department to the filter
  const addDepartment = useCallback((departmentId: number) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId) ? prev : [...prev, departmentId]
    );
  }, []);

  // Remove a department from the filter
  const removeDepartment = useCallback((departmentId: number) => {
    setSelectedDepartments(prev => 
      prev.filter(id => id !== departmentId)
    );
  }, []);

  // Toggle a department in the filter
  const toggleDepartment = useCallback((departmentId: number) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  }, []);

  // Clear all department filters
  const clearFilters = useCallback(() => {
    setSelectedDepartments([]);
  }, []);

  // Check if a department is selected
  const isDepartmentSelected = useCallback((departmentId: number) => {
    return selectedDepartments.includes(departmentId);
  }, [selectedDepartments]);

  // Get selected department names
  const getSelectedDepartmentNames = useCallback(() => {
    if (!availableDepartments?.data) return [];
    
    return availableDepartments.data
      .filter(dept => selectedDepartments.includes(dept.department_id))
      .map(dept => dept.name);
  }, [selectedDepartments, availableDepartments]);

  // Get selected department codes
  const getSelectedDepartmentCodes = useCallback(() => {
    if (!availableDepartments?.data) return [];
    
    return availableDepartments.data
      .filter(dept => selectedDepartments.includes(dept.department_id))
      .map(dept => dept.code);
  }, [selectedDepartments, availableDepartments]);

  // Check if any departments are selected
  const hasActiveFilters = selectedDepartments.length > 0;

  // Get departments that are not selected
  const getUnselectedDepartments = useCallback(() => {
    if (!availableDepartments?.data) return [];
    
    return availableDepartments.data.filter(
      dept => !selectedDepartments.includes(dept.department_id)
    );
  }, [selectedDepartments, availableDepartments]);

  // Select all departments
  const selectAllDepartments = useCallback(() => {
    if (availableDepartments?.data) {
      const allIds = availableDepartments.data.map(dept => dept.department_id);
      setSelectedDepartments(allIds);
    }
  }, [availableDepartments]);

  // Select departments by type (e.g., all active departments)
  const selectActiveDepartments = useCallback(() => {
    if (availableDepartments?.data) {
      const activeIds = availableDepartments.data
        .filter(dept => dept.is_active)
        .map(dept => dept.department_id);
      setSelectedDepartments(activeIds);
    }
  }, [availableDepartments]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    if (selectedDepartments.length === 0) {
      return 'All Departments';
    }
    
    if (selectedDepartments.length === 1) {
      const dept = availableDepartments?.data?.find(d => d.department_id === selectedDepartments[0]);
      return dept?.name || '1 Department';
    }
    
    if (selectedDepartments.length === availableDepartments?.data?.length) {
      return 'All Departments';
    }
    
    return `${selectedDepartments.length} Departments`;
  }, [selectedDepartments, availableDepartments]);

  return {
    // Filter state
    selectedDepartments,
    availableDepartments: availableDepartments?.data || [],
    isLoading,
    error,
    
    // Filter management methods
    setDepartmentFilter,
    addDepartment,
    removeDepartment,
    toggleDepartment,
    clearFilters,
    
    // Utility methods
    isDepartmentSelected,
    hasActiveFilters,
    getSelectedDepartmentNames,
    getSelectedDepartmentCodes,
    getUnselectedDepartments,
    selectAllDepartments,
    selectActiveDepartments,
    getFilterSummary,
  };
};
