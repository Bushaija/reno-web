"use client"
// @ts-nocheck
import React,{useState} from"react"
import {useRouter} from"next/navigation"
import {Card,CardHeader,CardTitle,CardContent}from"@/components/ui/card"
import {Input}from"@/components/ui/input"
import {Label}from"@/components/ui/label"
import {Textarea}from"@/components/ui/textarea"
import {Button}from"@/components/ui/button"
import{useClockIn}from"@/features/attendance/api/useClockIn"
import{toast}from"sonner"

export default function ClockInForm(){
 const router=useRouter();
 const{mutateAsync,isPending}=useClockIn();
 const[form,setForm]=useState({assignment_id:"",location_lat:"",location_lng:"",notes:""});
 const change=(f,v)=>setForm(p=>({...p,[f]:v}));
 const submit=async e=>{e.preventDefault();try{await mutateAsync({assignment_id:Number(form.assignment_id),location_lat:Number(form.location_lat),location_lng:Number(form.location_lng),notes:form.notes||undefined});router.back()}catch(err){toast.error(err.message||"Clock in failed")}}
 return(<div className="space-y-8 max-w-md"><h2 className="text-2xl font-semibold">Clock In</h2><form onSubmit={submit} className="space-y-6"><Card><CardHeader><CardTitle className="text-lg font-medium">Details</CardTitle></CardHeader><CardContent className="space-y-4"><Label>Assignment ID<Input type="number" value={form.assignment_id} onChange={e=>change("assignment_id",e.target.value)}/></Label><Label>Latitude<Input type="number" step="0.0001" value={form.location_lat} onChange={e=>change("location_lat",e.target.value)}/></Label><Label>Longitude<Input type="number" step="0.0001" value={form.location_lng} onChange={e=>change("location_lng",e.target.value)}/></Label><Label>Notes<Textarea value={form.notes} onChange={e=>change("notes",e.target.value)}/></Label></CardContent></Card><Button type="submit" disabled={isPending}>{isPending?"Clocking...":"Clock In"}</Button></form></div>)}
