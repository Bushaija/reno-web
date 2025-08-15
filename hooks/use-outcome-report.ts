import { useMutation } from "@tanstack/react-query";
import { honoClient, handleHonoResponse } from '@/lib/hono';

export interface ReportRequest {
  reportType: "shifts" | "attendance" | "workload" | "compliance" | "summary";
  format: "PDF" | "Excel" | "CSV";
  title?: string;
  filters: {
    dateRange: {
      startDate: string;
      endDate: string;
    };
    nurses?: {
      workerIds?: number[];
      departmentIds?: number[];
      skillLevels?: string[];
      employmentTypes?: string[];
    };
    shifts?: {
      shiftTypes?: string[];
      departmentIds?: number[];
      statuses?: string[];
    };
    assignmentStatus?: string[];
  };
  options?: {
    includeMetrics?: boolean;
    includeCosts?: boolean;
    includeCompliance?: boolean;
    groupBy?: "nurse" | "department" | "shift_type" | "date";
    sortBy?: "date" | "nurse_name" | "department" | "hours_worked";
    sortOrder?: "asc" | "desc";
  };
  saveReport?: boolean;
  scheduleReport?: {
    frequency: "daily" | "weekly" | "monthly";
    nextRunDate: string;
  };
}

export interface ReportResponse {
  success: boolean;
  reportId?: number;
  downloadUrl?: string;
  data?: {
    summary: {
      totalShifts: number;
      totalHours: number;
      totalNurses: number;
      avgUtilization: number;
      totalCost?: number;
    };
    details: Array<{
      shiftId: number;
      shiftDate: string;
      shiftType: string;
      department: string;
      assignmentId: number;
      nurseName: string;
      employeeId: string;
      nurseSpecialization: string;
      scheduledStart: string;
      scheduledEnd: string;
      actualStart: string | null;
      actualEnd: string | null;
      assignmentStatus: string;
      shiftStatus: string;
      hoursWorked: number;
      overtimeHours: number;
      patientLoad: number;
    }>;
  };
  metadata: {
    generatedAt: string;
    totalRecords: number;
    filtersSummary: string;
    generatedBy: number;
  };
}

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async (reportRequest: ReportRequest): Promise<{ success: boolean; fileName: string }> => {
      console.log('Sending report request:', reportRequest);
      
      try {
        // Add download=true query parameter to get file response
        const response = await honoClient.api.outcome.generate.$post({
          json: reportRequest,
          query: { download: 'true' }
        });
        
        console.log('Response:', response);
        console.log('Response type:', typeof response);
        console.log('Response constructor:', response.constructor.name);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Get the filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'report'
          : 'report';
        
        // Get the file data as blob
        const blob = await response.blob();
        
        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, fileName };
        
      } catch (error) {
        console.error('Request failed:', error);
        
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Please check if the API server is running');
        }
        
        throw error;
      }
    },
  });
};