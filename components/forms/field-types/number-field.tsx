"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberFieldProps } from '@/types/form-fields'
import { cn } from '@/lib/utils'

export function NumberField({ field, value, onChange, error, disabled, className }: NumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === '' ? '' : Number(e.target.value)
    onChange(numValue)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={field.name} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {field.label}
      </Label>
      <Input
        id={field.name}
        type="number"
        value={value || ''}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        min={field.min}
        max={field.max}
        step={field.step}
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