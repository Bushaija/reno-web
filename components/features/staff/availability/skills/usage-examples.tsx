import React from 'react';
import { SkillsManagement } from './skills-management';

/**
 * Example usage of the updated SkillsManagement component
 * This shows how to use the component with different configurations
 */

export function SkillsManagementExamples() {
  return (
    <div className="space-y-8">
      {/* Example 1: Admin view - Managing skills catalog */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Admin Skills Management</h2>
        <p className="text-gray-600 mb-4">
          This view allows administrators to manage the skills catalog, create new skills, 
          and view all available skills in the system.
        </p>
        <SkillsManagement isAdmin={true} />
      </div>

      {/* Example 2: Specific nurse skills management */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Nurse Skills Management</h2>
        <p className="text-gray-600 mb-4">
          This view shows skills assigned to a specific nurse (ID: 123) and allows 
          assigning new skills to that nurse.
        </p>
        <SkillsManagement nurseId={123} />
      </div>

      {/* Example 3: General nurse skills management with selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">General Nurse Skills Management</h2>
        <p className="text-gray-600 mb-4">
          This view allows selecting different nurses and managing their skills. 
          Useful for managers who need to manage multiple nurses.
        </p>
        <SkillsManagement />
      </div>
    </div>
  );
}

/**
 * Example of using the component in a dashboard
 */
export function SkillsDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Skills Management Dashboard</h1>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Skills</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Active Nurses</h3>
          <p className="text-2xl font-bold text-green-600">156</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Skills Expiring Soon</h3>
          <p className="text-2xl font-bold text-yellow-600">8</p>
        </div>
      </div>

      {/* Skills management section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Manage Skills Catalog</h2>
          <p className="text-gray-600">Add, edit, and manage skills available in the system</p>
        </div>
        <div className="p-6">
          <SkillsManagement isAdmin={true} />
        </div>
      </div>
    </div>
  );
}

/**
 * Example of using the component in a nurse profile page
 */
export function NurseProfileSkills({ nurseId }: { nurseId: number }) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Skills & Certifications</h2>
        <p className="text-gray-600">Manage skills and certifications for this nurse</p>
      </div>
      <div className="p-6">
        <SkillsManagement nurseId={nurseId} />
      </div>
    </div>
  );
}
