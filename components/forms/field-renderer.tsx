"use client"

import React from 'react'
import { FormField } from '@/types/modal-schemas'
import { FieldRendererProps } from '@/types/form-fields'
import { TextField } from './field-types/text-field'
import { NumberField } from './field-types/number-field'
import { TextareaField } from './field-types/textarea-field'
import { SelectField } from './field-types/select-field'
import { CheckboxField } from './field-types/checkbox-field'
import { RadioField } from './field-types/radio-field'
import { DateField } from './field-types/date-field'
import { FileField } from './field-types/file-field'
import { HiddenField } from './field-types/hidden-field'

export function FieldRenderer({ field, value, onChange, error, disabled, className }: FieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <TextField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'number':
        return (
          <NumberField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'textarea':
        return (
          <TextareaField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'select':
      case 'multiselect':
        return (
          <SelectField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'checkbox':
        return (
          <CheckboxField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'radio':
        return (
          <RadioField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'date':
      case 'time':
      case 'datetime':
        return (
          <DateField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'file':
        return (
          <FileField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      case 'hidden':
        return (
          <HiddenField
            field={field}
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
            className={className}
          />
        )
      
      default:
        return (
          <div className="text-red-500">
            Unknown field type: {field.type}
          </div>
        )
    }
  }

  return renderField()
} 