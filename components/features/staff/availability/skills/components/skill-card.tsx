import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserSkill, Skill, getStatusColor } from "../utils"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, XCircle, Shield, ShieldAlert } from "lucide-react"

interface SkillCardProps {
  userSkill: UserSkill
  skill: Skill
}

const levelColor: Record<UserSkill["level"], string> = {
  Beginner: "bg-blue-100 text-blue-800",
  Intermediate: "bg-green-100 text-green-800",
  Advanced: "bg-purple-100 text-purple-800",
  Expert: "bg-indigo-100 text-indigo-800",
}

export function SkillCard({ userSkill, skill }: SkillCardProps) {
  const status = getStatusColor(userSkill.certification?.expiryDate)

  const StatusIcon = () => {
    switch (status) {
      case "green":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "yellow":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "red":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">{skill.name}</CardTitle>
          <Badge className={cn(levelColor[userSkill.level], "ml-2")}>
            {userSkill.level}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{skill.category}</p>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {userSkill.certification ? (
          <div className="flex items-center text-sm">
            <StatusIcon />
            <div className="ml-2">
              <p className="font-medium">{userSkill.certification.name}</p>
              <p className="text-xs text-muted-foreground">
                {
                  status === "gray"
                    ? "Not applicable"
                    : `Expires: ${userSkill.certification.expiryDate?.toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-sm text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            <p className="ml-2">No certification required</p>
          </div>
        )}
        {userSkill.requiredForPosition && (
          <Badge variant="outline">{userSkill.requiredForPosition}</Badge>
        )}
      </CardContent>
    </Card>
  )
}
