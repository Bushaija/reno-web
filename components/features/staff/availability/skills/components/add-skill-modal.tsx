"use client"

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PlusCircle } from "lucide-react"
import { useCreateSkill, type Skill } from "../api"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  skillName: z.string().min(1, "Please enter a skill name."),
  skillCategory: z.string().min(1, "Please select a category."),
  requiredForDepartments: z.string().optional(),
})

interface AddSkillModalProps {
  onSuccess?: () => void
}

export function AddSkillModal({ onSuccess }: AddSkillModalProps) {
  const createSkill = useCreateSkill()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillName: "",
      skillCategory: "",
      requiredForDepartments: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const skillData = {
        skillName: values.skillName,
        skillCategory: values.skillCategory,
        requiredForDepartments: values.requiredForDepartments 
          ? values.requiredForDepartments.split(',').map(s => s.trim())
          : undefined,
      }

      await createSkill.mutateAsync(skillData)
      
      toast.success("Skill created successfully!")
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create skill")
      console.error("Error creating skill:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={createSkill.isPending}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {createSkill.isPending ? "Creating..." : "Add Skill"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
          <DialogDescription>
            Create a new skill that can be assigned to nurses.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="skillName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Advanced Cardiac Life Support" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="skillCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Emergency Care">Emergency Care</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Patient Care">Patient Care</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requiredForDepartments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required For Departments (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., ER, ICU, All Departments" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createSkill.isPending}
              >
                {createSkill.isPending ? "Creating..." : "Create Skill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
