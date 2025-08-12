import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Award, Briefcase, Wrench } from "lucide-react"
import { UserSkill } from "../utils"
import { skills } from "../data"

interface OverviewCardProps {
  title: string
  value: string
  icon: React.ReactNode
  footer: React.ReactNode
}

export function OverviewCard({ title, value, icon, footer }: OverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {footer}
      </CardContent>
    </Card>
  )
}

interface SkillsOverviewProps {
  userSkills: UserSkill[]
}

export function SkillsOverview({ userSkills }: SkillsOverviewProps) {
  const getCategoryCount = (category: string) =>
    userSkills.filter(us => {
      const skill = skills.find(s => s.id === us.skillId)
      return skill?.category === category
    }).length

  const clinicalSkills = getCategoryCount("Clinical")
  const technicalSkills = getCategoryCount("Technical")
  const adminSkills = getCategoryCount("Administrative")
  const totalSkills = userSkills.length

  const expiringSoonCount = userSkills.filter(us => {
    if (!us.certification?.expiryDate) return false
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    return (
      us.certification.expiryDate > today &&
      us.certification.expiryDate <= thirtyDaysFromNow
    )
  }).length

  return (
    <div className="space-y-4">
      {expiringSoonCount > 0 && (
        <div className="flex items-center rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-700">
          <AlertCircle className="mr-2 h-5 w-5" />
          <p>
            <span className="font-bold">{expiringSoonCount}</span> certification(s)
            are expiring within the next 30 days.
          </p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <OverviewCard
          title="Clinical Skills"
          value={`${clinicalSkills}`}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          footer={
            <Progress value={(clinicalSkills / totalSkills) * 100} />
          }
        />
        <OverviewCard
          title="Technical Skills"
          value={`${technicalSkills}`}
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          footer={
            <Progress value={(technicalSkills / totalSkills) * 100} />
          }
        />
        <OverviewCard
          title="Administrative Skills"
          value={`${adminSkills}`}
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          footer={
            <Progress value={(adminSkills / totalSkills) * 100} />
          }
        />
      </div>
    </div>
  )
}
