# Skills API Hooks

This directory contains custom React hooks for managing skills using TanStack Query and the Hono API client. The hooks are designed to work with your existing nurse skill assignment API and provide additional functionality for general skills management.

## Available Hooks

### Query Hooks

#### General Skills Management (Admin)
- **`useGetSkills()`** - Fetches all available skills from the skills catalog
- **`useGetSkillsByCategory(category)`** - Fetches skills filtered by category
- **`useGetSkill(skillId)`** - Fetches a single skill by ID

#### Nurse Skill Assignments (Your Current API)
- **`useGetNurseSkills(nurseId)`** - Fetches skills assigned to a specific nurse
- **`useGetNurseSkillsByCategory(nurseId, category)`** - Fetches nurse skills filtered by category

### Mutation Hooks

#### General Skills Management (Admin)
- **`useCreateSkill()`** - Creates a new skill in the skills catalog
- **`useUpdateSkill()`** - Updates an existing skill
- **`useDeleteSkill()`** - Deletes a skill

#### Nurse Skill Assignments (Your Current API)
- **`useAssignSkillToNurse()`** - Assigns a skill to a nurse with proficiency level
- **`useRemoveSkillFromNurse()`** - Removes a skill assignment from a nurse

## Usage Examples

### Fetching Skills Assigned to a Nurse

```tsx
import { useGetNurseSkills } from './api';

function NurseSkillsList({ nurseId }: { nurseId: number }) {
  const { data: nurseSkills, isLoading, error } = useGetNurseSkills(nurseId);

  if (isLoading) return <div>Loading nurse skills...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {nurseSkills?.map(skill => (
        <div key={skill.skill_id}>
          <h3>{skill.skill_name}</h3>
          <p>Category: {skill.skill_category}</p>
          <p>Level: {skill.skill_level}</p>
          <p>Certified: {skill.certified_date || 'Not certified'}</p>
          <p>Expires: {skill.expiry_date || 'No expiry'}</p>
        </div>
      ))}
    </div>
  );
}
```

### Assigning a Skill to a Nurse

```tsx
import { useAssignSkillToNurse } from './api';

function AssignSkillForm({ nurseId }: { nurseId: number }) {
  const assignSkill = useAssignSkillToNurse();

  const handleSubmit = (skillData) => {
    assignSkill.mutate({
      nurseId,
      skillData: {
        skill_id: 1, // ACLS skill ID
        skill_level: "novice",
        certified_date: "2025-02-01",
        expiry_date: "2026-02-01",
        verified_by: 123 // admin ID
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={assignSkill.isPending}
      >
        {assignSkill.isPending ? 'Assigning...' : 'Assign Skill'}
      </button>
    </form>
  );
}
```

### Managing Skills Catalog (Admin)

```tsx
import { useGetSkills, useCreateSkill } from './api';

function SkillsManagement() {
  const { data: skills, isLoading } = useGetSkills();
  const createSkill = useCreateSkill();

  const handleCreateSkill = () => {
    createSkill.mutate({
      skillName: "Advanced Cardiac Life Support (ACLS)",
      skillCategory: "Emergency Care",
      requiredForDepartments: ["ER", "ICU"]
    });
  };

  if (isLoading) return <div>Loading skills...</div>;

  return (
    <div>
      <button onClick={handleCreateSkill}>Add New Skill</button>
      {skills?.map(skill => (
        <div key={skill.skillId}>
          {skill.skillName} - {skill.skillCategory}
        </div>
      ))}
    </div>
  );
}
```

## Your Current API Endpoints

These hooks work with your existing API structure:

### 1. GET `/api/nurses/{id}/skills` ✅ **IMPLEMENTED**
- **Purpose**: Retrieve skills assigned to a specific nurse
- **Response**: List of nurse skill assignments with proficiency levels

### 2. POST `/api/nurses/{id}/skills` ✅ **IMPLEMENTED**
- **Purpose**: Assign a skill to a nurse
- **Request Body**:
  ```json
  {
    "skill_id": 1,
    "skill_level": "novice",
    "certified_date": "2025-02-01",
    "expiry_date": "2026-02-01",
    "verified_by": 1
  }
  ```

## Additional API Endpoints Needed

For full functionality, you may want to create these endpoints:

### 3. GET `/api/skills` (Recommended)
- **Purpose**: Retrieve all available skills for admin management
- **Use Case**: Populate skill dropdowns, manage skill catalog
- **Query Parameters**: 
  - `category` (optional): Filter by skill category
  - `page` (optional): Page number for pagination
  - `limit` (optional): Items per page

### 4. POST `/api/skills` (Recommended)
- **Purpose**: Create a new skill in the skills catalog
- **Use Case**: Admin adding new skills to the system
- **Request Body**:
  ```json
  {
    "skillName": "string",
    "skillCategory": "string",
    "requiredForDepartments": ["string"]
  }
  ```

### 5. DELETE `/api/nurses/{id}/skills/{skillId}` (Recommended)
- **Purpose**: Remove a skill assignment from a nurse
- **Use Case**: Admin removing skills from nurses

## Data Types

### Nurse Skill Assignment (Your Current API)
```typescript
interface NurseSkillAssignment {
  skill_id: number;
  skill_name: string;
  skill_category: string;
  skill_level: 'novice' | 'advanced_beginner' | 'competent' | 'proficient' | 'expert';
  certified_date: string | null;
  expiry_date: string | null;
}
```

### Assign Skill Request (Your Current API)
```typescript
interface AssignSkillToNurseRequest {
  skill_id: number;
  skill_level: 'novice' | 'advanced_beginner' | 'competent' | 'proficient' | 'expert';
  certified_date?: string;
  expiry_date?: string;
  verified_by?: number;
}
```

### General Skill (Admin Management)
```typescript
interface Skill {
  skillId: number;
  skillName: string;
  skillCategory: string;
  requiredForDepartments?: string[] | null;
  createdAt: string;
}
```

## Query Keys

The hooks use the following query key structure:
- `['skills']` - All skills (catalog)
- `['skills', 'category', categoryName]` - Skills by category
- `['skills', skillId]` - Single skill
- `['nurse-skills', nurseId]` - Skills assigned to a specific nurse
- `['nurse-skills', nurseId, 'category', categoryName]` - Nurse skills by category

## Database Schema

Your current database structure supports this perfectly:

```sql
-- Skills catalog
CREATE TABLE nurse_skills (
  skill_id SERIAL PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50) NOT NULL,
  required_for_departments TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill assignments to nurses
CREATE TABLE nurse_skill_assignments (
  assignment_id SERIAL PRIMARY KEY,
  worker_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  skill_level nurse_skill_level NOT NULL,
  certified_date DATE,
  expiry_date DATE,
  verified_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Cache Management

- **Stale Time**: 5 minutes (skills don't change frequently)
- **Garbage Collection Time**: 10 minutes
- **Automatic Invalidation**: Cache is automatically invalidated after mutations
- **Optimistic Updates**: New skills are added to cache immediately after creation

## Error Handling

All hooks include proper error handling and will throw descriptive error messages that can be caught and displayed in your UI components.

## Dependencies

- `@tanstack/react-query` - For data fetching and caching
- `@/lib/hono` - Hono API client and response handler
