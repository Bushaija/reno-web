# Change Request Functionality Test Plan

## Prerequisites
1. Ensure the database has test data:
   - Healthcare workers in `healthcare_workers` table
   - Shifts in `shifts` table
   - At least one change request in `change_requests` table

## Test Data Setup
Run the following SQL to create test data:

```sql
-- Insert a test change request
INSERT INTO change_requests (
    requester_id,
    requested_shift_id,
    reason,
    status,
    submitted_at
) VALUES (
    1,  -- worker_id from healthcare_workers table
    4,  -- shift_id from shifts table
    'Need to swap shifts due to personal emergency. I have a doctor appointment on the scheduled day.',
    'pending',
    CURRENT_TIMESTAMP
);
```

## Test Cases

### 1. View Change Request Details ✅
**Test Steps:**
1. Navigate to Change Requests page
2. Click "View" button on any change request
3. Verify detailed information is displayed

**Expected Result:**
- Alert shows complete change request details including:
  - Request ID, Status, Submission date
  - Requester name and employee ID
  - Shift information (ID, department, start/end times)
  - Reason for change

### 2. Review Shift Details ✅
**Test Steps:**
1. Navigate to Change Requests page
2. Click "Review Details" button on any change request
3. Verify shift details are displayed

**Expected Result:**
- Alert shows detailed shift information including:
  - Shift ID, department, start/end times
  - Duration calculation
  - Requester information
  - Change request context

### 3. Approve Change Request ✅
**Test Steps:**
1. Navigate to Change Requests page
2. Find a request with "pending" status
3. Click "Approve" button
4. Confirm the action in the dialog
5. Verify the request status changes

**Expected Result:**
- Confirmation dialog shows request details
- Status changes to "approved"
- Success toast notification appears
- Request disappears from pending count
- Request appears in approved count

### 4. Reject Change Request ✅
**Test Steps:**
1. Navigate to Change Requests page
2. Find a request with "pending" status
3. Click "Reject" button
4. Confirm the action in the dialog
5. Verify the request status changes

**Expected Result:**
- Confirmation dialog shows request details
- Status changes to "rejected"
- Success toast notification appears
- Request disappears from pending count
- Request appears in rejected count

### 5. Prevent Duplicate Actions ✅
**Test Steps:**
1. Try to approve/reject an already processed request
2. Verify error handling

**Expected Result:**
- Error toast appears: "Cannot Approve/Reject - This request is already [status]"
- No action is taken

### 6. Loading States ✅
**Test Steps:**
1. Perform approve/reject actions
2. Observe loading states

**Expected Result:**
- Button shows "Processing..." during API call
- Button is disabled during processing
- Loading state clears after completion

### 7. Error Handling ✅
**Test Steps:**
1. Simulate network errors
2. Test with invalid data

**Expected Result:**
- Error toast notifications appear
- User-friendly error messages
- Application remains stable

### 8. Summary Cards ✅
**Test Steps:**
1. Navigate to Change Requests page
2. Verify summary card counts

**Expected Result:**
- Pending count shows correct number
- Approved count shows correct number
- Rejected count shows correct number
- Counts update after actions

### 9. Pagination ✅
**Test Steps:**
1. Navigate through pages
2. Change page size
3. Verify data loads correctly

**Expected Result:**
- Data loads for each page
- Pagination controls work
- URL parameters update correctly

### 10. Refresh Functionality ✅
**Test Steps:**
1. Click refresh button
2. Verify data reloads

**Expected Result:**
- Data refreshes from server
- Loading state shows briefly
- Updated data displays

## API Endpoints Tested

### GET /api/admin/change-requests
- ✅ Fetches change requests with pagination
- ✅ Supports status filtering
- ✅ Returns proper data structure

### PUT /api/admin/change-requests/:id
- ✅ Updates request status
- ✅ Handles approve/reject actions
- ✅ Returns success/error responses

## Browser Console Logs to Monitor

1. **Data Fetching:**
   - "Error fetching change requests: ..." (if errors occur)

2. **User Actions:**
   - "View request: ..." (when viewing details)
   - "Review shift details: ..." (when reviewing shift)
   - "Failed to update change request: ..." (if update fails)

3. **API Responses:**
   - Network tab shows successful API calls
   - Response data matches expected structure

## Success Criteria

✅ All test cases pass
✅ No console errors
✅ UI is responsive and user-friendly
✅ Data persists correctly in database
✅ Real-time updates work
✅ Error handling is robust
✅ Loading states provide good UX 