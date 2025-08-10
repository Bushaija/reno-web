"use client"
import {useParams} from"next/navigation"
import FatigueAssessmentForm from"@/components/api-forms/fatigue-assessment-form"
export default function FatiguePage(){const params=useParams();const id=Number(params?.id);if(Number.isNaN(id))return<p>Invalid nurse id</p>;return<FatigueAssessmentForm nurseId={id}/>}
