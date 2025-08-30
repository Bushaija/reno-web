// types.ts
export interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "healthcare_worker";
    profile: {
      employeeId?: string;
      specialization?: string;
      department?: string;
      licenseNumber?: string;
      certification?: string;
      availableStart?: string;
      availableEnd?: string;
    };
    createdAt: string;
    status: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: {
      users?: T[]; // This could be generalized to any resource
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }