// Field type definitions for form components
import { FormField } from './modal-schemas'

export interface FieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
  className?: string
}

export interface FieldWrapperProps {
  field: FormField
  children: React.ReactNode
  error?: string
  className?: string
}

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface FieldValidation {
  validate: (value: any, field: FormField) => ValidationResult
  validateField: (value: any, field: FormField) => ValidationResult
  validateForm: (data: Record<string, any>, fields: FormField[]) => Record<string, string>
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}

export interface FormActions {
  setValue: (name: string, value: any) => void
  setError: (name: string, error: string) => void
  setTouched: (name: string, touched: boolean) => void
  reset: () => void
  submit: () => void
}

export interface UseFormReturn {
  state: FormState
  actions: FormActions
}

export interface FieldContext {
  field: FormField
  value: any
  error?: string
  touched: boolean
  disabled: boolean
  setValue: (value: any) => void
  setError: (error: string) => void
  setTouched: (touched: boolean) => void
}

export interface FormContext {
  state: FormState
  actions: FormActions
  getFieldContext: (name: string) => FieldContext | null
}

// Field-specific props
export interface TextFieldProps extends FieldRendererProps {
  field: FormField & { type: 'text' | 'email' | 'password' }
}

export interface NumberFieldProps extends FieldRendererProps {
  field: FormField & { type: 'number' }
}

export interface TextareaFieldProps extends FieldRendererProps {
  field: FormField & { type: 'textarea' }
}

export interface SelectFieldProps extends FieldRendererProps {
  field: FormField & { type: 'select' | 'multiselect' }
}

export interface CheckboxFieldProps extends FieldRendererProps {
  field: FormField & { type: 'checkbox' }
}

export interface RadioFieldProps extends FieldRendererProps {
  field: FormField & { type: 'radio' }
}

export interface DateFieldProps extends FieldRendererProps {
  field: FormField & { type: 'date' | 'time' | 'datetime' }
}

export interface FileFieldProps extends FieldRendererProps {
  field: FormField & { type: 'file' }
}

// Field renderer function type
export type FieldRenderer = React.ComponentType<FieldRendererProps>

// Field renderer registry
export interface FieldRendererRegistry {
  [key: string]: FieldRenderer
}

// Form configuration
export interface FormConfig {
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  defaultValues?: Record<string, any>
  onSubmit?: (data: any) => Promise<void> | void
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

// Field dependencies
export interface FieldDependency {
  field: string
  condition: (value: any) => boolean
  action: 'show' | 'hide' | 'enable' | 'disable' | 'clear'
}

export interface DependencyRule {
  field: string
  dependencies: FieldDependency[]
}

// Conditional field logic
export interface ConditionalLogic {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  action: 'show' | 'hide' | 'enable' | 'disable' | 'clear'
}

// Form section props
export interface FormSectionProps {
  title?: string
  description?: string
  fields: FormField[]
  collapsible?: boolean
  collapsed?: boolean
  children: React.ReactNode
}

// Form layout options
export interface FormLayout {
  columns?: number
  spacing?: 'sm' | 'md' | 'lg'
  alignment?: 'left' | 'center' | 'right'
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: string
}

// Field grouping
export interface FieldGroup {
  name: string
  label?: string
  fields: FormField[]
  layout?: FormLayout
}

// Form validation schema (Zod-like)
export interface ValidationSchema {
  [fieldName: string]: {
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    email?: boolean
    custom?: (value: any) => boolean | string
  }
} 