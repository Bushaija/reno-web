import { Skill, UserSkill } from "./utils"

export const skills: Skill[] = [
  {
    id: "1",
    name: "Advanced Cardiac Life Support (ACLS)",
    category: "Clinical",
    description: "A set of clinical algorithms for the urgent treatment of cardiac arrest, stroke, and other life-threatening cardiovascular emergencies.",
  },
  {
    id: "2",
    name: "Electronic Health Record (EHR) Management",
    category: "Technical",
    description: "Proficiency in using and managing electronic health record systems for patient data.",
  },
  {
    id: "3",
    name: "Patient Triage",
    category: "Clinical",
    description: "The process of determining the priority of patients' treatments based on the severity of their condition.",
  },
  {
    id: "4",
    name: "Medical Billing and Coding",
    category: "Administrative",
    description: "The process of submitting and following up on claims with health insurance companies in order to receive payment for services rendered.",
  },
  {
    id: "5",
    name: "Surgical Instrumentation",
    category: "Technical",
    description: "Knowledge of surgical instruments and their proper use and sterilization.",
  },
  {
    id: "6",
    name: "Bedside Manner",
    category: "Soft Skills",
    description: "The professional and compassionate way a healthcare provider interacts with patients.",
  },
]

export const userSkills: UserSkill[] = [
  {
    id: "user-skill-1",
    userId: "user-1",
    skillId: "1",
    level: "Expert",
    certification: {
      id: "cert-1",
      name: "ACLS Provider",
      issuingAuthority: "American Heart Association",
      issueDate: new Date("2023-06-15"),
      expiryDate: new Date("2025-06-15"),
    },
    requiredForPosition: "Cardiology Nurse",
  },
  {
    id: "user-skill-2",
    userId: "user-1",
    skillId: "2",
    level: "Advanced",
    certification: {
      id: "cert-2",
      name: "Certified EHR Specialist",
      issuingAuthority: "National Healthcareer Association",
      issueDate: new Date("2022-09-01"),
      expiryDate: new Date("2024-09-01"), // Expired
    },
  },
  {
    id: "user-skill-3",
    userId: "user-1",
    skillId: "3",
    level: "Intermediate",
    requiredForPosition: "ER Technician",
  },
  {
    id: "user-skill-4",
    userId: "user-1",
    skillId: "4",
    level: "Advanced",
    certification: {
      id: "cert-3",
      name: "Certified Professional Coder (CPC)",
      issuingAuthority: "AAPC",
      issueDate: new Date("2023-01-20"),
      expiryDate: new Date("2025-08-20"), // Expiring soon
    },
  },
  {
    id: "user-skill-5",
    userId: "user-1",
    skillId: "5",
    level: "Beginner",
  },
  {
    id: "user-skill-6",
    userId: "user-1",
    skillId: "6",
    level: "Expert",
  },
]
