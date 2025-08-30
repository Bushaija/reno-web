// Generic types for reusability
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  export interface DataTableProps<T> {
    data: T[];
    pagination?: PaginationInfo;
    onPaginationChange?: (page: number, limit: number) => void;
    isLoading?: boolean;
    searchPlaceholder?: string;
    searchKey?: keyof T;
  }