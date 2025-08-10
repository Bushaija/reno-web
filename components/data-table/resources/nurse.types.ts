export interface Nurse {
  worker_id: number;
  user: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
  };
  employee_id: string;
  specialization?: string;
  employment_type: string;
  fatigue_score?: number;
}


