"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileFieldProps } from '@/types/form-fields'
import { cn } from '@/lib/utils'

export function FileField({ field, value, onChange, error, disabled, className }: FileFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onChange(files[0])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={field.name} className={cn(field.required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {field.label}
      </Label>
      <Input
        id={field.name}
        type="file"
        onChange={handleChange}
        accept={field.accept}
        multiple={field.multiple}
        disabled={disabled}
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