# Hooks Documentation

This document provides comprehensive documentation for all custom hooks in the application.

## Table of Contents

- [Time-Off Request Hooks](#time-off-request-hooks)
- [Swap Request Hooks](#swap-request-hooks)

## Time-Off Request Hooks

### Overview
The time-off request hooks provide a complete interface for managing nurse time-off requests using TanStack Query and the Hono API client.

### API Endpoints
- `GET /api/time-off-requests` - Fetch time-off requests with filters
- `POST /api/time-off-requests` - Create new time-off request
- `PUT /api/time-off-requests/{id}` - Update time-off request status

### Hooks

#### `useGetTimeOffRequests(filters?)`
Fetches time-off requests with optional filtering.

**Parameters:**
- `filters` (optional): `TimeOffRequestFilters` object

**Returns:**
- `isLoading`: Loading state
- `error`: Error state
- `data`: `TimeOffRequestsResponse` with pagination
- `refetch`: Function to refetch data

**Example:**
```typescript
const { data, isLoading, error } = useGetTimeOffRequests({
  status: ['pending'],
  nurse_id: 123,
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

#### `useCreateTimeOffRequest()`
Creates a new time-off request.

**Returns:**
- `mutate`: Function to create request
- `mutateAsync`: Async function to create request
- `isPending`: Loading state
- `error`: Error state

**Example:**
```typescript
const createRequest = useCreateTimeOffRequest();

const handleSubmit = async () => {
  try {
    await createRequest.mutateAsync({
      worker_id: 123,
      start_date: '2024-01-15',
      end_date: '2024-01-17',
      request_type: 'vacation',
      reason: 'Family vacation'
    });
  } catch (error) {
    console.error('Failed to create request:', error);
  }
};
```

#### `useUpdateTimeOffRequest()`
Updates an existing time-off request.

**Returns:**
- `mutate`: Function to update request
- `mutateAsync`: Async function to update request
- `isPending`: Loading state
- `error`: Error state

**Example:**
```typescript
const updateRequest = useUpdateTimeOffRequest();

const handleUpdate = async () => {
  try {
    await updateRequest.mutateAsync({
      id: 456,
      updates: {
        status: 'approved',
        admin_notes: 'Approved by manager'
      }
    });
  } catch (error) {
    console.error('Failed to update request:', error);
  }
};
```

### Convenience Hooks

#### `useGetTimeOffRequest(requestId)`
Gets a single time-off request by ID.

#### `useGetNurseTimeOffRequests(nurseId)`
Gets time-off requests for a specific nurse.

#### `useGetTimeOffRequestsByStatus(status)`
Gets time-off requests filtered by status.

#### `useGetTimeOffRequestsByDateRange(startDate, endDate)`
Gets time-off requests within a date range.

### Types

#### `TimeOffRequest`
```typescript
interface TimeOffRequest {
  request_id: number;
  nurse: {
    worker_id: number;
    employee_id: string;
    specialization: string | null;
    name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  request_type: 'vacation' | 'sick' | 'personal' | 'family' | 'bereavement' | 'jury_duty' | 'military';
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  approved_by: number | null;
  submitted_at: string;
  reviewed_at: string | null;
}
```

#### `CreateTimeOffRequestRequest`
```typescript
interface CreateTimeOffRequestRequest {
  worker_id: number;
  start_date: string;
  end_date: string;
  request_type: 'vacation' | 'sick' | 'personal' | 'family' | 'bereavement' | 'jury_duty' | 'military';
  reason: string;
}
```

#### `UpdateTimeOffRequestRequest`
```typescript
interface UpdateTimeOffRequestRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  admin_notes?: string;
  reason?: string;
}
```

---

## Swap Request Hooks

### Overview
The swap request hooks provide a complete interface for managing nurse shift swap requests using TanStack Query and the Hono API client.

### API Endpoints
- `GET /swap-requests` - Fetch swap requests with filters
- `POST /swap-requests` - Create new swap request
- `PUT /swap-requests/{id}` - Update swap request
- `GET /swap-requests/{id}` - Get single swap request
- `GET /swap-requests/opportunities` - Find available swap opportunities
- `POST /swap-requests/{swap_id}/accept` - Accept a swap request

### Hooks

#### `useGetSwapRequests(filters?)`
Fetches swap requests with optional filtering.

**Parameters:**
- `filters` (optional): `SwapRequestFilters` object

**Returns:**
- `isLoading`: Loading state
- `error`: Error state
- `data`: `SwapRequestsResponse` with pagination
- `refetch`: Function to refetch data

**Example:**
```typescript
const { data, isLoading, error } = useGetSwapRequests({
  status: ['pending'],
  nurse_id: 123,
  department_id: 456,
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});
```

#### `useGetSwapOpportunities(filters?)`
Fetches available swap opportunities.

**Parameters:**
- `filters` (optional): `SwapOpportunityFilters` object

**Returns:**
- `isLoading`: Loading state
- `error`: Error state
- `data`: `SwapOpportunitiesResponse`
- `refetch`: Function to refetch data

**Example:**
```typescript
const { data, isLoading, error } = useGetSwapOpportunities({
  nurse_id: 123,
  department_id: 456,
  shift_type: 'night',
  date_range_start: '2024-01-01',
  date_range_end: '2024-01-31'
});
```

#### `useCreateSwapRequest()`
Creates a new swap request.

**Returns:**
- `mutate`: Function to create request
- `mutateAsync`: Async function to create request
- `isPending`: Loading state
- `error`: Error state

**Example:**
```typescript
const createRequest = useCreateSwapRequest();

const handleSubmit = async () => {
  try {
    await createRequest.mutateAsync({
      original_shift_id: 789,
      target_nurse_id: 456,
      requested_shift_id: 790,
      swap_type: 'full_shift',
      reason: 'Medical appointment',
      expires_in_hours: 72
    });
  } catch (error) {
    console.error('Failed to create swap request:', error);
  }
};
```

#### `useUpdateSwapRequest()`
Updates an existing swap request.

**Returns:**
- `mutate`: Function to update request
- `mutateAsync`: Async function to update request
- `isPending`: Loading state
- `error`: Error state

**Example:**
```typescript
const updateRequest = useUpdateSwapRequest();

const handleUpdate = async () => {
  try {
    await updateRequest.mutateAsync({
      id: 456,
      updates: {
        status: 'cancelled',
        reason: 'No longer needed'
      }
    });
  } catch (error) {
    console.error('Failed to update swap request:', error);
  }
};
```

#### `useAcceptSwapRequest()`
Accepts a swap request.

**Returns:**
- `mutate`: Function to accept request
- `mutateAsync`: Async function to accept request
- `isPending`: Loading state
- `error`: Error state

**Example:**
```typescript
const acceptRequest = useAcceptSwapRequest();

const handleAccept = async (swapId: number) => {
  try {
    await acceptRequest.mutateAsync(swapId);
  } catch (error) {
    console.error('Failed to accept swap request:', error);
  }
};
```

#### `useGetSwapRequest(requestId)`
Gets a single swap request by ID.

**Parameters:**
- `requestId`: The ID of the swap request

**Returns:**
- `isLoading`: Loading state
- `error`: Error state
- `data`: `SwapRequestResponse`

### Convenience Hooks

#### `useGetNurseSwapRequests(nurseId)`
Gets swap requests for a specific nurse.

#### `useGetSwapRequestsByStatus(status)`
Gets swap requests filtered by status.

#### `useGetSwapRequestsByDepartment(departmentId)`
Gets swap requests filtered by department.

#### `useGetNurseSwapOpportunities(nurseId)`
Gets swap opportunities for a specific nurse.

### Types

#### `SwapRequest`
```typescript
interface SwapRequest {
  swap_id: number;
  requesting_nurse: Nurse;
  target_nurse: Nurse;
  original_shift: Shift;
  requested_shift: Shift;
  swap_type: 'full_shift' | 'partial_shift';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
}
```

#### `SwapOpportunity`
```typescript
interface SwapOpportunity {
  swap_request: SwapRequest;
  compatibility_score: number;
  match_reasons: string[];
}
```

#### `Nurse`
```typescript
interface Nurse {
  worker_id: number;
  employee_id: string;
  specialization: string | null;
  name: string;
  email: string;
}
```

#### `Shift`
```typescript
interface Shift {
  shift_id: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  date: string;
  department_id: number;
  department_name: string;
}
```

#### `CreateSwapRequestRequest`
```typescript
interface CreateSwapRequestRequest {
  original_shift_id: number;
  target_nurse_id: number;
  requested_shift_id: number;
  swap_type: 'full_shift' | 'partial_shift';
  reason: string;
  expires_in_hours: number;
}
```

#### `UpdateSwapRequestRequest`
```typescript
interface UpdateSwapRequestRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  reason?: string;
  expires_in_hours?: number;
}
```

### Query Keys

#### `swapRequestsQueryKey`
Used for invalidating swap request queries.

#### `swapOpportunitiesQueryKey`
Used for invalidating swap opportunity queries.

### Features

- **Automatic Caching**: TanStack Query provides intelligent caching with configurable stale times
- **Optimistic Updates**: Immediate UI updates with automatic rollback on errors
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support with proper interfaces
- **Real-time Updates**: Automatic query invalidation and cache updates
- **Filtering**: Support for complex filtering and pagination
- **Performance**: Efficient data fetching with background updates

### Usage Patterns

#### Basic Usage
```typescript
import { useGetSwapRequests, useCreateSwapRequest } from '@/hooks';

function SwapRequestsPage() {
  const { data, isLoading, error } = useGetSwapRequests();
  const createRequest = useCreateSwapRequest();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(request => (
        <SwapRequestCard key={request.swap_id} request={request} />
      ))}
    </div>
  );
}
```

#### With Filters
```typescript
function FilteredSwapRequests() {
  const [filters, setFilters] = useState<SwapRequestFilters>({
    status: ['pending'],
    department_id: 1
  });

  const { data, isLoading } = useGetSwapRequests(filters);

  return (
    <div>
      <FilterControls filters={filters} onFiltersChange={setFilters} />
      <SwapRequestsList requests={data?.data || []} />
    </div>
  );
}
```

#### Creating Requests
```typescript
function CreateSwapRequestForm() {
  const createRequest = useCreateSwapRequest();

  const handleSubmit = async (formData: CreateSwapRequestRequest) => {
    try {
      await createRequest.mutateAsync(formData);
      toast.success('Swap request created successfully!');
    } catch (error) {
      toast.error('Failed to create swap request');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

This comprehensive hook system provides a robust foundation for managing nurse shift swap requests with excellent developer experience and performance characteristics.
