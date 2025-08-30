// types/requests.ts
export interface TimeOffRequest {
    request_id: number;
    nurse: {
      worker_id: number;
      user: {
        user_id: number;
        name: string;
        email: string;
      };
      employee_id: string;
      specialization: string;
    };
    start_date: string;
    end_date: string;
    request_type: 'vacation' | 'sick' | 'personal' | 'family';
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    submitted_at: string;
    approved_at?: string;
    approved_by?: number;
    admin_notes?: string;
    days_requested: number;
    conflicts?: string[];
  }
  
  export interface SwapRequest {
    swap_id: number;
    requesting_nurse: {
      worker_id: number;
      user: {
        user_id: number;
        name: string;
      };
      employee_id: string;
      specialization: string;
    };
    target_nurse?: {
      worker_id: number;
      user: {
        user_id: number;
        name: string;
      };
      employee_id: string;
      specialization: string;
    };
    original_shift: {
      shift_id: number;
      department: {
        department_id: number;
        name: string;
      };
      start_time: string;
      end_time: string;
      shift_type: 'day' | 'night' | 'evening' | 'weekend' | 'holiday';
    };
    requested_shift?: {
      shift_id: number;
      department: {
        department_id: number;
        name: string;
      };
      start_time: string;
      end_time: string;
      shift_type: 'day' | 'night' | 'evening' | 'weekend' | 'holiday';
    };
    swap_type: 'full_shift' | 'partial_shift' | 'open_swap';
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    expires_at: string;
    created_at: string;
    accepted_at?: string;
  }
  
  export interface SwapOpportunity {
    swap_request: SwapRequest;
    compatibility_score: number;
    match_reasons: string[];
    potential_conflicts?: string[];
  }
  
  export interface RequestFilters {
    status?: string[];
    request_type?: string[];
    date_range?: {
      start_date: string;
      end_date: string;
    };
    department?: string[];
    nurse_id?: number;
  }
  
  export interface RequestFormData {
    start_date: string;
    end_date: string;
    request_type: TimeOffRequest['request_type'];
    reason: string;
  }