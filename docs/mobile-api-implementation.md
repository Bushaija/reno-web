# Mobile API Implementation Documentation

## Overview

This document outlines the complete implementation of the mobile API routes for the Nurse Shifts Management System. The mobile API is designed specifically for healthcare workers using React Native + Expo applications.

## Architecture

The mobile API follows the same modular pattern as the web API:
- **Types**: Zod schemas for request/response validation
- **Routes**: OpenAPI route definitions
- **Handlers**: Business logic and database operations
- **Index**: Module registration and router setup

## Implemented Modules

### 1. Profile Management (`/mobile/profile`)

**Endpoints:**
- `GET /mobile/profile` - Get current user profile
- `PUT /mobile/profile` - Update profile information

**Features:**
- Retrieve healthcare worker profile with employee details
- Update availability times, specialization, and contact information
- Validation for time formats and required fields

**Database Tables:**
- `users` - Basic user information
- `healthcareWorkers` - Professional details
- `staff` - Contact information

### 2. Shift Management (`/mobile/shifts`)

**Endpoints:**
- `GET /mobile/shifts/my-shifts` - Get current user's shifts
- `GET /mobile/shifts/available` - Get available shifts for pickup
- `POST /mobile/shifts/:id/request` - Request to pick up an available shift

**Features:**
- View assigned shifts with filtering by date and status
- Browse available shifts with staff shortage indicators
- Submit shift pickup requests for admin approval
- Automatic urgency calculation based on staff shortage

**Database Tables:**
- `shifts` - Shift information
- `shiftAssignments` - Worker assignments
- `changeRequests` - Shift pickup requests

### 3. Attendance System (`/mobile/attendance`)

**Endpoints:**
- `POST /mobile/attendance/clock-in` - Clock in for a shift
- `POST /mobile/attendance/clock-out` - Clock out from a shift
- `GET /mobile/attendance/my-records` - Get attendance history

**Features:**
- Location-based clock in/out with GPS coordinates
- Automatic late detection (15+ minutes after start time)
- Attendance history with summary statistics
- Monthly filtering and pagination

**Database Tables:**
- `attendanceRecords` - Clock in/out records
- `shifts` - Shift scheduling information

### 4. Change Requests (`/mobile/change-requests`)

**Endpoints:**
- `POST /mobile/change-requests` - Submit a change request
- `GET /mobile/change-requests/my-requests` - Get user's change requests

**Features:**
- Submit change requests for assigned shifts
- View request history and status
- Prevent duplicate requests for the same shift
- Integration with shift assignment system

**Database Tables:**
- `changeRequests` - Request tracking
- `shifts` - Shift information

### 5. Notifications (`/mobile/notifications`)

**Endpoints:**
- `GET /mobile/notifications` - Get user notifications
- `PUT /mobile/notifications/:id/read` - Mark notification as read
- `PUT /mobile/notifications/read-all` - Mark all notifications as read

**Features:**
- Priority-based notification system
- Unread count tracking
- Bulk read operations
- Filtering by read status

**Database Tables:**
- `notifications` - Notification storage

### 6. Feedback System (`/mobile/feedback`)

**Endpoints:**
- `POST /mobile/feedback` - Submit shift feedback

**Features:**
- 1-5 star rating system
- Optional comment field
- Only for completed shifts
- Prevents duplicate feedback

**Database Tables:**
- `feedback` - Feedback storage
- `shifts` - Shift completion status

## Security Features

### Authentication
- JWT token-based authentication
- User ID extraction from tokens
- Role-based access control (healthcare workers only)

### Data Validation
- Zod schema validation for all requests
- Input sanitization and type checking
- Business rule validation (e.g., shift completion status)

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging
- Timestamp tracking for all errors

## Database Relationships

The mobile API leverages the following key relationships:

1. **User Hierarchy:**
   ```
   users (id) → healthcareWorkers (userId) → staff (staffId)
   ```

2. **Shift Management:**
   ```
   shifts (shiftId) → shiftAssignments (shiftId, workerId)
   shifts (shiftId) → changeRequests (requestedShiftId)
   ```

3. **Attendance Tracking:**
   ```
   shifts (shiftId) → attendanceRecords (shiftId, workerId)
   ```

4. **Feedback System:**
   ```
   shifts (shiftId) → feedback (shiftId, workerId)
   ```

## API Response Format

All endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [] // Optional validation details
  },
  "timestamp": "2025-01-22T15:30:00Z"
}
```

## Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication token
- `NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Request data validation failed
- `CONFLICT` - Resource already exists or business rule violation
- `INTERNAL_ERROR` - Server-side error

## Rate Limiting

The mobile API implements rate limiting:
- **Mobile endpoints**: 500 requests per hour
- **Authentication endpoints**: 10 requests per minute

## Future Enhancements

### Phase 6: Advanced Features
1. **Real-time Updates**: WebSocket integration for live notifications
2. **Push Notifications**: FCM/APNS integration
3. **Offline Support**: Local data caching and sync
4. **Advanced Filtering**: Multi-criteria search and filtering
5. **Performance Optimization**: Query optimization and caching

### Phase 7: Analytics & Reporting
1. **Worker Analytics**: Performance metrics and trends
2. **Shift Analytics**: Department workload analysis
3. **Attendance Analytics**: Patterns and insights
4. **Feedback Analytics**: Quality improvement metrics

## Testing Strategy

### Unit Tests
- Handler function testing
- Database query validation
- Error handling verification

### Integration Tests
- End-to-end API testing
- Database transaction testing
- Authentication flow testing

### Performance Tests
- Load testing for concurrent users
- Database query performance
- Response time optimization

## Deployment Considerations

### Environment Variables
- Database connection strings
- JWT secret keys
- Rate limiting configuration
- Logging levels

### Monitoring
- API response times
- Error rates and types
- Database query performance
- User activity metrics

### Security
- HTTPS enforcement
- CORS configuration
- Input validation
- SQL injection prevention

## Conclusion

The mobile API implementation provides a comprehensive solution for healthcare worker shift management with:

- **Complete CRUD operations** for all major entities
- **Robust error handling** and validation
- **Scalable architecture** following best practices
- **Security-first approach** with proper authentication
- **Consistent API design** for easy client integration

The modular structure allows for easy maintenance and future enhancements while providing a solid foundation for the mobile application. 