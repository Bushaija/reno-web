import React, { useState } from 'react';
import { 
  useGetNurseSkills, 
  useAssignSkillToNurse,
  useGetSkills,
  type NurseSkillAssignment,
  type AssignSkillToNurseRequest
} from './index';

/**
 * Example component demonstrating how to use the skills hooks
 * with your existing API structure
 */

interface NurseSkillsExampleProps {
  nurseId: number;
}

export function NurseSkillsExample({ nurseId }: NurseSkillsExampleProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<number>(1);
  const [skillLevel, setSkillLevel] = useState<'novice' | 'advanced_beginner' | 'competent' | 'proficient' | 'expert'>('novice');
  const [certifiedDate, setCertifiedDate] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  // Fetch skills assigned to this nurse
  const { 
    data: nurseSkills, 
    isLoading: isLoadingNurseSkills, 
    error: nurseSkillsError 
  } = useGetNurseSkills(nurseId);

  // Fetch all available skills (for dropdown)
  const { 
    data: availableSkills, 
    isLoading: isLoadingSkills 
  } = useGetSkills();

  // Hook for assigning skills to nurse
  const assignSkill = useAssignSkillToNurse();

  const handleAssignSkill = () => {
    const skillData: AssignSkillToNurseRequest = {
      skill_id: selectedSkillId,
      skill_level: skillLevel,
      certified_date: certifiedDate || undefined,
      expiry_date: expiryDate || undefined,
      verified_by: 1, // Assuming admin ID 1
    };

    assignSkill.mutate({
      nurseId,
      skillData
    });
  };

  if (isLoadingNurseSkills) return <div>Loading nurse skills...</div>;
  if (nurseSkillsError) return <div>Error: {nurseSkillsError.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Nurse Skills Management</h2>
      
      {/* Current Nurse Skills */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Current Skills</h3>
        {nurseSkills && nurseSkills.length > 0 ? (
          <div className="grid gap-3">
            {nurseSkills.map((skill: NurseSkillAssignment) => (
              <div key={skill.skill_id} className="border p-3 rounded-lg">
                <h4 className="font-medium">{skill.skill_name}</h4>
                <p className="text-sm text-gray-600">Category: {skill.skill_category}</p>
                <p className="text-sm text-gray-600">Level: {skill.skill_level}</p>
                {skill.certified_date && (
                  <p className="text-sm text-gray-600">Certified: {skill.certified_date}</p>
                )}
                {skill.expiry_date && (
                  <p className="text-sm text-gray-600">Expires: {skill.expiry_date}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills assigned yet.</p>
        )}
      </div>

      {/* Assign New Skill */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Assign New Skill</h3>
        
        <div className="space-y-3">
          {/* Skill Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Skill</label>
            <select 
              value={selectedSkillId} 
              onChange={(e) => setSelectedSkillId(Number(e.target.value))}
              className="w-full p-2 border rounded"
              disabled={isLoadingSkills}
            >
              {isLoadingSkills ? (
                <option>Loading skills...</option>
              ) : (
                availableSkills?.map(skill => (
                  <option key={skill.skillId} value={skill.skillId}>
                    {skill.skillName} - {skill.skillCategory}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium mb-1">Proficiency Level</label>
            <select 
              value={skillLevel} 
              onChange={(e) => setSkillLevel(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="novice">Novice</option>
              <option value="advanced_beginner">Advanced Beginner</option>
              <option value="competent">Competent</option>
              <option value="proficient">Proficient</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Certification Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Certification Date (Optional)</label>
            <input 
              type="date" 
              value={certifiedDate} 
              onChange={(e) => setCertifiedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
            <input 
              type="date" 
              value={expiryDate} 
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleAssignSkill}
            disabled={assignSkill.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {assignSkill.isPending ? 'Assigning...' : 'Assign Skill to Nurse'}
          </button>

          {/* Error Display */}
          {assignSkill.error && (
            <p className="text-red-600 text-sm">{assignSkill.error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example of using the hooks in a different component
 */
export function SkillsCatalogExample() {
  const { data: skills, isLoading, error } = useGetSkills();

  if (isLoading) return <div>Loading skills catalog...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skills Catalog</h2>
      <div className="grid gap-3">
        {skills?.map(skill => (
          <div key={skill.skillId} className="border p-3 rounded-lg">
            <h3 className="font-medium">{skill.skillName}</h3>
            <p className="text-sm text-gray-600">Category: {skill.skillCategory}</p>
            {skill.requiredForDepartments && skill.requiredForDepartments.length > 0 && (
              <p className="text-sm text-gray-600">
                Required for: {skill.requiredForDepartments.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
