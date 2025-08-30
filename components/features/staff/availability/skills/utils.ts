import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Certification {
  id: string
  name: string
  issuingAuthority: string
  issueDate: Date
  expiryDate?: Date
}

export interface Skill {
  id: string
  name: string
  category: "Clinical" | "Technical" | "Administrative" | "Soft Skills"
  description: string
}

export interface UserSkill {
  id: string
  userId: string
  skillId: string
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  certification?: Certification
  requiredForPosition?: string
}

export const getStatusColor = (
  expiryDate?: Date
): "green" | "yellow" | "red" | "gray" => {
  if (!expiryDate) return "gray"

  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  if (expiryDate < today) return "red" // Expired
  if (expiryDate <= thirtyDaysFromNow) return "yellow" // Expiring soon

  return "green" // Valid
}
