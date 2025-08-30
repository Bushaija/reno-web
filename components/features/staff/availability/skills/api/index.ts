// Export all skills-related hooks
export { 
  useGetSkills, 
  useGetSkillsByCategory, 
  useGetSkill,
  useGetNurseSkills,
  useGetNurseSkillsByCategory,
  useGetAllSkillsFromNurses,
  skillsQueryKey,
  nurseSkillsQueryKey,
  type Skill,
  type SkillsResponse,
  type NurseSkillAssignment,
  type NurseSkillsResponse
} from './useGetSkills';

export { 
  useCreateSkill, 
  useUpdateSkill, 
  useDeleteSkill,
  useAssignSkillToNurse,
  useRemoveSkillFromNurse,
  type CreateSkillRequest,
  type CreateSkillResponse,
  type AssignSkillToNurseRequest,
  type AssignSkillToNurseResponse
} from './useAssignSkill';
