"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { FormField, FormSection, ModalSchema } from '@/types/modal-schemas'
import { FormState, FormActions, UseFormReturn, FormContext as FormContextType } from '@/types/form-fields'
import { FieldRenderer } from './field-renderer'
import { FormSection as FormSectionComponent } from './form-section'

// Form reducer
type FormAction = 
  | { type: 'SET_VALUE'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'SET_TOUCHED'; field: string; touched: boolean }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'RESET'; defaultValues?: Record<string, any> }
  | { type: 'SET_MULTIPLE_VALUES'; values: Record<string, any> }

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: '' } // Clear error when value changes
      }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      }
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: action.touched }
      }
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.submitting
      }
    case 'RESET':
      return {
        values: action.defaultValues || {},
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false
      }
    case 'SET_MULTIPLE_VALUES':
      return {
        ...state,
        values: { ...state.values, ...action.values }
      }
    default:
      return state
  }
}

// Form context
const FormContext = createContext<FormContextType | null>(null)

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a SchemaForm')
  }
  return context
}

// Validation function
const validateField = (value: any, field: FormField): string | null => {
  if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return field.validation?.find(v => v.type === 'required')?.message || `${field.label} is required`
  }

  if (field.validation) {
    for (const rule of field.validation) {
      switch (rule.type) {
        case 'min':
          if (value && value.length < rule.value) {
            return rule.message || `${field.label} must be at least ${rule.value} characters`
          }
          break
        case 'max':
          if (value && value.length > rule.value) {
            return rule.message || `${field.label} must be at most ${rule.value} characters`
          }
          break
        case 'pattern':
          if (value && rule.value && !rule.value.test(value)) {
            return rule.message || `${field.label} format is invalid`
          }
          break
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return rule.message || `${field.label} must be a valid email`
          }
          break
        case 'custom':
          if (rule.validator) {
            const result = rule.validator(value)
            if (result !== true) {
              return typeof result === 'string' ? result : rule.message || `${field.label} is invalid`
            }
          }
          break
      }
    }
  }

  return null
}

const validateForm = (values: Record<string, any>, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  fields.forEach(field => {
    const error = validateField(values[field.name], field)
    if (error) {
      errors[field.name] = error
    }
  })

  return errors
}

// Transform form data to handle nested field names (e.g., "profile.employeeId" -> { profile: { employeeId: value } })
const transformFormData = (values: Record<string, any>): Record<string, any> => {
  const transformed: Record<string, any> = {}
  
  Object.entries(values).forEach(([key, value]) => {
    if (key.includes('.')) {
      // Handle nested fields like "profile.employeeId"
      const parts = key.split('.')
      let current = transformed
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {}
        }
        current = current[parts[i]]
      }
      
      current[parts[parts.length - 1]] = value
    } else {
      // Handle regular fields
      transformed[key] = value
    }
  })
  
  return transformed
}

// Main form component
interface SchemaFormProps {
  schema: ModalSchema
  initialData?: Record<string, any>
  onSubmit?: (data: any) => Promise<void> | void
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  className?: string
}

export function SchemaForm({ 
  schema, 
  initialData = {}, 
  onSubmit, 
  onSuccess, 
  onError,
  className = '' 
}: SchemaFormProps) {
  // Initialize form state
  const getDefaultValues = useCallback(() => {
    const defaults: Record<string, any> = {}
    
    schema.sections.forEach(section => {
      section.fields.forEach(field => {
        // Handle nested field names for initial data
        let value = field.defaultValue ?? ''
        
        if (initialData && field.name.includes('.')) {
          // Handle nested fields like "profile.employeeId"
          const parts = field.name.split('.')
          let current = initialData
          
          for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
              current = current[part]
            } else {
              current = undefined
              break
            }
          }
          
          if (current !== undefined) {
            value = String(current || '')
          }
        } else if (initialData && field.name in initialData) {
          value = initialData[field.name]
        }
        
        defaults[field.name] = value
      })
    })
    
    return defaults
  }, [schema, initialData])

  const [state, dispatch] = useReducer(formReducer, {
    values: getDefaultValues(),
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  })

  // Form actions
  const actions: FormActions = {
    setValue: useCallback((name: string, value: any) => {
      dispatch({ type: 'SET_VALUE', field: name, value })
    }, []),
    
    setError: useCallback((name: string, error: string) => {
      dispatch({ type: 'SET_ERROR', field: name, error })
    }, []),
    
    setTouched: useCallback((name: string, touched: boolean) => {
      dispatch({ type: 'SET_TOUCHED', field: name, touched })
    }, []),
    
    reset: useCallback(() => {
      dispatch({ type: 'RESET', defaultValues: getDefaultValues() })
    }, [getDefaultValues]),
    
    submit: useCallback(async () => {
      // Get all fields from schema
      const allFields: FormField[] = []
      schema.sections.forEach(section => {
        allFields.push(...section.fields)
      })

      // Validate form
      const errors = validateForm(state.values, allFields)
      
      if (Object.keys(errors).length > 0) {
        // Set all errors
        Object.entries(errors).forEach(([field, error]) => {
          dispatch({ type: 'SET_ERROR', field, error })
        })
        return
      }

      // Transform form data to match API structure
      const transformedData = transformFormData(state.values)

      dispatch({ type: 'SET_SUBMITTING', submitting: true })

      try {
        if (onSubmit) {
          await onSubmit(transformedData)
        }
        onSuccess?.(transformedData)
      } catch (error) {
        onError?.(error)
      } finally {
        dispatch({ type: 'SET_SUBMITTING', submitting: false })
      }
    }, [state.values, onSubmit, onSuccess, onError, schema])
  }

  // Get field context
  const getFieldContext = useCallback((name: string) => {
    const field = schema.sections
      .flatMap(section => section.fields)
      .find(f => f.name === name)
    
    if (!field) return null

    return {
      field,
      value: state.values[name] ?? '',
      error: state.errors[name],
      touched: state.touched[name] ?? false,
      disabled: field.disabled ?? false,
      setValue: (value: any) => actions.setValue(name, value),
      setError: (error: string) => actions.setError(name, error),
      setTouched: (touched: boolean) => actions.setTouched(name, touched)
    }
  }, [schema, state, actions])

  // Form context value
  const contextValue: FormContextType = {
    state,
    actions,
    getFieldContext
  }

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    actions.submit()
  }, [actions])

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={`${className} w-full`}>
        <div className="space-y-6">
          {schema.sections.map((section, sectionIndex) => (
            <FormSectionComponent
              key={sectionIndex}
              section={section}
              renderField={(field: FormField) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  value={state.values[field.name] ?? ''}
                  onChange={(value: any) => actions.setValue(field.name, value)}
                  error={state.errors[field.name]}
                  disabled={field.disabled ?? false}
                />
              )}
            />
          ))}
        </div>
      </form>
    </FormContext.Provider>
  )
} 