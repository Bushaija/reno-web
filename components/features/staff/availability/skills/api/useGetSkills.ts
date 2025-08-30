import { useQuery } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';

// Types for skills
export interface Skill {
  skillId: number;
  skillName: string;
  skillCategory: string;
  requiredForDepartments?: string[] | null;
  createdAt: string;
}

// Types for nurse skill assignments (what your API actually returns)
export interface NurseSkillAssignment {
  skill_id: number;
  skill_name: string;
  skill_category: string;
  skill_level: 'novice' | 'advanced_beginner' | 'competent' | 'proficient' | 'expert';
  certified_date: string | null;
  expiry_date: string | null;
}

export interface NurseSkillsResponse {
  success: boolean;
  data: NurseSkillAssignment[];
  timestamp: string;
}

// Types for general skills (for admin management)
export interface SkillsResponse {
  success: boolean;
  data: Skill[];
  message?: string;
  timestamp: string;
}

// Query keys
export const skillsQueryKey = ['skills'] as const;
export const nurseSkillsQueryKey = ['nurse-skills'] as const;

/**
 * Hook for fetching all available skills (for admin management)
 * This now uses your actual GET /api/nurses/skills endpoint
 */
export function useGetSkills() {
  return useQuery({
    queryKey: skillsQueryKey,
    queryFn: async (): Promise<Skill[]> => {
      try {
        const response = await handleHonoResponse<SkillsResponse>(
          honoClient.api['/nurses/skills'].$get({
            query: {},
            header: {},
            cookie: {},
            param: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error fetching skills:', error);
        throw new Error('Failed to fetch skills');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook for fetching skills by category (for admin management)
 * Note: This will also return empty array until you implement the /skills endpoint
 */
export function useGetSkillsByCategory(category: string) {
  return useQuery({
    queryKey: [...skillsQueryKey, 'category', category],
    queryFn: async (): Promise<Skill[]> => {
      // Since you don't have a /skills endpoint, return empty array for now
      console.warn('GET /api/skills endpoint not implemented. Returning empty skills array.');
      return [];
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single skill by ID (for admin management)
 * Note: This will also return null until you implement the /skills/:id endpoint
 */
export function useGetSkill(skillId: number) {
  return useQuery({
    queryKey: [...skillsQueryKey, skillId],
    queryFn: async (): Promise<Skill | null> => {
      // Since you don't have a /skills/:id endpoint, return null for now
      console.warn('GET /api/skills/:id endpoint not implemented. Returning null.');
      return null;
    },
    enabled: !!skillId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching skills assigned to a specific nurse
 * This matches your actual API: GET /api/nurses/{id}/skills
 */
export function useGetNurseSkills(nurseId: number) {
  return useQuery({
    queryKey: [...nurseSkillsQueryKey, nurseId],
    queryFn: async (): Promise<NurseSkillAssignment[]> => {
      try {
        // Don't make API call for invalid nurse IDs
        if (!nurseId || nurseId <= 0) {
          return [];
        }

        const response = await handleHonoResponse<NurseSkillsResponse>(
          honoClient.api['/nurses/:id/skills'].$get({
            param: { id: nurseId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error fetching nurse skills:', error);
        throw new Error('Failed to fetch nurse skills');
      }
    },
    enabled: !!nurseId && nurseId > 0, // Only enabled when we have a valid nurse ID
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching skills by category for a specific nurse
 */
export function useGetNurseSkillsByCategory(nurseId: number, category: string) {
  return useQuery({
    queryKey: [...nurseSkillsQueryKey, nurseId, 'category', category],
    queryFn: async (): Promise<NurseSkillAssignment[]> => {
      try {
        const response = await handleHonoResponse<NurseSkillsResponse>(
          honoClient.api['/nurses/:id/skills'].$get({
            param: { id: nurseId.toString() },
            query: { category },
            header: {},
            cookie: {},
          })
        );
        
        return response.data;
      } catch (error) {
        console.error('Error fetching nurse skills by category:', error);
        throw new Error('Failed to fetch nurse skills by category');
      }
    },
    enabled: !!nurseId && !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for getting all unique skills from all nurses
 * This can be used as a workaround until you implement the /skills endpoint
 */
export function useGetAllSkillsFromNurses(nurseIds?: number[]) {
  return useQuery({
    queryKey: [...skillsQueryKey, 'from-nurses', nurseIds],
    queryFn: async (): Promise<Skill[]> => {
      try {
        // This is a workaround - fetch skills from multiple nurses to build a catalog
        // You might want to implement a proper /skills endpoint instead
        if (!nurseIds || nurseIds.length === 0) {
          console.warn('No nurse IDs provided to useGetAllSkillsFromNurses');
          return [];
        }

        const allSkills: Skill[] = [];
        const seenSkills = new Set<number>();

        for (const nurseId of nurseIds) {
          try {
            const response = await handleHonoResponse<NurseSkillsResponse>(
              honoClient.api['/nurses/:id/skills'].$get({
                param: { id: nurseId.toString() },
                query: {},
                header: {},
                cookie: {},
              })
            );

            // Add unique skills to the catalog
            response.data.forEach(nurseSkill => {
              if (!seenSkills.has(nurseSkill.skill_id)) {
                seenSkills.add(nurseSkill.skill_id);
                allSkills.push({
                  skillId: nurseSkill.skill_id,
                  skillName: nurseSkill.skill_name,
                  skillCategory: nurseSkill.skill_category,
                  requiredForDepartments: null, // Not available from nurse skills
                  createdAt: new Date().toISOString(), // Not available from nurse skills
                });
              }
            });
          } catch (error) {
            // Skip nurses that don't exist or have errors
            console.warn(`Failed to fetch skills for nurse ${nurseId}:`, error);
          }
        }

        return allSkills;
      } catch (error) {
        console.error('Error fetching all skills from nurses:', error);
        return [];
      }
    },
    enabled: !!nurseIds && nurseIds.length > 0, // Only enabled when we have actual nurse IDs
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
