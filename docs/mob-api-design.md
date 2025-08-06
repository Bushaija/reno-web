# Nurse Shifts Management API Design

## Overview
RESTful API designed for a nurse shifts management system with two distinct user types:
- **Admin Users**: Web application (Next.js + Hono + Drizzle + React Query)
- **Healthcare Workers**: Mobile application (React Native + Expo)


## Healthcare Worker Endpoints (Mobile Application)

### Profile Management

#### GET /profile
Get current user profile
```json
Response:
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "profile": {
      "employeeId": "EMP002",
      "specialization": "ICU Nurse",
      "department": "ICU",
      "licenseNumber": "LN12345",
      "certification": "RN, CCRN",
      "availableStart": "08:00:00",
      "availableEnd": "20:00:00"
    }
  }
}
```

#### PUT /profile
Update profile information
```json
Request:
{
  "phone": "+1987654321",
  "profile": {
    "availableStart": "07:00:00",
    "availableEnd": "19:00:00"
  }
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Shift Management

#### GET /shifts/my-shifts
Get current user's shifts
```json
Query Parameters:
- startDate: ISO date
- endDate: ISO date
- status: string

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
        "status": "scheduled",
        "notes": "Heavy patient load expected",
        "assignment": {
          "id": 1,
          "status": "assigned",
          "assignedAt": "2025-07-20T10:00:00Z"
        }
      }
    ]
  }
}
```

#### GET /shifts/available
Get available shifts for pickup
```json
Query Parameters:
- date: ISO date
- department: string

Response:
{
  "success": true,
  "data": {
    "shifts": [
      {
        "id": 5,
        "startTime": "2025-07-25T08:00:00Z",
        "endTime": "2025-07-25T20:00:00Z",
        "department": "Emergency",
        "maxStaff": 2,
        "currentStaff": 1,
        "notes": "Weekend coverage needed",
        "urgency": "medium"
      }
    ]
  }
}
```

#### POST /shifts/:id/request
Request to pick up an available shift
```json
Response:
{
  "success": true,
  "message": "Shift request submitted for approval"
}
```

### Attendance

#### POST /attendance/clock-in
Clock in for a shift
```json
Request:
{
  "shiftId": 1,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response:
{
  "success": true,
  "data": {
    "recordId": 15,
    "clockInTime": "2025-07-23T08:02:00Z",
    "message": "Clocked in successfully"
  }
}
```

#### POST /attendance/clock-out
Clock out from a shift
```json
Request:
{
  "recordId": 15,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response:
{
  "success": true,
  "data": {
    "clockOutTime": "2025-07-23T20:05:00Z",
    "totalHours": 12.05,
    "message": "Clocked out successfully"
  }
}
```

#### GET /attendance/my-records
Get attendance history
```json
Query Parameters:
- month: string (YYYY-MM)
- limit: number

Response:
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 15,
        "shift": {
          "id": 1,
          "startTime": "2025-07-23T08:00:00Z",
          "endTime": "2025-07-23T20:00:00Z",
          "department": "ICU"
        },
        "clockInTime": "2025-07-23T08:02:00Z",
        "clockOutTime": "2025-07-23T20:05:00Z",
        "status": "present",
        "totalHours": 12.05
      }
    ],
    "summary": {
      "totalHours": 156,
      "averageHours": 12.5,
      "attendanceRate": 98.5
    }
  }
}
```

### Change Requests

#### POST /change-requests
Submit a change request
```json
Request:
{
  "shiftId": 3,
  "reason": "Family emergency - need to leave early"
}

Response:
{
  "success": true,
  "data": {
    "requestId": 8,
    "message": "Change request submitted successfully"
  }
}
```

#### GET /change-requests/my-requests
Get user's change requests
```json
Response:
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 8,
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
    ]
  }
}
```

### Notifications

#### GET /notifications
Get user notifications
```json
Query Parameters:
- unread: boolean
- limit: number

Response:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "Shift Assignment",
        "message": "You have been assigned to ICU shift on July 25th",
        "priority": "medium",
        "isRead": false,
        "sentAt": "2025-07-22T16:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read
```json
Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### PUT /notifications/read-all
Mark all notifications as read
```json
Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Feedback

#### POST /feedback
Submit shift feedback
```json
Request:
{
  "shiftId": 1,
  "rating": 4,
  "comment": "Great teamwork, well-organized shift"
}

Response:
{
  "success": true,
  "message": "Feedback submitted successfully"
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

## Rate Limiting

- Admin endpoints: 1000 requests per hour
- Mobile endpoints: 500 requests per hour
- Authentication endpoints: 10 requests per minute

## WebSocket Events (Real-time Updates)

### Connection
```
wss://api.nurseshifts.com/ws?token=jwt_token
```

### Events for Admin:
- `shift_created`: New shift created
- `shift_updated`: Shift modified
- `assignment_changed`: Staff assignment changed
- `change_request_submitted`: New change request
- `attendance_updated`: Attendance record updated

### Events for Healthcare Workers:
- `shift_assigned`: Assigned to new shift
- `shift_cancelled`: Assigned shift cancelled
- `change_request_approved`: Change request approved/rejected
- `notification_received`: New notification

### Event Format:
```json
{
  "event": "shift_assigned",
  "data": {
    "shiftId": 5,
    "startTime": "2025-07-25T08:00:00Z",
    "department": "Emergency"
  },
  "timestamp": "2025-07-22T15:30:00Z"
}
```

## API Versioning

- Current version: `v1`
- Version specified in URL: `/v1/endpoint`
- Backward compatibility maintained for at least 6 months
- Deprecation notices sent 3 months before version retirement

## Security Features

1. **JWT Authentication** with refresh tokens
2. **Role-based access control** (RBAC)
3. **Rate limiting** per user type
4. **Input validation** and sanitization
5. **CORS** configuration
6. **Request logging** and monitoring
7. **Location verification** for attendance
8. **Encryption** for sensitive data