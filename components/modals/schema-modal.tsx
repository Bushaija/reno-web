"use client"

import React from 'react'
import { SchemaModalProps } from '@/types/modal-schemas'
import { SchemaForm } from '@/components/forms/schema-form'
import CustomModal from '@/components/ui/custom-modal'
import { Button } from '@/components/ui/button'

export function SchemaModal({ 
  schema, 
  isOpen, 
  onClose, 
  initialData, 
  onSubmit, 
  onSuccess, 
  onError 
}: SchemaModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(data)
      }
      onSuccess?.(data)
      onClose()
    } catch (error) {
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const getModalSize = () => {
    switch (schema.size) {
      case 'sm':
        return 'max-w-md'
      case 'md':
        return 'max-w-lg'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      case 'full':
        return 'max-w-full mx-4'
      default:
        return 'max-w-lg'
    }
  }

  return (
    <CustomModal
      id={schema.id}
      title={schema.title}
      subheading={schema.description}
      defaultOpen={isOpen}
      contentClass={getModalSize()}
    >
      <div className="space-y-6">
        <SchemaForm
          schema={schema}
          initialData={initialData}
          onSubmit={handleSubmit}
          onSuccess={onSuccess}
          onError={onError}
        />
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant={schema.cancelButton?.variant || "outline"}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {schema.cancelButton?.text || "Cancel"}
          </Button>
          <Button
            variant={schema.submitButton?.variant || "default"}
            onClick={() => {
              // Trigger form submission
              const form = document.querySelector('form')
              if (form) {
                form.requestSubmit()
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (schema.submitButton?.loadingText || "Saving...") 
              : (schema.submitButton?.text || "Save")
            }
          </Button>
        </div>
      </div>
    </CustomModal>
  )
} 