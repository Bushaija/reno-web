"use client"

/**
 * SkillsManagement Component
 * 
 * Usage examples:
 * 
 * // For managing a specific nurse's skills
 * <SkillsManagement nurseId={123} />
 * 
 * // For admin view - managing skills catalog
 * <SkillsManagement isAdmin={true} />
 * 
 * // For general nurse skills management (with nurse selection)
 * <SkillsManagement />
 */

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  useGetSkills,
  useGetNurseSkills, 
  useAssignSkillToNurse,
  type Skill,
  type NurseSkillAssignment
} from "./api"
import { useNurses, type Nurse } from "@/features/nurses/api/useNurses"
import { SkillCard } from "./components/skill-card"
import { AddSkillModal } from "./components/add-skill-modal"
import { AssignSkillModal } from "./components/assign-skill-modal"
import { SkillsOverview } from "./components/overview-card"
import React from "react"

interface SkillsManagementProps {
  nurseId?: number; // Optional: if managing a specific nurse's skills
  isAdmin?: boolean; // Whether this is admin view for managing skills catalog
}

export function SkillsManagement({ nurseId, isAdmin = false }: SkillsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedNurseId, setSelectedNurseId] = useState<number>(nurseId || 1)

  // Fetch all nurses for the dropdown selection
  const { 
    data: nursesData, 
    isLoading: isLoadingNurses 
  } = useNurses()

  // Get all available skills from the skills endpoint
  const { 
    data: availableSkills, 
    isLoading: isLoadingSkills, 
    error: skillsError 
  } = useGetSkills()



  // Fetch skills assigned to the selected nurse (only when we have a valid nurse ID)
  const { 
    data: nurseSkills, 
    isLoading: isLoadingNurseSkills, 
    error: nurseSkillsError 
  } = useGetNurseSkills(selectedNurseId > 0 ? selectedNurseId : 0)

  // Hook for assigning skills to nurse
  const assignSkill = useAssignSkillToNurse()



  // Filter skills based on search and category
  const filteredSkills = (availableSkills || []).filter((skill: Skill) => {
    // Safety check: ensure skill has required properties
    if (!skill || !skill.skill_name || !skill.skill_category) {
      return false
    }
    
    const matchesCategory = categoryFilter === "all" || skill.skill_category === categoryFilter
    const matchesSearchTerm = skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearchTerm
  })

  // Filter nurse skills based on search and category
  const filteredNurseSkills = (nurseSkills || []).filter(nurseSkill => {
    const skill = (availableSkills || []).find((s: Skill) => s.skill_id === nurseSkill.skill_id)
    if (!skill) return false

    // Safety check: ensure skill has required properties
    if (!skill.skill_name || !skill.skill_category) {
      return false
    }

    const matchesCategory = categoryFilter === "all" || skill.skill_category === categoryFilter
    const matchesSearchTerm = skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearchTerm
  })

  // Handle skill assignment
  const handleAssignSkill = (skillId: number, skillLevel: string, certifiedDate?: string, expiryDate?: string) => {
    assignSkill.mutate({
      nurseId: selectedNurseId,
      skillData: {
        skill_id: skillId,
        skill_level: skillLevel as any,
        certified_date: certifiedDate,
        expiry_date: expiryDate,
        verified_by: 1, // Assuming admin ID 1
      }
    })
  }



  // Refresh data
  const handleRefresh = () => {
    // The hooks will automatically refetch when needed
    // This is just for user feedback
    window.location.reload()
  }

  // Update selectedNurseId when nurseId prop changes
  React.useEffect(() => {
    if (nurseId) {
      setSelectedNurseId(nurseId)
    }
  }, [nurseId])

  // Show loading state while fetching skills
  if (isAdmin && isLoadingSkills) {
    return <div className="flex items-center justify-center p-8">Loading skills catalog...</div>
  }
  
  if (isAdmin && skillsError) {
    return <div className="text-red-600 p-4">Error loading skills: {skillsError.message}</div>
  }

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      {selectedNurseId > 0 && nurseSkills && nurseSkills.length > 0 && (
        <SkillsOverview 
          userSkills={nurseSkills
            .filter(ns => ns && ns.skill_id) // Safety check: ensure nurse skill exists
            .map(ns => ({
              id: ns.skill_id.toString(),
              userId: selectedNurseId.toString(),
              skillId: ns.skill_id.toString(),
              level: mapSkillLevel(ns.skill_level),
              certification: {
                id: ns.skill_id.toString(),
                name: "Certified",
                issuingAuthority: "Hospital",
                issueDate: ns.certified_date ? new Date(ns.certified_date) : new Date(),
                expiryDate: ns.expiry_date ? new Date(ns.expiry_date) : undefined,
              },
            }))} 
        />
      )}

      {/* Controls and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Emergency Care">Emergency Care</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Surgery">Surgery</SelectItem>
              <SelectItem value="Patient Care">Patient Care</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Nurse Selection (if not specific nurse) */}
          {!nurseId && (
            <Select 
              value={selectedNurseId.toString()} 
              onValueChange={(value) => setSelectedNurseId(Number(value))}
              disabled={isLoadingNurses}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isLoadingNurses ? "Loading nurses..." : "Select Nurse"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingNurses ? (
                  <SelectItem value="loading" disabled>Loading nurses...</SelectItem>
                ) : nursesData?.data && nursesData.data.length > 0 ? (
                  nursesData.data.map((nurse: Nurse) => (
                    <SelectItem key={nurse.worker_id} value={nurse.worker_id.toString()}>
                      {nurse.user.name} ({nurse.employee_id})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-nurses" disabled>No nurses available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Add Skill Modal - Admin only */}
          {isAdmin && (
            <AddSkillModal 
              onSuccess={() => {
                // The hook will automatically invalidate queries
                // This is just for any additional UI updates
              }}
            />
          )}
          
          {/* Assign Skill Modal - For assigning skills to nurses */}
          {!isAdmin && selectedNurseId > 0 && availableSkills && availableSkills.length > 0 && (
            <AssignSkillModal 
              nurseId={selectedNurseId}
              availableSkills={availableSkills.filter(skill => skill && skill.skill_name && skill.skill_category)}
              onSuccess={() => {
                // The hook will automatically invalidate queries
                // This is just for any additional UI updates
              }}
            />
          )}
          
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Matrix
          </Button>
        </div>
      </div>

      {/* Selected Nurse Info */}
      {/* {!nurseId && nursesData?.data && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Selected Nurse</h3>
          {(() => {
            const selectedNurse = nursesData.data.find(n => n.worker_id === selectedNurseId)
            return selectedNurse ? (
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {selectedNurse.user.name}</p>
                <p><strong>Employee ID:</strong> {selectedNurse.employee_id}</p>
                <p><strong>Specialization:</strong> {selectedNurse.specialization || 'Not specified'}</p>
                <p><strong>Employment Type:</strong> {selectedNurse.employment_type}</p>
                {selectedNurse.fatigue_score !== undefined && (
                  <p><strong>Fatigue Score:</strong> {selectedNurse.fatigue_score}/100</p>
                )}
              </div>
            ) : (
              <p className="text-blue-600">Please select a nurse from the dropdown above.</p>
            )
          })()}
        </div>
      )} */}

      {/* Skills Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isAdmin ? (
          // Admin view: Show all available skills from the skills endpoint
          availableSkills && availableSkills.length > 0 ? (
            filteredSkills.length > 0 ? (
              filteredSkills.map((skill: Skill) => {
                // Safety check: ensure skill has required properties
                if (!skill || !skill.skill_name || !skill.skill_category) {
                  return null
                }
                
                return (
                  <div key={skill.skill_id} className="border p-4 rounded-lg">
                    <h3 className="font-medium">{skill.skill_name}</h3>
                    <p className="text-sm text-gray-600">Category: {skill.skill_category}</p>
                    {skill.required_for_departments && skill.required_for_departments.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Required for: {skill.required_for_departments.join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Skill ID: {skill.skill_id}
                    </p>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No skills match your current filters.</p>
                <p className="text-sm">Try adjusting your search or category filters.</p>
              </div>
            )
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No skills found in the system.</p>
              <p className="text-sm">Use the "Add Skill" button to create new skills.</p>
            </div>
          )
          ) : (
            // Nurse view: Show skills assigned to the selected nurse
            selectedNurseId > 0 ? (
              availableSkills && availableSkills.length > 0 ? (
                filteredNurseSkills.length > 0 ? (
                  filteredNurseSkills.map(nurseSkill => {
                    const skill = availableSkills.find((s: Skill) => s.skill_id === nurseSkill.skill_id)
                    if (!skill) return null
                    
                    // Safety check: ensure skill has required properties
                    if (!skill.skill_name || !skill.skill_category) {
                      return null
                    }
                    
                    return (
                      <SkillCard 
                        key={nurseSkill.skill_id} 
                        userSkill={{
                          id: nurseSkill.skill_id.toString(),
                          userId: selectedNurseId.toString(),
                          skillId: nurseSkill.skill_id.toString(),
                          level: mapSkillLevel(nurseSkill.skill_level),
                          certification: {
                            id: nurseSkill.skill_id.toString(),
                            name: "Certified",
                            issuingAuthority: "Hospital",
                            issueDate: nurseSkill.certified_date ? new Date(nurseSkill.certified_date) : new Date(),
                            expiryDate: nurseSkill.expiry_date ? new Date(nurseSkill.expiry_date) : undefined,
                          },
                        }} 
                        skill={{
                          id: nurseSkill.skill_id.toString(),
                          name: skill.skill_name,
                          category: mapSkillCategory(skill.skill_category),
                          description: `Proficiency Level: ${nurseSkill.skill_level}`,
                        }}
                      />
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p>No skills assigned to this nurse yet.</p>
                    <p className="text-sm">Use the "Assign Skill" button to add skills.</p>
                  </div>
                )
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>Loading skills catalog...</p>
                </div>
              )
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>Please select a nurse to view their skills.</p>
              </div>
            )
          )}
        </div>

      {/* Loading States */}
      {isLoadingSkills && (
        <div className="text-center py-4 text-gray-500">Loading skills catalog...</div>
      )}
      
      {isLoadingNurseSkills && (
        <div className="text-center py-4 text-gray-500">Loading nurse skills...</div>
      )}
      
      {/* Show loading state when no skills are available yet */}
      {!isLoadingSkills && !availableSkills && (
        <div className="text-center py-4 text-gray-500">Initializing skills system...</div>
      )}

      {/* Error States */}
      {skillsError && (
        <div className="text-red-600 p-4">Error loading skills: {skillsError.message}</div>
      )}
      
      {nurseSkillsError && (
        <div className="text-red-600 p-4">Error loading nurse skills: {nurseSkillsError.message}</div>
      )}

      {/* Success/Error Messages */}
      {assignSkill.isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Skill assigned successfully!
        </div>
      )}

      {assignSkill.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error assigning skill: {assignSkill.error.message}
        </div>
      )}


    </div>
  )
}

// Helper function to map skill levels from API format to component format
function mapSkillLevel(apiLevel: string | undefined | null): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  if (!apiLevel) return "Beginner"
  
  switch (apiLevel) {
    case "novice":
      return "Beginner"
    case "advanced_beginner":
      return "Intermediate"
    case "competent":
      return "Advanced"
    case "proficient":
    case "expert":
      return "Expert"
    default:
      return "Beginner"
  }
}

// Helper function to map skill categories from API format to component format
function mapSkillCategory(apiCategory: string | undefined | null): "Clinical" | "Technical" | "Administrative" | "Soft Skills" {
  if (!apiCategory) return "Soft Skills"
  
  switch (apiCategory) {
    case "Emergency Care":
    case "Surgery":
    case "Patient Care":
      return "Clinical"
    case "Technology":
      return "Technical"
    case "Administration":
      return "Administrative"
    default:
      return "Soft Skills"
  }
}
