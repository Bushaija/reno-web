"use client"

import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TextareaFieldProps } from '@/types/form-fields'
import { cn } from '@/lib/utils'

export function TextareaField({ field, value, onChange, error, disabled, className }: TextareaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={field.name} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {field.label}
      </Label>
      <Textarea
        id={field.name}
        value={value || ''}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={field.rows || 3}
        maxLength={field.maxLength}
        className={cn(error && "border-red-500 focus:border-red-500")}
      />
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 