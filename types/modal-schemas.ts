// Core schema types for modal system
export type FieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'hidden'

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'custom'
  value?: any
  message?: string
  validator?: (value: any) => boolean | string
}

export interface BaseField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: any
  validation?: ValidationRule[]
  dependencies?: string[] // Fields this field depends on
  conditional?: {
    field: string
    value: any
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  }
}

export interface TextField extends BaseField {
  type: 'text' | 'email' | 'password'
  maxLength?: number
  minLength?: number
}

export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export interface TextareaField extends BaseField {
  type: 'textarea'
  rows?: number
  maxLength?: number
}

export interface SelectField extends BaseField {
  type: 'select' | 'multiselect'
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  multiple?: boolean
}

export interface CheckboxField extends BaseField {
  type: 'checkbox'
  options?: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
}

export interface RadioField extends BaseField {
  type: 'radio'
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
}

export interface DateField extends BaseField {
  type: 'date' | 'time' | 'datetime'
  min?: string
  max?: string
}

export interface FileField extends BaseField {
  type: 'file'
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
}

export interface HiddenField extends BaseField {
  type: 'hidden'
}

export type FormField = 
  | TextField 
  | NumberField 
  | TextareaField 
  | SelectField 
  | CheckboxField 
  | RadioField 
  | DateField 
  | FileField 
  | HiddenField

export interface FormSection {
  title?: string
  description?: string
  fields: FormField[]
  collapsible?: boolean
  collapsed?: boolean
}

export interface ModalSchema {
  id: string
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  sections: FormSection[]
  submitButton?: {
    text?: string
    loadingText?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }
  cancelButton?: {
    text?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }
  validation?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all'
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  }
  onSubmit?: (data: any) => Promise<void> | void
  onCancel?: () => void
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export interface ModalState {
  isOpen: boolean
  schema: ModalSchema
  data?: any
  isLoading?: boolean
  errors?: Record<string, string>
}

export interface SchemaModalProps {
  schema: ModalSchema
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSubmit?: (data: any) => Promise<void> | void
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
} 