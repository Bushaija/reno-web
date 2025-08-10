# Mobile API Design Document

## Overview

This document outlines the design and specifications for the mobile API endpoints designed for healthcare workers using the mobile application. The API follows RESTful principles and uses OpenAPI 3.0 specifications with Zod validation.

## Base URL Structure

```
Base URL: /api/mobile
Authentication: Bearer Token (JWT)
Content-Type: application/json
```

## Common Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string (optional),
  "error": {
    "code": string,
    "message": string
  } (optional)
}
```

## Error Handling

Standard HTTP status codes are used:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## API Resources

### 1. Profile Management

**Base Path:** `/users/{userId}`

#### GET /users/{userId}/profile
Retrieve user profile information.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "profile": {
      "employeeId": "EMP001",
      "specialization": "Registered Nurse",
      "department": "Emergency",
      "licenseNumber": "RN123456",
      "certification": "ACLS, BLS",
      "availableStart": "08:00:00",
      "availableEnd": "20:00:00"
    }
  }
}
```

#### PUT /users/{userId}/profile
Update user profile information.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Request Body:**
```json
{
  "phone": "+1234567890",
  "profile": {
    "availableStart": "08:00:00",
    "availableEnd": "20:00:00",
    "specialization": "Registered Nurse",
    "department": "Emergency",
    "licenseNumber": "RN123456",
    "certification": "ACLS, BLS"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### 2. Shifts Management

**Base Path:** `/users/{userId}/shifts` and `/shifts`

#### GET /users/{userId}/shifts
Retrieve user's assigned shifts.

**Parameters:**
- `userId` (path, required): User ID (numeric)
- `startDate` (query, optional): Start date filter (ISO datetime)
- `endDate` (query, optional): End date filter (ISO datetime)
- `status` (query, optional): Shift status filter (`scheduled`, `in_progress`, `completed`, `cancelled`)

**Response:**
```json
{
  "success": true,
  "data": {
    "shifts": [
      {
        "id": 1,
        "startTime": "2024-01-15T08:00:00Z",
        "endTime": "2024-01-15T16:00:00Z",
        "department": "Emergency",
        "status": "scheduled",
        "notes": "Regular shift",
        "assignment": {
          "id": 1,
          "status": "assigned",
          "assignedAt": "2024-01-10T10:00:00Z"
        }
      }
    ]
  }
}
```

#### GET /shifts/available
Retrieve available shifts for pickup.

**Parameters:**
- `date` (query, optional): Date filter (ISO datetime)
- `department` (query, optional): Department filter

**Response:**
```json
{
  "success": true,
  "data": {
    "shifts": [
      {
        "id": 2,
        "startTime": "2024-01-16T08:00:00Z",
        "endTime": "2024-01-16T16:00:00Z",
        "department": "ICU",
        "maxStaff": 3,
        "currentStaff": 1,
        "notes": "Urgent coverage needed",
        "urgency": "high"
      }
    ]
  }
}
```

#### POST /users/{userId}/shifts/{id}/request
Request to pick up an available shift.

**Parameters:**
- `userId` (path, required): User ID (numeric)
- `id` (path, required): Shift ID (numeric)

**Response:**
```json
{
  "success": true,
  "message": "Shift request submitted successfully"
}
```

### 3. Attendance Management

**Base Path:** `/users/{userId}/attendance`

#### POST /users/{userId}/attendance/clock-in
Clock in for a shift.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Request Body:**
```json
{
  "shiftId": 1,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recordId": 1,
    "clockInTime": "2024-01-15T08:00:00Z",
    "message": "Successfully clocked in"
  }
}
```

#### POST /users/{userId}/attendance/clock-out
Clock out from a shift.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Request Body:**
```json
{
  "recordId": 1,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clockOutTime": "2024-01-15T16:00:00Z",
    "totalHours": 8.0,
    "message": "Successfully clocked out"
  }
}
```

#### GET /users/{userId}/attendance/records
Retrieve attendance records.

**Parameters:**
- `userId` (path, required): User ID (numeric)
- `month` (query, optional): Month filter (YYYY-MM format)
- `limit` (query, optional): Number of records to return (1-100)

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "shift": {
          "id": 1,
          "startTime": "2024-01-15T08:00:00Z",
          "endTime": "2024-01-15T16:00:00Z",
          "department": "Emergency"
        },
        "clockInTime": "2024-01-15T08:00:00Z",
        "clockOutTime": "2024-01-15T16:00:00Z",
        "status": "present",
        "totalHours": 8.0
      }
    ],
    "summary": {
      "totalHours": 160.0,
      "averageHours": 8.0,
      "attendanceRate": 95.5
    }
  }
}
```

### 4. Change Requests

**Base Path:** `/users/{userId}/change-requests`

#### POST /users/{userId}/change-requests
Submit a change request for a shift.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Request Body:**
```json
{
  "shiftId": 1,
  "reason": "Personal emergency - need to reschedule"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": 1,
    "message": "Change request submitted successfully"
  }
}
```

#### GET /users/{userId}/change-requests
Retrieve user's change requests.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "shift": {
          "id": 1,
          "startTime": "2024-01-15T08:00:00Z",
          "endTime": "2024-01-15T16:00:00Z",
          "department": "Emergency"
        },
        "reason": "Personal emergency - need to reschedule",
        "status": "pending",
        "submittedAt": "2024-01-10T10:00:00Z"
      }
    ]
  }
}
```

### 5. Feedback

**Base Path:** `/users/{userId}/feedback`

#### POST /users/{userId}/feedback
Submit feedback for a completed shift.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Request Body:**
```json
{
  "shiftId": 1,
  "rating": 5,
  "comment": "Great team collaboration and supportive environment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

### 6. Notifications

**Base Path:** `/users/{userId}/notifications`

#### GET /users/{userId}/notifications
Retrieve user notifications.

**Parameters:**
- `userId` (path, required): User ID (numeric)
- `unread` (query, optional): Filter unread notifications (boolean)
- `limit` (query, optional): Number of notifications to return (1-100)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "Shift Reminder",
        "message": "Your shift starts in 30 minutes",
        "priority": "high",
        "isRead": false,
        "sentAt": "2024-01-15T07:30:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

#### PUT /users/{userId}/notifications/{id}/read
Mark a specific notification as read.

**Parameters:**
- `userId` (path, required): User ID (numeric)
- `id` (path, required): Notification ID (numeric)

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### PUT /users/{userId}/notifications/read-all
Mark all notifications as read.

**Parameters:**
- `userId` (path, required): User ID (numeric)

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## Data Models

### User Profile
```typescript
interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile: {
    employeeId: string;
    specialization: string;
    department: string;
    licenseNumber: string;
    certification: string;
    availableStart: string; // HH:MM:SS format
    availableEnd: string;   // HH:MM:SS format
  };
}
```

### Shift
```typescript
interface Shift {
  id: number;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  department: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  assignment?: {
    id: number;
    status: 'assigned' | 'completed' | 'cancelled';
    assignedAt: string; // ISO datetime
  };
}
```

### Available Shift
```typescript
interface AvailableShift {
  id: number;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  department: string;
  maxStaff: number;
  currentStaff: number;
  notes?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}
```

### Attendance Record
```typescript
interface AttendanceRecord {
  id: number;
  shift: {
    id: number;
    startTime: string; // ISO datetime
    endTime: string;   // ISO datetime
    department: string;
  };
  clockInTime: string; // ISO datetime
  clockOutTime?: string; // ISO datetime
  status: 'present' | 'absent' | 'late';
  totalHours?: number;
}
```

### Change Request
```typescript
interface ChangeRequest {
  id: number;
  shift: {
    id: number;
    startTime: string; // ISO datetime
    endTime: string;   // ISO datetime
    department: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO datetime
}
```

### Notification
```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  sentAt: string; // ISO datetime
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT Bearer token
2. **Authorization**: Users can only access their own data (userId validation)
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Data Encryption**: Sensitive data should be encrypted in transit and at rest

## Performance Considerations

1. **Pagination**: Implement pagination for list endpoints
2. **Caching**: Cache frequently accessed data (user profiles, shift schedules)
3. **Database Indexing**: Proper indexing on frequently queried fields
4. **Response Compression**: Enable gzip compression for API responses

## Monitoring and Logging

1. **Request Logging**: Log all API requests with timing information
2. **Error Tracking**: Track and alert on API errors
3. **Performance Metrics**: Monitor response times and throughput
4. **Usage Analytics**: Track API usage patterns

## Versioning Strategy

- Use URL versioning: `/api/v1/mobile/...`
- Maintain backward compatibility for at least 6 months
- Deprecation notices in response headers
- Documentation for migration guides

## Testing Strategy

1. **Unit Tests**: Test individual endpoint handlers
2. **Integration Tests**: Test complete API workflows
3. **Load Testing**: Test performance under expected load
4. **Security Testing**: Test authentication and authorization
5. **Mobile App Testing**: Test with actual mobile app integration 