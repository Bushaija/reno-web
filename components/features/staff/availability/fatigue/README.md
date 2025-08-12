# Fatigue Management System

A comprehensive fatigue management system for nursing staff using TanStack Query and Hono API client.

## 🚀 Features

- **Fatigue Assessment Creation**: Submit new fatigue assessments for nurses
- **Assessment History**: View complete history of fatigue assessments
- **Analytics Dashboard**: Comprehensive fatigue trends and correlations
- **Real-time Updates**: Automatic data refresh and cache invalidation
- **Type Safety**: Full TypeScript support with proper interfaces

## 📁 File Structure

```
fatigue/
├── api/
│   ├── useFatigue.ts          # Core hooks and types
│   └── index.ts               # API exports
├── components/
│   ├── fatigue-assessment-form.tsx      # Form for new assessments
│   ├── fatigue-assessments-list.tsx     # List of assessments
│   ├── fatigue-trends-dashboard.tsx     # Analytics dashboard
│   ├── fatigue-management-page.tsx      # Main page component
│   └── index.ts                         # Component exports
└── README.md                            # This file
```

## 🔌 API Endpoints

### 1. Create Fatigue Assessment
- **POST** `/api/nurses/{id}/fatigue`
- **Purpose**: Submit a new fatigue assessment for a nurse
- **Hook**: `useCreateFatigueAssessment()`

### 2. Get Nurse Fatigue Assessments
- **GET** `/api/nurses/{id}/fatigue`
- **Purpose**: Retrieve all fatigue assessments for a specific nurse
- **Hook**: `useGetNurseFatigueAssessments(nurseId)`

### 3. Get Fatigue Trends Analytics
- **GET** `/api/reports/analytics/fatigue-trends`
- **Purpose**: Get comprehensive fatigue analytics across all nurses
- **Hook**: `useGetFatigueTrends(startDate, endDate)`

## 🎣 Available Hooks

### Core Hooks

#### `useCreateFatigueAssessment()`
Creates a new fatigue assessment for a nurse.

```typescript
const createAssessment = useCreateFatigueAssessment()

// Usage
await createAssessment.mutateAsync({
  nurseId: 123,
  assessmentData: {
    sleep_hours_reported: 7,
    stress_level_reported: 3,
    caffeine_intake_level: 2,
    notes: "Feeling well-rested today"
  }
})
```

#### `useGetNurseFatigueAssessments(nurseId: number)`
Fetches all fatigue assessments for a specific nurse.

```typescript
const { data: assessments, isLoading, error } = useGetNurseFatigueAssessments(123)

// Returns: FatigueAssessment[]
```

#### `useGetFatigueTrends(startDate: string, endDate: string)`
Fetches fatigue trends analytics for a date range.

```typescript
const { data: trends, isLoading, error } = useGetFatigueTrends("2025-07-01", "2025-08-12")

// Returns: FatigueTrendsData
```

### Convenience Hooks

#### `useGetLatestNurseFatigueAssessment(nurseId: number)`
Gets the most recent fatigue assessment for a nurse.

```typescript
const { data: latestAssessment, assessments } = useGetLatestNurseFatigueAssessment(123)

// Returns: { data: FatigueAssessment | null, assessments: FatigueAssessment[] }
```

#### `useGetNurseFatigueStats(nurseId: number)`
Calculates statistics from a nurse's fatigue assessments.

```typescript
const { data: stats } = useGetNurseFatigueStats(123)

// Returns: {
//   totalAssessments: number,
//   averageFatigueScore: number,
//   riskLevelDistribution: Record<string, number>,
//   recentTrend: Array<{ date: string, score: number }>
// }
```

## 🧩 Components

### `FatigueAssessmentForm`
A form component for submitting new fatigue assessments.

```typescript
<FatigueAssessmentForm 
  nurseId={123}
  onSuccess={() => console.log("Assessment submitted!")}
/>
```

**Props:**
- `nurseId`: ID of the nurse to assess
- `onSuccess?`: Callback function when assessment is submitted successfully

### `FatigueAssessmentsList`
Displays a list of all fatigue assessments for a nurse.

```typescript
<FatigueAssessmentsList nurseId={123} />
```

**Props:**
- `nurseId`: ID of the nurse whose assessments to display

### `FatigueTrendsDashboard`
Comprehensive analytics dashboard for fatigue trends.

```typescript
<FatigueTrendsDashboard 
  defaultStartDate="2025-07-01"
  defaultEndDate="2025-08-12"
/>
```

**Props:**
- `defaultStartDate`: Initial start date for analysis
- `defaultEndDate`: Initial end date for analysis

### `FatigueManagementPage`
Complete fatigue management interface with tabs for all functionality.

```typescript
<FatigueManagementPage defaultNurseId={123} />
```

**Props:**
- `defaultNurseId?`: Optional default nurse ID to select

## 📊 Data Types

### `FatigueAssessment`
```typescript
interface FatigueAssessment {
  assessment_id: number
  assessment_date: string
  hours_worked_last_24h: number | null
  hours_worked_last_7days: number | null
  consecutive_shifts: number
  hours_since_last_break: number | null
  sleep_hours_reported: string
  caffeine_intake_level: number
  stress_level_reported: number
  fatigue_risk_score: number
  risk_level: 'low' | 'medium' | 'high'
  recommendations: string
  created_at: string
}
```

### `CreateFatigueAssessmentRequest`
```typescript
interface CreateFatigueAssessmentRequest {
  sleep_hours_reported: number
  stress_level_reported: number
  caffeine_intake_level: number
  notes: string
}
```

### `FatigueTrendsData`
```typescript
interface FatigueTrendsData {
  averageFatigueScore: number
  riskDistribution: Array<{
    riskLevel: 'low' | 'medium' | 'high'
    count: number
    percentage: number
  }>
  trends: Array<{
    period: string
    avgFatigueScore: number
    highRiskCount: number
  }>
  correlations: {
    withOvertime: number
    withConsecutiveShifts: number
    withPatientLoad: number
  }
  recommendations: string[]
}
```

## 🎯 Usage Examples

### Basic Assessment Submission
```typescript
import { useCreateFatigueAssessment } from './api'

function SubmitAssessment() {
  const createAssessment = useCreateFatigueAssessment()
  
  const handleSubmit = async () => {
    try {
      await createAssessment.mutateAsync({
        nurseId: 123,
        assessmentData: {
          sleep_hours_reported: 6.5,
          stress_level_reported: 4,
          caffeine_intake_level: 2,
          notes: "Moderate fatigue, manageable"
        }
      })
      console.log("Assessment submitted!")
    } catch (error) {
      console.error("Failed to submit:", error)
    }
  }
  
  return (
    <button onClick={handleSubmit} disabled={createAssessment.isPending}>
      {createAssessment.isPending ? "Submitting..." : "Submit Assessment"}
    </button>
  )
}
```

### Display Nurse Assessments
```typescript
import { useGetNurseFatigueAssessments } from './api'

function NurseAssessments({ nurseId }: { nurseId: number }) {
  const { data: assessments, isLoading, error } = useGetNurseFatigueAssessments(nurseId)
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!assessments) return <div>No assessments found</div>
  
  return (
    <div>
      {assessments.map(assessment => (
        <div key={assessment.assessment_id}>
          <h3>Assessment #{assessment.assessment_id}</h3>
          <p>Score: {assessment.fatigue_risk_score}</p>
          <p>Risk Level: {assessment.risk_level}</p>
        </div>
      ))}
    </div>
  )
}
```

### Analytics Dashboard
```typescript
import { useGetFatigueTrends } from './api'

function AnalyticsDashboard() {
  const { data: trends, isLoading } = useGetFatigueTrends("2025-07-01", "2025-08-12")
  
  if (isLoading) return <div>Loading analytics...</div>
  if (!trends) return <div>No data available</div>
  
  return (
    <div>
      <h2>Fatigue Analytics</h2>
      <p>Average Score: {trends.averageFatigueScore.toFixed(1)}</p>
      <p>Total Assessments: {trends.riskDistribution.reduce((sum, item) => sum + item.count, 0)}</p>
      
      <h3>Recommendations</h3>
      <ul>
        {trends.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 🔄 Cache Management

All hooks automatically handle:
- **Cache invalidation** when new assessments are created
- **Optimistic updates** for better UX
- **Background refetching** to keep data fresh
- **Error handling** with proper fallbacks

## 🎨 Styling

Components use Shadcn UI components and Tailwind CSS for consistent styling:
- **Cards** for content organization
- **Badges** for risk level indicators
- **Tabs** for navigation between features
- **Responsive design** for mobile and desktop

## 🚦 Error Handling

All hooks include comprehensive error handling:
- **API errors** are caught and converted to user-friendly messages
- **Loading states** are managed automatically
- **Empty states** are handled gracefully
- **Network issues** are handled with retry logic

## 🔧 Customization

The system is designed to be easily customizable:
- **Date ranges** can be adjusted for analytics
- **Risk level thresholds** can be modified
- **Assessment fields** can be extended
- **Styling** can be customized with Tailwind classes

## 📱 Responsive Design

All components are mobile-friendly:
- **Grid layouts** that adapt to screen size
- **Touch-friendly** form controls
- **Readable text** on small screens
- **Proper spacing** for mobile devices

## 🎉 Getting Started

1. **Import the hooks** you need from the API
2. **Use the components** in your React components
3. **Customize the styling** to match your design system
4. **Handle errors** appropriately in your UI
5. **Test the integration** with your API endpoints

The system is production-ready and includes all necessary error handling, loading states, and type safety!

