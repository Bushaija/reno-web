# Nurse Shift Management System API

**Version:** 1.0.0  
**Base URL:** `https://api.nursescheduling.hospital.com/v1`

## Overview

Comprehensive API for automated scheduling, compliance tracking, workload management, and analytics in healthcare settings.

## Authentication

This API supports two authentication methods:

- **Bearer Token (JWT)**: Include `Authorization: Bearer <token>` header
- **API Key**: Include `X-API-Key: <key>` header

## Core Data Models

### User
```json
{
  "user_id": 123,
  "name": "Jane Doe",
  "email": "jane.doe@hospital.com",
  "phone": "+1-555-0123",
  "emergency_contact_name": "John Doe",
  "emergency_contact_phone": "+1-555-0456",
  "is_active": true,
  "created_at": "2024-03-15T10:00:00Z",
  "updated_at": "2024-03-15T10:00:00Z"
}
```

### Nurse
```json
{
  "worker_id": 456,
  "user": { /* User object */ },
  "employee_id": "RN001234",
  "specialization": "ICU",
  "license_number": "RN123456789",
  "certification": "CCRN, BLS",
  "hire_date": "2023-01-15",
  "employment_type": "full_time", // full_time, part_time, per_diem, travel
  "base_hourly_rate": 35.50,
  "overtime_rate": 53.25,
  "max_hours_per_week": 40,
  "max_consecutive_days": 6,
  "min_hours_between_shifts": 8,
  "preferences": {
    "prefers_day_shifts": true,
    "prefers_night_shifts": false,
    "weekend_availability": true,
    "holiday_availability": false,
    "float_pool_member": false
  },
  "seniority_points": 150,
  "fatigue_score": 25, // 0-100
  "skills": [/* NurseSkill objects */]
}
```

### Shift
```json
{
  "shift_id": 789,
  "department": { /* Department object */ },
  "start_time": "2024-03-15T07:00:00Z",
  "end_time": "2024-03-15T19:00:00Z",
  "shift_type": "day", // day, night, evening, weekend, holiday, on_call, float
  "required_nurses": 4,
  "assigned_nurses": 3,
  "required_skills": [1, 3, 7],
  "patient_ratio_target": 5.0,
  "notes": "High acuity expected",
  "status": "understaffed", // scheduled, in_progress, completed, cancelled, understaffed, overstaffed
  "priority_score": 85,
  "auto_generated": true,
  "assignments": [/* ShiftAssignment objects */]
}
```

## API Endpoints

---

## Authentication

### POST `/auth/login`
User authentication

**Request Body:**
```json
{
  "email": "jane.doe@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "user": { /* User object */ },
  "expires_in": 3600
}
```

### POST `/auth/refresh`
Refresh access token

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response:**
```json
{
  "token": "new_access_token_here",
  "expires_in": 3600
}
```

### POST `/auth/logout`
User logout

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Nurse Management

### GET `/nurses`
Retrieve all nurses with optional filtering

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 20) - Items per page
- `department` (string) - Filter by department
- `specialization` (string) - Filter by specialization
- `employment_type` (string) - Filter by employment type
- `is_available` (boolean) - Filter by current availability
- `fatigue_score_max` (integer) - Filter by maximum fatigue score

**Response:**
```json
{
  "success": true,
  "data": [
    { /* Nurse objects */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  },
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### POST `/nurses`
Create a new nurse profile

**Request Body:**
```json
{
  "user": { /* User object fields */ },
  "employee_id": "RN001234",
  "specialization": "ICU",
  "license_number": "RN123456789",
  "employment_type": "full_time",
  "base_hourly_rate": 35.50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nurse created successfully",
  "data": { /* Complete Nurse object */ },
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### GET `/nurses/{nurse_id}`
Get specific nurse details

**Response:**
```json
{
  "success": true,
  "data": { /* Complete Nurse object */ },
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### PUT `/nurses/{nurse_id}`
Update nurse information

**Request Body:**
```json
{
  "specialization": "Emergency",
  "max_hours_per_week": 45,
  "preferences": {
    "prefers_night_shifts": true
  }
}
```

### GET `/nurses/{nurse_id}/availability`
Get nurse availability schedule

**Query Parameters:**
- `start_date` (date) - Filter start date
- `end_date` (date) - Filter end date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "day_of_week": 1, // Monday = 1
      "start_time": "07:00:00",
      "end_time": "19:00:00",
      "is_preferred": true,
      "is_available": true
    }
  ]
}
```

### PUT `/nurses/{nurse_id}/availability`
Update nurse availability

**Request Body:**
```json
[
  {
    "day_of_week": 1,
    "start_time": "07:00:00",
    "end_time": "19:00:00",
    "is_preferred": true,
    "is_available": true
  }
]
```

### GET `/nurses/{nurse_id}/fatigue`
Get fatigue assessment history

**Query Parameters:**
- `days` (integer, default: 30) - Number of days to retrieve

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "assessment_id": 5001,
      "nurse": { /* Nurse object */ },
      "assessment_date": "2024-03-15",
      "hours_worked_last_24h": 12.5,
      "hours_worked_last_7days": 45.0,
      "consecutive_shifts": 3,
      "sleep_hours_reported": 6.5,
      "stress_level_reported": 7,
      "fatigue_risk_score": 65,
      "risk_level": "high",
      "recommendations": "Consider shorter shifts for next 48 hours"
    }
  ]
}
```

### POST `/nurses/{nurse_id}/fatigue`
Create new fatigue assessment

**Request Body:**
```json
{
  "sleep_hours_reported": 6.5,
  "stress_level_reported": 7,
  "caffeine_intake_level": 5,
  "notes": "Feeling tired after consecutive shifts"
}
```

---

## Shift Management

### GET `/shifts`
Retrieve shifts with filtering options

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 50) - Items per page
- `department_id` (integer) - Filter by department
- `start_date` (date) - Filter by start date
- `end_date` (date) - Filter by end date
- `shift_type` (string) - Filter by shift type
- `status` (string) - Filter by status
- `nurse_id` (integer) - Filter by assigned nurse
- `understaffed_only` (boolean) - Show only understaffed shifts

**Response:**
```json
{
  "success": true,
  "data": [
    { /* Shift objects */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 300,
    "total_pages": 6
  }
}
```

### POST `/shifts`
Create a new shift

**Request Body:**
```json
{
  "department_id": 1,
  "start_time": "2024-03-15T07:00:00Z",
  "end_time": "2024-03-15T19:00:00Z",
  "shift_type": "day",
  "required_nurses": 4,
  "required_skills": [1, 3, 7],
  "patient_ratio_target": 5.0,
  "notes": "High acuity expected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shift created successfully",
  "data": { /* Complete Shift object */ }
}
```

### POST `/shifts/bulk`
Create multiple shifts using templates

**Request Body:**
```json
{
  "template": {
    "department_id": 1,
    "shift_type": "day",
    "required_nurses": 4,
    "duration_hours": 12,
    "required_skills": [1, 3]
  },
  "date_range": {
    "start_date": "2024-03-15",
    "end_date": "2024-03-30"
  },
  "time_slots": [
    {
      "start_time": "07:00:00",
      "shift_type": "day"
    },
    {
      "start_time": "19:00:00",
      "shift_type": "night"
    }
  ],
  "skip_dates": ["2024-03-17", "2024-03-24"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk shifts created successfully",
  "data": {
    "created_count": 28,
    "shifts": [/* Array of created shifts */]
  }
}
```

### POST `/shifts/{shift_id}/auto-assign`
Automatically assign nurses to a shift

**Request Body (Optional):**
```json
{
  "preferences": {
    "prefer_seniority": true,
    "max_fatigue_score": 70,
    "avoid_overtime": true,
    "prioritize_availability": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assigned_count": 3,
    "assignments": [
      {
        "assignment_id": 1001,
        "nurse": { /* Nurse object */ },
        "status": "assigned",
        "patient_load": 6
      }
    ],
    "warnings": [
      "Nurse ID 123 has high fatigue score (85)",
      "Shift still understaffed by 1 nurse"
    ]
  }
}
```

### POST `/shifts/{shift_id}/assignments`
Manually assign nurse to shift

**Request Body:**
```json
{
  "nurse_id": 456,
  "is_primary": false,
  "patient_load": 6,
  "override_warnings": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nurse assigned successfully",
  "data": { /* ShiftAssignment object */ }
}
```

---

## Automated Scheduling

### POST `/scheduling/generate`
Generate automated schedule for specified period

**Request Body:**
```json
{
  "start_date": "2024-03-15",
  "end_date": "2024-03-30",
  "departments": [1, 2, 3],
  "options": {
    "balance_workload": true,
    "respect_preferences": true,
    "minimize_overtime": true,
    "fair_rotation": true,
    "max_consecutive_shifts": 3,
    "min_days_off": 2
  }
}
```

**Response (Sync):**
```json
{
  "success": true,
  "data": {
    "schedule_id": "SCH_2024_03_15_001",
    "total_shifts": 240,
    "assigned_shifts": 225,
    "unassigned_shifts": 15,
    "warnings": [
      "ICU department understaffed on weekend shifts",
      "3 nurses exceeding preferred weekly hours"
    ],
    "conflicts": [
      {
        "shift_id": 789,
        "issue": "No qualified nurses available",
        "severity": "high"
      }
    ]
  }
}
```

**Response (Async - 202):**
```json
{
  "job_id": "job_123456",
  "status": "processing",
  "estimated_completion": "2024-03-15T10:30:00Z"
}
```

### POST `/scheduling/optimize`
Optimize existing schedule

**Request Body:**
```json
{
  "start_date": "2024-03-15",
  "end_date": "2024-03-30",
  "departments": [1, 2],
  "optimization_goals": ["minimize_cost", "balance_workload", "reduce_fatigue"],
  "constraints": {
    "preserve_confirmed": true,
    "max_changes_per_nurse": 3
  }
}
```

### POST `/scheduling/predict-staffing`
Predict staffing needs based on historical data

**Request Body:**
```json
{
  "department_id": 1,
  "prediction_date": "2024-03-20",
  "shift_type": "day",
  "expected_patient_count": 18,
  "expected_acuity": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommended_nurses": 6,
    "confidence_score": 0.85,
    "factors": {
      "historical_average": 4.5,
      "acuity_adjustment": 1.2,
      "seasonal_factor": 1.1,
      "day_of_week_factor": 0.95
    },
    "risk_indicators": [
      "Above average patient acuity expected",
      "Historical staffing challenges on Wednesdays"
    ]
  }
}
```

---

## Shift Swapping

### GET `/swap-requests`
Get shift swap requests

**Query Parameters:**
- `status` (string) - Filter by status (pending, approved, rejected, cancelled, expired)
- `nurse_id` (integer) - Filter by nurse
- `department_id` (integer) - Filter by department
- `start_date` (date) - Filter by date range
- `end_date` (date) - Filter by date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "swap_id": 2001,
      "requesting_nurse": { /* Nurse object */ },
      "target_nurse": { /* Nurse object */ },
      "original_shift": { /* Shift object */ },
      "requested_shift": { /* Shift object */ },
      "swap_type": "full_shift",
      "reason": "Family emergency",
      "status": "pending",
      "expires_at": "2024-03-18T10:00:00Z",
      "created_at": "2024-03-15T10:00:00Z"
    }
  ]
}
```

### POST `/swap-requests`
Create new swap request

**Request Body:**
```json
{
  "original_shift_id": 789,
  "target_nurse_id": 456,
  "requested_shift_id": 790,
  "swap_type": "full_shift",
  "reason": "Medical appointment",
  "expires_in_hours": 72
}
```

### GET `/swap-requests/opportunities`
Find available swap opportunities

**Query Parameters:**
- `nurse_id` (integer) - Find opportunities for specific nurse
- `department_id` (integer) - Filter by department
- `shift_type` (string) - Filter by shift type
- `date_range_start` (date) - Date range filter
- `date_range_end` (date) - Date range filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "swap_request": { /* SwapRequest object */ },
      "compatibility_score": 85,
      "match_reasons": [
        "Same department and shift type",
        "Skills match requirements",
        "No scheduling conflicts"
      ]
    }
  ]
}
```

### POST `/swap-requests/{swap_id}/accept`
Accept a swap request (by target nurse)

**Response:**
```json
{
  "success": true,
  "message": "Swap request accepted successfully"
}
```

---

## Time Off Management

### GET `/time-off-requests`
Get time off requests

**Query Parameters:**
- `nurse_id` (integer) - Filter by nurse
- `status` (string) - Filter by status
- `request_type` (string) - Filter by type (vacation, sick, personal, family)
- `start_date` (date) - Filter by date range
- `end_date` (date) - Filter by date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "request_id": 3001,
      "nurse": { /* Nurse object */ },
      "start_date": "2024-03-20",
      "end_date": "2024-03-22",
      "request_type": "vacation",
      "reason": "Family vacation",
      "status": "pending",
      "submitted_at": "2024-03-15T10:00:00Z"
    }
  ]
}
```

### POST `/time-off-requests`
Submit time off request

**Request Body:**
```json
{
  "start_date": "2024-03-20",
  "end_date": "2024-03-22",
  "request_type": "vacation",
  "reason": "Family vacation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Time off request submitted successfully",
  "data": { /* TimeOffRequest object */ }
}
```

### PUT `/time-off-requests/{request_id}`
Update time off request status (Admin only)

**Request Body:**
```json
{
  "status": "approved",
  "admin_notes": "Approved - adequate coverage available"
}
```

---

## Attendance & Compliance

### GET `/attendance`
Get attendance records

**Query Parameters:**
- `nurse_id` (integer) - Filter by nurse
- `shift_id` (integer) - Filter by shift
- `start_date` (date) - Filter by date range
- `end_date` (date) - Filter by date range
- `status` (string) - Filter by attendance status
- `has_violations` (boolean) - Filter records with violations

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "record_id": 6001,
      "assignment": { /* ShiftAssignment object */ },
      "scheduled_start": "2024-03-15T07:00:00Z",
      "scheduled_end": "2024-03-15T19:00:00Z",
      "clock_in_time": "2024-03-15T07:05:00Z",
      "clock_out_time": "2024-03-15T19:30:00Z",
      "break_duration_minutes": 30,
      "overtime_minutes": 35,
      "late_minutes": 5,
      "patient_count_start": 8,
      "patient_count_end": 6,
      "status": "present"
    }
  ]
}
```

### POST `/attendance/clock-in`
Clock in for assigned shift

**Request Body:**
```json
{
  "assignment_id": 1001,
  "location_lat": 40.7128,
  "location_lng": -74.0060,
  "notes": "Ready for shift"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "record_id": 6001,
    "clock_in_time": "2024-03-15T07:05:00Z",
    "late_minutes": 5,
    "warnings": [
      "Clocked in 5 minutes late"
    ]
  }
}
```

### POST `/attendance/clock-out`
Clock out from shift

**Request Body:**
```json
{
  "assignment_id": 1001,
  "patient_count_end": 6,
  "notes": "Shift completed successfully",
  "shift_summary": {
    "total_patients_cared": 8,
    "procedures_performed": 12,
    "incidents_reported": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "record_id": 6001,
    "clock_out_time": "2024-03-15T19:30:00Z",
    "total_hours": 12.42,
    "overtime_minutes": 35,
    "violations": []
  }
}
```

### GET `/compliance/violations`
Get compliance violations

**Query Parameters:**
- `nurse_id` (integer) - Filter by nurse
- `violation_type` (string) - Filter by violation type
- `severity` (string) - Filter by severity level
- `resolved` (boolean) - Filter by resolution status
- `start_date` (date) - Filter by date range
- `end_date` (date) - Filter by date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "violation_id": 4001,
      "nurse": { /* Nurse object */ },
      "violation_type": "overtime_exceeded",
      "severity": "medium",
      "description": "Overtime exceeded 2 hours: 150 minutes",
      "detected_at": "2024-03-15T19:30:00Z",
      "resolved_at": null,
      "requires_action": true,
      "auto_detected": true
    }
  ]
}
```

---

## Notifications

### GET `/notifications`
Get user notifications

**Query Parameters:**
- `unread_only` (boolean, default: false) - Show only unread notifications
- `category` (string) - Filter by category
- `priority` (string) - Filter by priority level
- `limit` (integer, default: 50) - Number of notifications to retrieve

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "notification_id": 3001,
      "category": "shift_update",
      "title": "Shift Assignment Updated",
      "message": "Your shift on March 15th has been updated",
      "priority": "high",
      "action_required": true,
      "action_url": "/shifts/789",
      "sent_at": "2024-03-15T10:00:00Z",
      "read_at": null,
      "is_read": false,
      "expires_at": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### POST `/notifications`
Send notification

**Request Body:**
```json
{
  "recipients": [123, 456, 789],
  "recipient_groups": ["icu_staff"],
  "category": "system_maintenance",
  "title": "Scheduled System Maintenance",
  "message": "System will be down for maintenance on March 20th from 2-4 AM",
  "priority": "medium",
  "action_required": false,
  "expires_in_hours": 48
}
```

### POST `/notifications/broadcast`
Send broadcast message to multiple users

**Request Body:**
```json
{
  "target_audience": "department_staff",
  "department_ids": [1, 2],
  "title": "Emergency Staffing Alert",
  "message": "Additional staff needed for ICU - contact supervisor immediately",
  "priority": "urgent",
  "emergency": true
}
```

---

## Reporting & Analytics

### GET `/reports/dashboard-metrics`
Get key dashboard metrics

**Query Parameters:**
- `period` (string) - Time period (today, week, month, quarter)
- `department_id` (integer) - Filter by department

**Response:**
```json
{
  "success": true,
  "data": {
    "staffing": {
      "total_shifts": 168,
      "filled_shifts": 156,
      "understaffed_shifts": 8,
      "fill_rate": 0.93
    },
    "compliance": {
      "total_violations": 12,
      "resolved_violations": 8,
      "pending_violations": 4,
      "compliance_rate": 0.95
    },
    "workload": {
      "avg_overtime_hours": 2.5,
      "high_fatigue_nurses": 3,
      "avg_patient_ratio": 5.2
    },
    "financial": {
      "total_labor_cost": 125000.50,
      "overtime_cost": 15000.25,
      "cost_per_shift": 850.75
    },
    "satisfaction": {
      "avg_shift_rating": 4.2,
      "avg_workload_rating": 3.8,
      "response_rate": 0.78
    }
  }
}
```

### POST `/reports/generate`
Generate detailed reports

**Request Body:**
```json
{
  "report_type": "overtime_trends",
  "parameters": {
    "start_date": "2024-01-01",
    "end_date": "2024-03-15",
    "department_ids": [1, 2, 3],
    "include_charts": true,
    "format": "pdf",
    "granularity": "weekly"
  }
}
```

**Response (Sync):**
```json
{
  "success": true,
  "data": {
    "report_id": 5001,
    "file_url": "https://reports.hospital.com/overtime_trends_5001.pdf",
    "expires_at": "2024-03-22T10:00:00Z"
  }
}
```

**Response (Async - 202):**
```json
{
  "job_id": "report_job_123",
  "status": "processing",
  "estimated_completion": "2024-03-15T10:15:00Z"
}
```

### GET `/reports/analytics/overtime-trends`
Get overtime trends analysis

**Query Parameters:**
- `start_date` (date) - Analysis start date
- `end_date` (date) - Analysis end date
- `department_id` (integer) - Filter by department
- `granularity` (string) - Data granularity (daily, weekly, monthly)

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2024-03-08",
        "total_overtime_hours": 45.5,
        "avg_overtime_per_nurse": 3.2,
        "overtime_cost": 2275.50
      }
    ],
    "top_overtime_nurses": [
      {
        "nurse": { /* Nurse object */ },
        "total_overtime_hours": 12.5
      }
    ],
    "predictions": {
      "next_period_estimate": 48.2,
      "confidence_interval": [42.1, 54.3]
    }
  }
}
```

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_FORMAT"
    }
  ],
  "timestamp": "2024-03-15T10:00:00Z",
  "request_id": "req_123456"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Business rule violation",
  "errors": [
    "Cannot assign nurse: fatigue score too high (85/70 max)",
    "Nurse already assigned to overlapping shift"
  ],
  "timestamp": "2024-03-15T10:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2024-03-15T10:00:00Z",
  "request_id": "req_123456"
}
```

## Rate Limits

- **Standard endpoints**: 1000 requests per hour per API key
- **Report generation**: 10 requests per hour per API key
- **Bulk operations**: 50 requests per hour per API key

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit per hour
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: UTC timestamp when limit resets

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events
- `shift.assigned` - Nurse assigned to shift
- `shift.cancelled` - Shift cancelled
- `compliance.violation` - New compliance violation detected
- `swap.requested` - New swap request created
- `attendance.late` - Late clock-in detected
- `schedule.generated` - Automated schedule completed

### Webhook Payload Example
```json
{
  "event": "shift.assigned",
  "timestamp": "2024-03-15T10:00:00Z",
  "data": {
    "assignment": { /* ShiftAssignment object */ },
    "shift": { /* Shift object */ },
    "nurse": { /* Nurse object */ }
  }
}
```

---

*For technical support, contact: support@hospital.com*  
*API Documentation Version: 1.