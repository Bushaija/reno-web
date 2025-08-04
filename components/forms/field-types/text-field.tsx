"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TextFieldProps } from '@/types/form-fields'
import { cn } from '@/lib/utils'

export function TextField({ field, value, onChange, error, disabled, className }: TextFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleBlur = () => {
    // Handle blur events if needed for validation
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={field.name} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {field.label}
      </Label>
      <Input
        id={field.name}
        type={field.type}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        disabled={disabled}
        maxLength={field.maxLength}
        minLength={field.minLength}
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