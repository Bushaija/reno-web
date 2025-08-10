# TanStack Query Setup for React Native Healthcare App

## 1. Installation

First, install the required dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
# or
yarn add @tanstack/react-query @tanstack/react-query-devtools
```

## 2. Project Structure

```
src/
├── api/
│   ├── client.ts           # API client configuration
│   ├── types.ts           # TypeScript interfaces
│   └── hooks/             # Custom hooks
│       ├── useProfile.ts
│       ├── useShifts.ts
│       ├── useAttendance.ts
│       ├── useChangeRequests.ts
│       ├── useFeedback.ts
│       └── useNotifications.ts
├── providers/
│   └── QueryProvider.tsx  # Query client provider
└── utils/
    └── storage.ts         # Token storage utilities
```

## 3. Setup Files

### src/utils/storage.ts
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
};
```

### src/api/types.ts
```typescript
// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// User Profile types
export interface UserProfile {
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
    availableStart: string;
    availableEnd: string;
  };
}

export interface UpdateProfileRequest {
  phone?: string;
  profile?: Partial<UserProfile['profile']>;
}

// Shift types
export interface Shift {
  id: number;
  startTime: string;
  endTime: string;
  department: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  assignment?: {
    id: number;
    status: 'assigned' | 'completed' | 'cancelled';
    assignedAt: string;
  };
}

export interface AvailableShift {
  id: number;
  startTime: string;
  endTime: string;
  department: string;
  maxStaff: number;
  currentStaff: number;
  notes?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ShiftsParams {
  startDate?: string;
  endDate?: string;
  status?: Shift['status'];
}

export interface AvailableShiftsParams {
  date?: string;
  department?: string;
}

// Attendance types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface ClockInRequest {
  shiftId: number;
  location: Location;
}

export interface ClockOutRequest {
  recordId: number;
  location: Location;
}

export interface AttendanceRecord {
  id: number;
  shift: {
    id: number;
    startTime: string;
    endTime: string;
    department: string;
  };
  clockInTime: string;
  clockOutTime?: string;
  status: 'present' | 'absent' | 'late';
  totalHours?: number;
}

export interface AttendanceRecordsParams {
  month?: string;
  limit?: number;
}

export interface AttendanceResponse {
  records: AttendanceRecord[];
  summary: {
    totalHours: number;
    averageHours: number;
    attendanceRate: number;
  };
}

// Change Request types
export interface ChangeRequest {
  id: number;
  shift: {
    id: number;
    startTime: string;
    endTime: string;
    department: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface CreateChangeRequestRequest {
  shiftId: number;
  reason: string;
}

// Feedback types
export interface CreateFeedbackRequest {
  shiftId: number;
  rating: number;
  comment: string;
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  sentAt: string;
}

export interface NotificationsParams {
  unread?: boolean;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
```

### src/api/client.ts
```typescript
import { tokenStorage } from '../utils/storage';
import { ApiResponse } from './types';

const BASE_URL = 'https://your-api-domain.com/api/mobile'; // Replace with your actual API URL

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await tokenStorage.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
```

### src/providers/QueryProvider.tsx
```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 429)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {__DEV__ && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export { queryClient };
```

## 4. Custom Hooks

### src/api/hooks/useProfile.ts
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { UserProfile, UpdateProfileRequest } from '../types';

export const useUserProfile = (userId: number) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => apiClient.get<UserProfile>(`/users/${userId}/profile`),
    enabled: !!userId,
  });
};

export const useUpdateProfile = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiClient.put(`/users/${userId}/profile`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
};
```

### src/api/hooks/useShifts.ts
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { Shift, AvailableShift, ShiftsParams, AvailableShiftsParams } from '../types';

export const useUserShifts = (userId: number, params?: ShiftsParams) => {
  return useQuery({
    queryKey: ['shifts', userId, params],
    queryFn: () => 
      apiClient.get<{ shifts: Shift[] }>(`/users/${userId}/shifts`, params),
    enabled: !!userId,
  });
};

export const useAvailableShifts = (params?: AvailableShiftsParams) => {
  return useQuery({
    queryKey: ['availableShifts', params],
    queryFn: () => 
      apiClient.get<{ shifts: AvailableShift[] }>('/shifts/available', params),
  });
};

export const useRequestShift = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shiftId: number) =>
      apiClient.post(`/users/${userId}/shifts/${shiftId}/request`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableShifts'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', userId] });
    },
  });
};
```

### src/api/hooks/useAttendance.ts
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { 
  AttendanceResponse, 
  AttendanceRecordsParams, 
  ClockInRequest, 
  ClockOutRequest 
} from '../types';

export const useAttendanceRecords = (userId: number, params?: AttendanceRecordsParams) => {
  return useQuery({
    queryKey: ['attendance', userId, params],
    queryFn: () => 
      apiClient.get<AttendanceResponse>(`/users/${userId}/attendance/records`, params),
    enabled: !!userId,
  });
};

export const useClockIn = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClockInRequest) =>
      apiClient.post(`/users/${userId}/attendance/clock-in`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', userId] });
      queryClient.invalidateQueries({ queryKey: ['shifts', userId] });
    },
  });
};

export const useClockOut = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClockOutRequest) =>
      apiClient.post(`/users/${userId}/attendance/clock-out`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', userId] });
      queryClient.invalidateQueries({ queryKey: ['shifts', userId] });
    },
  });
};
```

### src/api/hooks/useChangeRequests.ts
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { ChangeRequest, CreateChangeRequestRequest } from '../types';

export const useChangeRequests = (userId: number) => {
  return useQuery({
    queryKey: ['changeRequests', userId],
    queryFn: () => 
      apiClient.get<{ requests: ChangeRequest[] }>(`/users/${userId}/change-requests`),
    enabled: !!userId,
  });
};

export const useCreateChangeRequest = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChangeRequestRequest) =>
      apiClient.post(`/users/${userId}/change-requests`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests', userId] });
    },
  });
};
```

### src/api/hooks/useFeedback.ts
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { CreateFeedbackRequest } from '../types';

export const useCreateFeedback = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) =>
      apiClient.post(`/users/${userId}/feedback`, data),
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['shifts', userId] });
    },
  });
};
```

### src/api/hooks/useNotifications.ts
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { NotificationsResponse, NotificationsParams } from '../types';

export const useNotifications = (userId: number, params?: NotificationsParams) => {
  return useQuery({
    queryKey: ['notifications', userId, params],
    queryFn: () => 
      apiClient.get<NotificationsResponse>(`/users/${userId}/notifications`, params),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useMarkNotificationAsRead = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      apiClient.put(`/users/${userId}/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};

export const useMarkAllNotificationsAsRead = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.put(`/users/${userId}/notifications/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};
```

## 5. App Setup

### App.tsx
```typescript
import React from 'react';
import { QueryProvider } from './src/providers/QueryProvider';
import { YourMainComponent } from './src/components/YourMainComponent';

export default function App() {
  return (
    <QueryProvider>
      <YourMainComponent />
    </QueryProvider>
  );
}
```

## 6. Usage Examples

### Example Component - Profile Screen
```typescript
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useUserProfile, useUpdateProfile } from '../api/hooks/useProfile';

interface ProfileScreenProps {
  userId: number;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userId }) => {
  const { data: profile, isLoading, error } = useUserProfile(userId);
  const updateProfileMutation = useUpdateProfile(userId);

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(
      {
        phone: '+1234567890',
        profile: {
          availableStart: '09:00:00',
          availableEnd: '17:00:00',
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated successfully!');
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Name: {profile?.data?.name}</Text>
      <Text>Email: {profile?.data?.email}</Text>
      <Text>Department: {profile?.data?.profile.department}</Text>
      <Button
        title="Update Profile"
        onPressed={handleUpdateProfile}
        disabled={updateProfileMutation.isPending}
      />
    </View>
  );
};
```

### Example Component - Shifts Screen
```typescript
import React from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useUserShifts, useRequestShift } from '../api/hooks/useShifts';

interface ShiftsScreenProps {
  userId: number;
}

export const ShiftsScreen: React.FC<ShiftsScreenProps> = ({ userId }) => {
  const { data: shifts, isLoading, refetch } = useUserShifts(userId);
  const requestShiftMutation = useRequestShift(userId);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <Text>Loading shifts...</Text>;
  }

  return (
    <View>
      <Button title="Refresh" onPressed={handleRefresh} />
      <FlatList
        data={shifts?.data?.shifts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1 }}>
            <Text>Department: {item.department}</Text>
            <Text>Start: {new Date(item.startTime).toLocaleString()}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};
```

## 7. Additional Configuration

### Error Handling
You can create a global error handler:

```typescript
// src/utils/errorHandler.ts
import { Alert } from 'react-native';

export const handleApiError = (error: any) => {
  const message = error?.message || 'An unexpected error occurred';
  Alert.alert('Error', message);
  
  // Log error for debugging
  console.error('API Error:', error);
  
  // You can also send to crash reporting service
  // crashlytics().recordError(error);
};
```

### Optimistic Updates
For better UX, you can implement optimistic updates:

```typescript
export const useMarkNotificationAsReadOptimistic = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      apiClient.put(`/users/${userId}/notifications/${notificationId}/read`),
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications', userId] });

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData(['notifications', userId]);

      // Optimistically update
      queryClient.setQueryData(['notifications', userId], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((notif: any) =>
              notif.id === notificationId ? { ...notif, isRead: true } : notif
            ),
            unreadCount: Math.max(0, old.data.unreadCount - 1),
          },
        };
      });

      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      queryClient.setQueryData(['notifications', userId], context?.previousNotifications);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });
};
```

This setup provides a robust foundation for your React Native healthcare app with TanStack Query!