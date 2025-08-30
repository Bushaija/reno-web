"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Plus } from "lucide-react"
import { useAssignSkillToNurse, type AssignSkillToNurseRequest } from "../api"
import { type Skill } from "../api"
import { toast } from "sonner"

interface AssignSkillModalProps {
  nurseId: number
  availableSkills: Skill[]
  onSuccess?: () => void
}

export function AssignSkillModal({ nurseId, availableSkills, onSuccess }: AssignSkillModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState<string>("")
  const [skillLevel, setSkillLevel] = useState<string>("")
  const [certifiedDate, setCertifiedDate] = useState<string>("")
  const [expiryDate, setExpiryDate] = useState<string>("")

  const assignSkill = useAssignSkillToNurse()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSkillId || !skillLevel) {
      toast.error("Please select a skill and skill level")
      return
    }

    const skillData: AssignSkillToNurseRequest = {
      skill_id: parseInt(selectedSkillId),
      skill_level: skillLevel as any,
      certified_date: certifiedDate || undefined,
      expiry_date: expiryDate || undefined,
      verified_by: 1, // Assuming admin ID 1
    }

    try {
      await assignSkill.mutateAsync({
        nurseId,
        skillData,
      })
      
      toast.success("Skill assigned successfully!")
      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to assign skill")
      console.error("Error assigning skill:", error)
    }
  }

  const resetForm = () => {
    setSelectedSkillId("")
    setSkillLevel("")
    setCertifiedDate("")
    setExpiryDate("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={assignSkill.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Skill to Nurse</DialogTitle>
          <DialogDescription>
            Assign a new skill to this nurse with proficiency level and certification details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill">Skill</Label>
            <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill.skill_id} value={skill.skill_id.toString()}>
                    {skill.skill_name} ({skill.skill_category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillLevel">Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novice">Novice</SelectItem>
                <SelectItem value="advanced_beginner">Advanced Beginner</SelectItem>
                <SelectItem value="competent">Competent</SelectItem>
                <SelectItem value="proficient">Proficient</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="certifiedDate">Certified Date</Label>
              <Input
                id="certifiedDate"
                type="date"
                value={certifiedDate}
                onChange={(e) => setCertifiedDate(e.target.value)}
                placeholder="Select date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Select date"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={assignSkill.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={assignSkill.isPending || !selectedSkillId || !skillLevel}
            >
              {assignSkill.isPending ? "Assigning..." : "Assign Skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
