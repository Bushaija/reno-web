"use client"
// @ts-nocheck
import React,{useState} from"react"
import {useRouter,useParams} from"next/navigation"
import {Card,CardHeader,CardTitle,CardContent}from"@/components/ui/card"
import {Input}from"@/components/ui/input"
import {Textarea}from"@/components/ui/textarea"
import {Label}from"@/components/ui/label"
import {Button}from"@/components/ui/button"
import {useSubmitFatigue}from"@/features/fatigue/api/useSubmitFatigue"
import {toast}from"sonner"

export default function FatigueAssessmentForm({nurseId}:{nurseId:number}){
 const router=useRouter();
 const{mutateAsync,isPending}=useSubmitFatigue();
 const[form,setForm]=useState({sleep:"",stress:"",caffeine:"",notes:""});
 const ch=(f,v)=>setForm(p=>({...p,[f]:v}));
 const submit=async e=>{e.preventDefault();try{await mutateAsync({nurse_id:nurseId,sleep_hours_reported:Number(form.sleep),stress_level_reported:Number(form.stress),caffeine_intake_level:Number(form.caffeine),notes:form.notes||undefined});router.back()}catch(err){toast.error(err.message||"Submission failed")}}
 return(<div className="space-y-8 max-w-md"><h2 className="text-2xl font-semibold">Fatigue Assessment</h2><form onSubmit={submit} className="space-y-6"><Card><CardHeader><CardTitle className="text-lg font-medium">Details</CardTitle></CardHeader><CardContent className="space-y-4"><Label>Sleep hours<Input type="number" step="0.1" value={form.sleep} onChange={e=>ch("sleep",e.target.value)}/></Label><Label>Stress level (1-10)<Input type="number" min="0" max="10" value={form.stress} onChange={e=>ch("stress",e.target.value)}/></Label><Label>Caffeine intake level (1-10)<Input type="number" min="0" max="10" value={form.caffeine} onChange={e=>ch("caffeine",e.target.value)}/></Label><Label>Notes<Textarea value={form.notes} onChange={e=>ch("notes",e.target.value)}/></Label></CardContent></Card><Button type="submit" disabled={isPending}>{isPending?"Submitting...":"Submit"}</Button></form></div>)
}
