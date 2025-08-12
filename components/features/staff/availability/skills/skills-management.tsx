"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { skills, userSkills as initialUserSkills } from "./data"
import { SkillCard } from "./components/skill-card"
import { AddSkillModal } from "./components/add-skill-modal"
import { SkillsOverview } from "./components/overview-card"
import { Download, RefreshCw } from "lucide-react"
import { UserSkill } from "./utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SkillsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userSkills, setUserSkills] = useState<UserSkill[]>(initialUserSkills)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredSkills = userSkills.filter(userSkill => {
    const skill = skills.find(s => s.id === userSkill.skillId)
    if (!skill) return false

    const matchesCategory =
      categoryFilter === "all" || skill.category === categoryFilter
    const matchesSearchTerm = skill.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearchTerm
  })

  return (
    <div className="space-y-6">
      <SkillsOverview userSkills={userSkills} />

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
              <SelectItem value="Clinical">Clinical</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Administrative">Administrative</SelectItem>
              <SelectItem value="Soft Skills">Soft Skills</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <AddSkillModal />
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Bulk Renew
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Matrix
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSkills.map(userSkill => {
          const skill = skills.find(s => s.id === userSkill.skillId)
          if (!skill) return null
          return <SkillCard key={userSkill.id} userSkill={userSkill} skill={skill} />
        })}
      </div>
    </div>
  )
}
