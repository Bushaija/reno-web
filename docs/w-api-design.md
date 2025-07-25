# Nurse Shifts Management API Design

## Overview
RESTful API designed for a nurse shifts management system with two distinct user types:
- **Admin Users**: Web application (Next.js + Hono + Drizzle + React Query)




## Admin Endpoints (Web Application)

### User Management

#### GET /admin/users
Get all users with pagination and filtering
```json
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- role: string (admin|healthcare_worker)
- department: string
- search: string

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "healthcare_worker",
        "profile": {
          "employeeId": "EMP002",
          "specialization": "Surgery Nurse",
          "department": "Surgery",
          "licenseNumber": "LN12345",
          "availableStart": "08:00:00",
          "availableEnd": "20:00:00"
        },
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### POST /admin/users
Create new user (healthcare worker)
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "healthcare_worker",
  "profile": {
    "employeeId": "EMP003",
    "specialization": "ICU Nurse",
    "department": "ICU",
    "licenseNumber": "LN54321",
    "certification": "RN, CCRN",
    "availableStart": "06:00:00",
    "availableEnd": "18:00:00"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": 3,
    "message": "User created successfully"
  }
}
```

#### PUT /admin/users/:id
Update user information
```json
Request:
{
  "name": "John Updated",
  "profile": {
    "specialization": "Emergency Nurse",
    "department": "Emergency"
  }
}

Response:
{
  "success": true,
  "message": "User updated successfully"
}
```

#### DELETE /admin/users/:id
Deactivate user
```json
Response:
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### Shift Management

#### GET /admin/shifts
Get all shifts with filtering
```json
Query Parameters:
- page: number
- limit: number
- startDate: ISO date
- endDate: ISO date
- department: string
- status: string
- workerId: number

Response:
{
  "success": true,
  "data": {
    "shifts": [
      {
        "id": 1,
        "startTime": "2025-07-23T08:00:00Z",
        "endTime": "2025-07-23T20:00:00Z",
        "department": "ICU",
        "maxStaff": 3,
        "status": "scheduled",
        "notes": "Heavy patient load expected",
        "assignments": [
          {
            "id": 1,
            "worker": {
              "id": 2,
              "name": "Jane Smith",
              "employeeId": "EMP002"
            },
            "status": "assigned"
          }
        ],
        "createdAt": "2025-07-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### POST /admin/shifts
Create new shift
```json
Request:
{
  "startTime": "2025-07-25T08:00:00Z",
  "endTime": "2025-07-25T20:00:00Z",
  "department": "Emergency",
  "maxStaff": 2,
  "notes": "Weekend coverage needed",
  "assignments": [
    {
      "workerId": 2
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": 5,
    "message": "Shift created successfully"
  }
}
```

#### PUT /admin/shifts/:id
Update shift
```json
Request:
{
  "maxStaff": 3,
  "notes": "Additional staff added due to high demand"
}

Response:
{
  "success": true,
  "message": "Shift updated successfully"
}
```

### Shift Assignments

#### POST /admin/shifts/:id/assignments
Assign worker to shift
```json
Request:
{
  "workerId": 3
}

Response:
{
  "success": true,
  "data": {
    "assignmentId": 10,
    "message": "Worker assigned successfully"
  }
}
```

#### DELETE /admin/shifts/:id/assignments/:assignmentId
Remove assignment
```json
Response:
{
  "success": true,
  "message": "Assignment removed successfully"
}
```

### Change Requests Management

#### GET /admin/change-requests
Get all change requests
```json
Query Parameters:
- status: string (pending|approved|rejected)
- page: number
- limit: number

Response:
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "requester": {
          "id": 2,
          "name": "Jane Smith",
          "employeeId": "EMP002"
        },
        "shift": {
          "id": 3,
          "startTime": "2025-07-24T08:00:00Z",
          "endTime": "2025-07-24T20:00:00Z",
          "department": "ICU"
        },
        "reason": "Family emergency",
        "status": "pending",
        "submittedAt": "2025-07-22T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

#### PUT /admin/change-requests/:id
Approve/reject change request
```json
Request:
{
  "status": "approved", // or "rejected"
  "reviewNote": "Approved due to emergency circumstances"
}

Response:
{
  "success": true,
  "message": "Change request updated successfully"
}
```

### Reports

#### GET /admin/reports
Get available reports
```json
Response:
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "title": "Monthly Attendance Report - June 2025",
        "generatedAt": "2025-07-01T09:00:00Z",
        "format": "PDF",
        "downloadUrl": "/admin/reports/1/download"
      }
    ]
  }
}
```

#### POST /admin/reports/generate
Generate new report
```json
Request:
{
  "type": "attendance", // or "shifts", "staff_utilization"
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "department": "ICU",
  "format": "PDF"
}

Response:
{
  "success": true,
  "data": {
    "reportId": 5,
    "message": "Report generation started",
    "estimatedTime": "2-3 minutes"
  }
}
```

### Analytics Dashboard

#### GET /admin/dashboard/stats
Get dashboard statistics
```json
Response:
{
  "success": true,
  "data": {
    "totalStaff": 45,
    "activeShifts": 12,
    "pendingRequests": 3,
    "todayAttendance": {
      "present": 28,
      "absent": 2,
      "late": 1
    },
    "departmentStats": [
      {
        "department": "ICU",
        "staffCount": 15,
        "currentShifts": 4
      }
    ],
    "recentActivity": [
      {
        "type": "shift_created",
        "message": "New shift created for Emergency dept",
        "timestamp": "2025-07-22T15:30:00Z"
      }
    ]
  }
}
```


## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-07-22T15:30:00Z"
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

### Events for Admin:
- `shift_created`: New shift created
- `shift_updated`: Shift modified
- `assignment_changed`: Staff assignment changed
- `change_request_submitted`: New change request
- `attendance_updated`: Attendance record updated
```

```

## API Versioning

- Current version: `v1`
- Version specified in URL: `/v1/endpoint`
- Backward compatibility maintained for at least 6 months
- Deprecation notices sent 3 months before version retirement

