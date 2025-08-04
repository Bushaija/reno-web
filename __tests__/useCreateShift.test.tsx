import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateShift } from '@/features/shifts/api';
import { honoClient } from '@/lib/hono';

// Mock the Hono client
jest.mock('@/lib/hono', () => ({
  honoClient: {
    api: {
      '/admin/shifts': {
        $post: jest.fn(),
      },
    },
  },
}));

// Mock handleHonoResponse
jest.mock('@/lib/hono', () => ({
  ...jest.requireActual('@/lib/hono'),
  handleHonoResponse: jest.fn(),
}));

const mockHonoClient = honoClient as jest.Mocked<typeof honoClient>;

describe('useCreateShift', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockShiftData = {
    workerId: 1,
    startTime: '2025-07-30T08:00:00.000Z',
    endTime: '2025-07-30T16:00:00.000Z',
    department: 'Emergency',
    maxStaff: 2,
    notes: 'Test shift',
    status: 'scheduled' as const,
  };

  it('should create a shift successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 1,
        message: 'Shift created successfully',
      },
    };

    mockHonoClient.api['/admin/shifts'].$post.mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const { result } = renderHook(() => useCreateShift(), { wrapper });

    const mutation = result.current;

    await mutation.mutateAsync(mockShiftData);

    expect(mockHonoClient.api['/admin/shifts'].$post).toHaveBeenCalledWith(mockShiftData);
    expect(mutation.isSuccess).toBe(true);
  });

  it('should handle API errors', async () => {
    const mockError = {
      success: false,
      message: 'Worker not found',
    };

    mockHonoClient.api['/admin/shifts'].$post.mockResolvedValue(
      new Response(JSON.stringify(mockError), { status: 400 })
    );

    const { result } = renderHook(() => useCreateShift(), { wrapper });

    const mutation = result.current;

    await expect(mutation.mutateAsync(mockShiftData)).rejects.toThrow();

    expect(mockHonoClient.api['/admin/shifts'].$post).toHaveBeenCalledWith(mockShiftData);
    expect(mutation.isError).toBe(true);
  });

  it('should handle network errors', async () => {
    mockHonoClient.api['/admin/shifts'].$post.mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useCreateShift(), { wrapper });

    const mutation = result.current;

    await expect(mutation.mutateAsync(mockShiftData)).rejects.toThrow('Network error');

    expect(mutation.isError).toBe(true);
  });

  it('should invalidate shifts query on success', async () => {
    const mockResponse = {
      success: true,
      data: { id: 1, message: 'Shift created successfully' },
    };

    mockHonoClient.api['/admin/shifts'].$post.mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const { result } = renderHook(() => useCreateShift(), { wrapper });

    const mutation = result.current;

    await mutation.mutateAsync(mockShiftData);

    await waitFor(() => {
      expect(mutation.isSuccess).toBe(true);
    });

    // Check if the shifts query was invalidated
    const queries = queryClient.getQueryCache().getAll();
    const shiftsQueries = queries.filter(query => 
      query.queryKey[0] === 'shifts'
    );
    
    // The invalidation should trigger a refetch
    expect(shiftsQueries.length).toBeGreaterThan(0);
  });

  it('should handle different shift data formats', async () => {
    const testCases = [
      {
        name: 'Minimal data',
        data: {
          workerId: 1,
          startTime: '2025-07-30T08:00:00.000Z',
          endTime: '2025-07-30T16:00:00.000Z',
          department: 'ICU',
        },
      },
      {
        name: 'Full data with optional fields',
        data: {
          workerId: 2,
          startTime: '2025-07-31T06:00:00.000Z',
          endTime: '2025-07-31T18:00:00.000Z',
          department: 'Emergency',
          maxStaff: 3,
          notes: 'Long shift with extra staff',
          status: 'scheduled' as const,
        },
      },
    ];

    for (const testCase of testCases) {
      const mockResponse = {
        success: true,
        data: { id: Math.random(), message: 'Shift created successfully' },
      };

      mockHonoClient.api['/admin/shifts'].$post.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const { result } = renderHook(() => useCreateShift(), { wrapper });
      const mutation = result.current;

      await mutation.mutateAsync(testCase.data);

      expect(mockHonoClient.api['/admin/shifts'].$post).toHaveBeenCalledWith(testCase.data);
      expect(mutation.isSuccess).toBe(true);
    }
  });
}); 