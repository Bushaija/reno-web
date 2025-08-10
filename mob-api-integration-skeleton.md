# React Native TanStack Query Folder Structure

```
src/
├── api/
│   ├── client.ts              # API client with fetch logic
│   ├── types.ts               # All TypeScript interfaces
│   └── hooks/                 # Custom TanStack Query hooks
│       ├── useProfile.ts      # Profile get/update hooks
│       ├── useShifts.ts       # Shifts and available shifts hooks
│       ├── useAttendance.ts   # Clock in/out, records hooks
│       ├── useChangeRequests.ts # Change requests hooks
│       ├── useFeedback.ts     # Feedback submission hook
│       └── useNotifications.ts # Notifications hooks
├── providers/
│   └── QueryProvider.tsx     # TanStack Query client setup
├── utils/
│   └── storage.ts            # AsyncStorage token management
├── components/               # Your React Native components
│   ├── ProfileScreen.tsx
│   ├── ShiftsScreen.tsx
│   └── ...
└── App.tsx                   # Wrap with QueryProvider
```

## Setup Order:
1. Install dependencies
2. Create `utils/storage.ts`
3. Create `api/types.ts` 
4. Create `api/client.ts`
5. Create `providers/QueryProvider.tsx`
6. Create hooks in `api/hooks/`
7. Wrap App with QueryProvider
8. Use hooks in components