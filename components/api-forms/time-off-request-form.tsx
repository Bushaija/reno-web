"use client"
// @ts-nocheck
import React,{useState}from"react"
import {useRouter}from"next/navigation"
import {Card,CardHeader,CardTitle,CardContent}from"@/components/ui/card"
import {Input}from"@/components/ui/input"
import {Label}from"@/components/ui/label"
import {Textarea}from"@/components/ui/textarea"
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem}from"@/components/ui/select"
import {Button}from"@/components/ui/button"
import {useSubmitTimeOff}from"@/features/time-off/api/useSubmitTimeOff"
import {toast}from"sonner"

export default function TimeOffRequestForm(){const router=useRouter();const{mutateAsync,isPending}=useSubmitTimeOff();const[form,setForm]=useState({start:"",end:"",type:"vacation",reason:""});const ch=(f,v)=>setForm(p=>({...p,[f]:v}));const submit=async e=>{e.preventDefault();try{await mutateAsync({start_date:form.start,end_date:form.end,request_type:form.type as any,reason:form.reason});toast.success("Request submitted");router.back()}catch(err){toast.error(err.message||"Failed")}};return(<div className="space-y-8 max-w-md"><h2 className="text-2xl font-semibold">Submit Time-Off Request</h2><form onSubmit={submit} className="space-y-6"><Card><CardHeader><CardTitle className="text-lg font-medium">Details</CardTitle></CardHeader><CardContent className="space-y-4"><Label>Start date<Input type="date" value={form.start} onChange={e=>ch("start",e.target.value)}/></Label><Label>End date<Input type="date" value={form.end} onChange={e=>ch("end",e.target.value)}/></Label><Label>Request type<Select value={form.type} onValueChange={v=>ch("type",v)}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="vacation">Vacation</SelectItem><SelectItem value="sick">Sick</SelectItem><SelectItem value="personal">Personal</SelectItem></SelectContent></Select></Label><Label>Reason<Textarea value={form.reason} onChange={e=>ch("reason",e.target.value)}/></Label></CardContent></Card><Button type="submit" disabled={isPending}>{isPending?"Submitting...":"Submit"}</Button></form></div>)}
