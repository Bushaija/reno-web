"use client"
// @ts-nocheck
import React,{useState} from"react"
import {useRouter} from"next/navigation"
import {Card,CardHeader,CardTitle,CardContent}from"@/components/ui/card"
import {Input}from"@/components/ui/input"
import {Label}from"@/components/ui/label"
import {Textarea}from"@/components/ui/textarea"
import {Button}from"@/components/ui/button"
import{useClockOut}from"@/features/attendance/api/useClockOut"
import{toast}from"sonner"

export default function ClockOutForm(){
 const router=useRouter();
 const{mutateAsync,isPending}=useClockOut();
 const[form,setForm]=useState({assignment_id:"",patient_count_end:"",notes:"",total_patients_cared:"",procedures_performed:"",incidents_reported:""});
 const ch=(f,v)=>setForm(p=>({...p,[f]:v}));
 const submit=async e=>{e.preventDefault();try{await mutateAsync({assignment_id:Number(form.assignment_id),patient_count_end:Number(form.patient_count_end),notes:form.notes||undefined,shift_summary:{total_patients_cared:Number(form.total_patients_cared),procedures_performed:Number(form.procedures_performed),incidents_reported:Number(form.incidents_reported)}});router.back()}catch(err){toast.error(err.message||"Clock out failed")}}
 return(<div className="space-y-8 max-w-md"><h2 className="text-2xl font-semibold">Clock Out</h2><form onSubmit={submit} className="space-y-6"><Card><CardHeader><CardTitle className="text-lg font-medium">Details</CardTitle></CardHeader><CardContent className="space-y-4"><Label>Assignment ID<Input type="number" value={form.assignment_id} onChange={e=>ch("assignment_id",e.target.value)}/></Label><Label>Patient count end<Input type="number" value={form.patient_count_end} onChange={e=>ch("patient_count_end",e.target.value)}/></Label><Label>Notes<Textarea value={form.notes} onChange={e=>ch("notes",e.target.value)}/></Label><Label>Total patients cared<Input type="number" value={form.total_patients_cared} onChange={e=>ch("total_patients_cared",e.target.value)}/></Label><Label>Procedures performed<Input type="number" value={form.procedures_performed} onChange={e=>ch("procedures_performed",e.target.value)}/></Label><Label>Incidents reported<Input type="number" value={form.incidents_reported} onChange={e=>ch("incidents_reported",e.target.value)}/></Label></CardContent></Card><Button type="submit" disabled={isPending}>{isPending?"Clocking...":"Clock Out"}</Button></form></div>)}
