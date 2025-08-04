"use client"

import React, { useState, useCallback } from 'react'
import { useModal } from '@/providers/modal-context'
import { ModalSchema } from '@/types/modal-schemas'
import { SchemaModal } from '@/components/modals/schema-modal'

export interface UseSchemaModalReturn {
  openModal: (schema: ModalSchema, initialData?: any) => void
  closeModal: () => void
  isOpen: boolean
  currentSchema: ModalSchema | null
  currentData: any
}

export function useSchemaModal(): UseSchemaModalReturn {
  const { setOpen, setClose, isOpen } = useModal()
  const [currentSchema, setCurrentSchema] = useState<ModalSchema | null>(null)
  const [currentData, setCurrentData] = useState<any>(null)

  const openModal = useCallback((schema: ModalSchema, initialData?: any) => {
    setCurrentSchema(schema)
    setCurrentData(initialData)

    setOpen(
      React.createElement(SchemaModal, {
        schema: schema,
        isOpen: true,
        onClose: () => {
          setClose(schema.id)
          setCurrentSchema(null)
          setCurrentData(null)
        },
        initialData: initialData,
        onSubmit: schema.onSubmit,
        onSuccess: schema.onSuccess,
        onError: schema.onError
      }),
      undefined,
      schema.id
    )
  }, [setOpen, setClose])

  const closeModal = useCallback(() => {
    if (currentSchema) {
      setClose(currentSchema.id)
      setCurrentSchema(null)
      setCurrentData(null)
    }
  }, [currentSchema, setClose])

  return {
    openModal,
    closeModal,
    isOpen: currentSchema ? isOpen[currentSchema.id] || false : false,
    currentSchema,
    currentData
  }
}

// Hook for creating predefined modal schemas
export function usePredefinedSchemaModal() {
  const { openModal } = useSchemaModal()

  const getUserSchema = (onSubmit?: (data: any) => Promise<void>): ModalSchema => ({
    id: 'user-modal',
    title: 'User Management',
    description: 'Create or edit user information',
    size: 'lg',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter full name',
            validation: [
              { type: 'required', message: 'Name is required' },
              { type: 'min', value: 2, message: 'Name must be at least 2 characters' }
            ]
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'Enter email address',
            validation: [
              { type: 'required', message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' }
            ]
          },
          // {
          //   name: 'password',
          //   label: 'Password',
          //   type: 'password',
          //   required: true,
          //   placeholder: 'Enter password',
          //   validation: [
          //     { type: 'required', message: 'Password is required' },
          //     { type: 'min', value: 6, message: 'Password must be at least 6 characters' }
          //   ]
          // },
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'text',
            placeholder: 'Enter phone number',
            validation: [
              { type: 'pattern', value: /^[\+]?[0-9]{10,16}$/, message: 'Please enter a valid phone number' }
            ]
          },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            defaultValue: 'healthcare_worker',
            options: [
              { label: 'Healthcare Worker', value: 'healthcare_worker' },
              { label: 'Admin', value: 'admin' }
            ]
          }
        ]
      },
      {
        title: 'Professional Profile',
        fields: [
          {
            name: 'profile.employeeId',
            label: 'Employee ID',
            type: 'text',
            placeholder: 'Enter employee ID'
          },
          {
            name: 'profile.specialization',
            label: 'Specialization',
            type: 'text',
            placeholder: 'Enter specialization'
          },
          {
            name: 'profile.availableStart',
            label: 'Available Start Time',
            type: 'time',
            placeholder: 'Select start time'
          },
          {
            name: 'profile.availableEnd',
            label: 'Available End Time',
            type: 'time',
            placeholder: 'Select end time'
          },
          {
            name: 'profile.department',
            label: 'Department',
            type: 'text',
            placeholder: 'Enter department'
          },
          {
            name: 'profile.licenseNumber',
            label: 'License Number',
            type: 'text',
            placeholder: 'Enter license number'
          },
          {
            name: 'profile.certification',
            label: 'Certification',
            type: 'textarea',
            placeholder: 'Enter certifications',
            rows: 3
          }
        ]
      }
    ],
    submitButton: {
      text: 'Save User',
      loadingText: 'Saving...',
      variant: 'default'
    },
    cancelButton: {
      text: 'Cancel',
      variant: 'outline'
    },
    onSubmit: onSubmit
  })

  const openUserModal = useCallback((initialData?: any) => {
    const userSchema = getUserSchema()
    openModal(userSchema, initialData)
  }, [openModal])

  const openUserModalWithSubmit = useCallback((initialData?: any, onSubmit?: (data: any) => Promise<void>) => {
    const userSchema = getUserSchema(onSubmit)
    openModal(userSchema, initialData)
  }, [openModal])

  const openSettingsModal = useCallback((initialData?: any) => {
    const settingsSchema: ModalSchema = {
      id: 'settings-modal',
      title: 'System Settings',
      description: 'Configure system preferences',
      size: 'md',
      sections: [
        {
          title: 'General Settings',
          fields: [
            {
              name: 'siteName',
              label: 'Site Name',
              type: 'text',
              required: true,
              placeholder: 'Enter site name'
            },
            {
              name: 'timezone',
              label: 'Timezone',
              type: 'select',
              required: true,
              options: [
                { label: 'UTC', value: 'UTC' },
                { label: 'EST', value: 'EST' },
                { label: 'PST', value: 'PST' }
              ]
            },
            {
              name: 'notifications',
              label: 'Enable Notifications',
              type: 'checkbox'
            }
          ]
        }
      ],
      submitButton: {
        text: 'Save Settings',
        loadingText: 'Saving...',
        variant: 'default'
      },
      cancelButton: {
        text: 'Cancel',
        variant: 'outline'
      }
    }

    openModal(settingsSchema, initialData)
  }, [openModal])

  return {
    openUserModal,
    openUserModalWithSubmit,
    openSettingsModal,
    openModal
  }
} 