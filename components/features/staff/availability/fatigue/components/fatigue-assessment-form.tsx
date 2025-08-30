"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateFatigueAssessment, type CreateFatigueAssessmentRequest } from "../api"
import { toast } from "sonner"

interface FatigueAssessmentFormProps {
  nurseId: number
  onSuccess?: () => void
}

export function FatigueAssessmentForm({ nurseId, onSuccess }: FatigueAssessmentFormProps) {
  const [formData, setFormData] = useState<CreateFatigueAssessmentRequest>({
    sleep_hours_reported: 7,
    stress_level_reported: 3,
    caffeine_intake_level: 2,
    notes: "",
  })

  const createAssessment = useCreateFatigueAssessment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createAssessment.mutateAsync({
        nurseId,
        assessmentData: formData,
      })
      
      toast.success("Fatigue assessment submitted successfully!")
      setFormData({
        sleep_hours_reported: 7,
        stress_level_reported: 3,
        caffeine_intake_level: 2,
        notes: "",
      })
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to submit fatigue assessment")
      console.error("Error submitting fatigue assessment:", error)
    }
  }

  const handleInputChange = (field: keyof CreateFatigueAssessmentRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'notes' ? value : Number(value)
    }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Fatigue Assessment</CardTitle>
        <CardDescription>
          Report your current fatigue level and factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sleep_hours">Sleep Hours (Last Night)</Label>
            <Input
              id="sleep_hours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleep_hours_reported}
              onChange={(e) => handleInputChange('sleep_hours_reported', e.target.value)}
              placeholder="7.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stress_level">Stress Level (1-10)</Label>
            <Select 
              value={formData.stress_level_reported.toString()} 
              onValueChange={(value) => handleInputChange('stress_level_reported', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stress level" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    {level} - {level <= 3 ? 'Low' : level <= 6 ? 'Moderate' : 'High'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caffeine_level">Caffeine Intake Level</Label>
            <Select 
              value={formData.caffeine_intake_level.toString()} 
              onValueChange={(value) => handleInputChange('caffeine_intake_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select caffeine level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 - None</SelectItem>
                <SelectItem value="1">1 - Low (1-2 cups)</SelectItem>
                <SelectItem value="2">2 - Moderate (3-4 cups)</SelectItem>
                <SelectItem value="3">3 - High (5+ cups)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Describe how you're feeling, any concerns, or additional context..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createAssessment.isPending}
          >
            {createAssessment.isPending ? "Submitting..." : "Submit Assessment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
