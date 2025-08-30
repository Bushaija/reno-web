import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

// Types based on your department API
export interface Department {
  deptId: number;
  deptName: string;
  minNursesPerShift: number;
  maxNursesPerShift: number;
  requiredSkills: number[] | null;
  patientCapacity: number;
  acuityMultiplier: number;
  shiftOverlapMinutes: number;
  createdAt: string;
}

export interface DepartmentResponse {
  success: boolean;
  data: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface SingleDepartmentResponse {
  success: boolean;
  data: Department;
  timestamp: string;
}

export interface DepartmentCreateResponse {
  success: boolean;
  message: string;
  data: Department;
  timestamp: string;
}

export interface DepartmentUpdateResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface DepartmentDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface CreateDepartmentData {
  deptName: string;
  minNursesPerShift?: number;
  maxNursesPerShift?: number;
  requiredSkills?: number[];
  patientCapacity?: number;
  acuityMultiplier?: number;
  shiftOverlapMinutes?: number;
}

export interface UpdateDepartmentData {
  deptName?: string;
  minNursesPerShift?: number;
  maxNursesPerShift?: number;
  requiredSkills?: number[];
  patientCapacity?: number;
  acuityMultiplier?: number;
  shiftOverlapMinutes?: number;
}

export interface DepartmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  hasRequiredSkills?: boolean;
  minPatientCapacity?: number;
  maxPatientCapacity?: number;
}

/**
 * Hook for fetching departments with filtering and pagination
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error } = useDepartments();
 * 
 * // With filters
 * const { data, isLoading, error } = useDepartments({
 *   page: 1,
 *   limit: 20,
 *   search: 'emergency',
 *   hasRequiredSkills: true
 * });
 * ```
 * 
 * @param filters - Optional filters for departments
 * @param options - Additional query options
 */
export function useDepartments(
  filters: DepartmentFilters = {},
  options: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: ['departments', filters],
    queryFn: async (): Promise<DepartmentResponse> => {
      try {
        const response = await honoClient.api['/departments'].$get({
          query: {
            page: filters.page || 1,
            limit: filters.limit || 50,
            search: filters.search,
            hasRequiredSkills: filters.hasRequiredSkills,
            minPatientCapacity: filters.minPatientCapacity,
            maxPatientCapacity: filters.maxPatientCapacity,
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
    enabled,
    staleTime,
    gcTime,
  });
}

/**
 * Hook for fetching a single department by ID
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDepartment(123);
 * ```
 * 
 * @param deptId - The department ID to fetch
 * @param options - Additional query options
 */
export function useDepartment(
  deptId: number,
  options: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
  } = options;

  return useQuery({
    queryKey: ['departments', deptId],
    queryFn: async (): Promise<SingleDepartmentResponse> => {
      try {
        const response = await honoClient.api['/departments/:id'].$get({
          param: { id: deptId.toString() },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error(`Failed to fetch department ${deptId}:`, error);
        throw new Error(`Failed to fetch department ${deptId}`);
      }
    },
    enabled: enabled && !!deptId,
    staleTime,
    gcTime,
  });
}

/**
 * Hook for creating a new department
 * 
 * @example
 * ```tsx
 * const createDepartment = useCreateDepartment();
 * 
 * const handleCreate = async () => {
 *   try {
 *     await createDepartment.mutateAsync({
 *       deptName: 'Emergency Department',
 *       minNursesPerShift: 3,
 *       maxNursesPerShift: 8,
 *       patientCapacity: 25
 *     });
 *   } catch (error) {
 *     console.error('Failed to create department:', error);
 *   }
 * };
 * ```
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation<DepartmentCreateResponse, Error, CreateDepartmentData>({
    mutationFn: async (departmentData: CreateDepartmentData) => {
      try {
        const response = await honoClient.api['/departments'].$post({
          json: departmentData,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to create department:', error);
        throw new Error('Failed to create department');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch departments list
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error) => {
      console.error('Create department error:', error);
    },
  });
}

/**
 * Hook for updating an existing department
 * 
 * @example
 * ```tsx
 * const updateDepartment = useUpdateDepartment();
 * 
 * const handleUpdate = async () => {
 *   try {
 *     await updateDepartment.mutateAsync({
 *       deptId: 123,
 *       data: { patientCapacity: 30 }
 *     });
 *   } catch (error) {
 *     console.error('Failed to update department:', error);
 *   }
 * };
 * ```
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation<
    DepartmentUpdateResponse, 
    Error, 
    { deptId: number; data: UpdateDepartmentData }
  >({
    mutationFn: async ({ deptId, data }) => {
      try {
        const response = await honoClient.api['/departments/:id'].$put({
          param: { id: deptId.toString() },
          json: data,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error(`Failed to update department ${deptId}:`, error);
        throw new Error(`Failed to update department ${deptId}`);
      }
    },
    onSuccess: (_, { deptId }) => {
      // Invalidate specific department and departments list
      queryClient.invalidateQueries({ queryKey: ['departments', deptId] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error) => {
      console.error('Update department error:', error);
    },
  });
}

/**
 * Hook for deleting a department
 * 
 * @example
 * ```tsx
 * const deleteDepartment = useDeleteDepartment();
 * 
 * const handleDelete = async () => {
 *   try {
 *     await deleteDepartment.mutateAsync(123);
 *   } catch (error) {
 *     console.error('Failed to delete department:', error);
 *   }
 * };
 * ```
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation<DepartmentDeleteResponse, Error, number>({
    mutationFn: async (deptId: number) => {
      try {
        const response = await honoClient.api['/departments/:id'].$delete({
          param: { id: deptId.toString() },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error(`Failed to delete department ${deptId}:`, error);
        throw new Error(`Failed to delete department ${deptId}`);
      }
    },
    onSuccess: (_, deptId) => {
      // Invalidate specific department and departments list
      queryClient.invalidateQueries({ queryKey: ['departments', deptId] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error) => {
      console.error('Delete department error:', error);
    },
  });
}

/**
 * Hook for searching departments by name
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSearchDepartments('emergency');
 * ```
 * 
 * @param searchTerm - The search term for department names
 * @param options - Additional query options
 */
export function useSearchDepartments(
  searchTerm: string,
  options: {
    enabled?: boolean;
    limit?: number;
  } = {}
) {
  const {
    enabled = true,
    limit = 20,
  } = options;

  return useDepartments(
    { search: searchTerm, limit },
    { enabled: enabled && !!searchTerm }
  );
}

/**
 * Hook for getting departments with required skills
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDepartmentsWithSkills();
 * ```
 * 
 * @param options - Additional query options
 */
export function useDepartmentsWithSkills(
  options: {
    enabled?: boolean;
    limit?: number;
  } = {}
) {
  const {
    enabled = true,
    limit = 50,
  } = options;

  return useDepartments(
    { hasRequiredSkills: true, limit },
    { enabled }
  );
}

/**
 * Hook for getting departments by patient capacity range
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDepartmentsByCapacity(20, 50);
 * ```
 * 
 * @param minCapacity - Minimum patient capacity
 * @param maxCapacity - Maximum patient capacity
 * @param options - Additional query options
 */
export function useDepartmentsByCapacity(
  minCapacity: number,
  maxCapacity: number,
  options: {
    enabled?: boolean;
    limit?: number;
  } = {}
) {
  const {
    enabled = true,
    limit = 50,
  } = options;

  return useDepartments(
    { 
      minPatientCapacity: minCapacity, 
      maxPatientCapacity: maxCapacity, 
      limit 
    },
    { enabled }
  );
}

/**
 * Utility hook for managing department queries
 * 
 * @example
 * ```tsx
 * const { invalidateDepartments, invalidateDepartment } = useDepartmentQueryClient();
 * 
 * // After a successful operation
 * invalidateDepartments();
 * invalidateDepartment(123);
 * ```
 */
export function useDepartmentQueryClient() {
  const queryClient = useQueryClient();
  
  return {
    invalidateDepartments: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    invalidateDepartment: (deptId: number) => {
      queryClient.invalidateQueries({ queryKey: ['departments', deptId] });
    },
    // Optimistic updates
    setDepartmentData: (deptId: number, data: Department) => {
      queryClient.setQueryData(['departments', deptId], {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    },
    // Remove department from cache after deletion
    removeDepartmentFromCache: (deptId: number) => {
      queryClient.removeQueries({ queryKey: ['departments', deptId] });
    },
  };
}

// Export types for external use
export type {
  Department,
  DepartmentResponse,
  SingleDepartmentResponse,
  DepartmentCreateResponse,
  DepartmentUpdateResponse,
  DepartmentDeleteResponse,
  CreateDepartmentData,
  UpdateDepartmentData,
  DepartmentFilters,
};
