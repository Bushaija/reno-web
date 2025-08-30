import { useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import { skillsQueryKey, nurseSkillsQueryKey } from './useGetSkills';

// Types for creating general skills (for admin management)
export interface CreateSkillRequest {
  skillName: string;
  skillCategory: string;
  requiredForDepartments?: string[];
}

export interface CreateSkillResponse {
  success: boolean;
  data: {
    skillId: number;
    skillName: string;
    skillCategory: string;
    requiredForDepartments?: string[] | null;
    createdAt: string;
  };
  message?: string;
  timestamp: string;
}

// Types for assigning skills to nurses (what your API actually uses)
export interface AssignSkillToNurseRequest {
  skill_id: number;
  skill_level: 'novice' | 'advanced_beginner' | 'competent' | 'proficient' | 'expert';
  certified_date?: string;
  expiry_date?: string;
  verified_by?: number;
}

export interface AssignSkillToNurseResponse {
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * Hook for creating a new skill (for admin management)
 * Note: This assumes you have a POST /skills endpoint for creating skills
 * You may need to create this endpoint in your API routes
 */
export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillData: CreateSkillRequest): Promise<CreateSkillResponse['data']> => {
      try {
        const response = await handleHonoResponse<CreateSkillResponse>(
          honoClient.api['/skills'].$post({
            json: skillData,
            query: {},
            header: {},
            cookie: {},
            param: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error creating skill:', error);
        throw new Error('Failed to create skill');
      }
    },
    onSuccess: (newSkill) => {
      // Invalidate and refetch skills list
      queryClient.invalidateQueries({ queryKey: skillsQueryKey });
      
      // Optionally, add the new skill to the cache immediately
      queryClient.setQueryData(skillsQueryKey, (oldData: any) => {
        if (oldData?.success && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: [...oldData.data, newSkill]
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Skill creation failed:', error);
    },
  });
}

/**
 * Hook for assigning a skill to a nurse
 * This matches your actual API: POST /api/nurses/{id}/skills
 */
export function useAssignSkillToNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      nurseId, 
      skillData 
    }: { 
      nurseId: number; 
      skillData: AssignSkillToNurseRequest 
    }): Promise<AssignSkillToNurseResponse> => {
      try {
        const response = await handleHonoResponse<AssignSkillToNurseResponse>(
          honoClient.api['/nurses/:id/skills'].$post({
            json: skillData,
            param: { id: nurseId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error assigning skill to nurse:', error);
        throw new Error('Failed to assign skill to nurse');
      }
    },
    onSuccess: (_, { nurseId }) => {
      // Invalidate nurse skills queries
      queryClient.invalidateQueries({ queryKey: [...nurseSkillsQueryKey, nurseId] });
      
      // Also invalidate general skills if needed
      queryClient.invalidateQueries({ queryKey: skillsQueryKey });
    },
    onError: (error) => {
      console.error('Skill assignment failed:', error);
    },
  });
}

/**
 * Hook for updating an existing skill (for admin management)
 * Note: This assumes you have a PUT /skills/:id endpoint for updating skills
 */
export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      skillId, 
      skillData 
    }: { 
      skillId: number; 
      skillData: Partial<CreateSkillRequest> 
    }): Promise<CreateSkillResponse['data']> => {
      try {
        const response = await handleHonoResponse<CreateSkillResponse>(
          honoClient.api['/skills/:id'].$put({
            json: skillData,
            param: { id: skillId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error updating skill:', error);
        throw new Error('Failed to update skill');
      }
    },
    onSuccess: (updatedSkill) => {
      // Invalidate skills queries
      queryClient.invalidateQueries({ queryKey: skillsQueryKey });
      
      // Update the specific skill in cache
      queryClient.setQueryData([...skillsQueryKey, updatedSkill.skillId], updatedSkill);
    },
    onError: (error) => {
      console.error('Skill update failed:', error);
    },
  });
}

/**
 * Hook for deleting a skill (for admin management)
 * Note: This assumes you have a DELETE /skills/:id endpoint for deleting skills
 */
export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillId: number): Promise<void> => {
      try {
        await handleHonoResponse(
          honoClient.api['/skills/:id'].$delete({
            param: { id: skillId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
      } catch (error) {
        console.error('Error deleting skill:', error);
        throw new Error('Failed to delete skill');
      }
    },
    onSuccess: (_, skillId) => {
      // Invalidate skills queries
      queryClient.invalidateQueries({ queryKey: skillsQueryKey });
      
      // Remove the deleted skill from cache
      queryClient.removeQueries({ queryKey: [...skillsQueryKey, skillId] });
    },
    onError: (error) => {
      console.error('Skill deletion failed:', error);
    },
  });
}

/**
 * Hook for removing a skill assignment from a nurse
 * Note: This assumes you have a DELETE /api/nurses/{id}/skills/{skillId} endpoint
 * You may need to create this endpoint in your API routes
 */
export function useRemoveSkillFromNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      nurseId, 
      skillId 
    }: { 
      nurseId: number; 
      skillId: number 
    }): Promise<void> => {
      try {
        await handleHonoResponse(
          honoClient.api['/nurses/:id/skills/:skillId'].$delete({
            param: { 
              id: nurseId.toString(),
              skillId: skillId.toString()
            },
            query: {},
            header: {},
            cookie: {},
          })
        );
      } catch (error) {
        console.error('Error removing skill from nurse:', error);
        throw new Error('Failed to remove skill from nurse');
      }
    },
    onSuccess: (_, { nurseId }) => {
      // Invalidate nurse skills queries
      queryClient.invalidateQueries({ queryKey: [...nurseSkillsQueryKey, nurseId] });
    },
    onError: (error) => {
      console.error('Skill removal failed:', error);
    },
  });
}
