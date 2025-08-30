"use client"

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CheckboxFieldProps } from '@/types/form-fields'
import { cn } from '@/lib/utils'

export function CheckboxField({ field, value, onChange, error, disabled, className }: CheckboxFieldProps) {
  const handleChange = (checked: boolean) => {
    onChange(checked)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={value || false}
          onCheckedChange={handleChange}
          disabled={disabled}
        />
        <Label htmlFor={field.name} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {field.label}
        </Label>
      </div>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 