"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { HiddenFieldProps } from '@/types/form-fields'

export function HiddenField({ field, value, onChange }: HiddenFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Input
      id={field.name}
      type="hidden"
      value={value || ''}
      onChange={handleChange}
    />
  )
} 