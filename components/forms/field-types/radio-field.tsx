"use client"

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RadioFieldProps } from '@/types/form-fields'
import { cn } from '@/lib/utils'

export function RadioField({ field, value, onChange, error, disabled, className }: RadioFieldProps) {
  const handleValueChange = (newValue: string) => {
    onChange(newValue)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {field.label}
      </Label>
      <RadioGroup
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        {field.options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value.toString()}
              id={`${field.name}-${option.value}`}
              disabled={option.disabled}
            />
            <Label htmlFor={`${field.name}-${option.value}`}>
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 