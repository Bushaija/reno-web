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

  const getNurseSchema = (onSubmit?: (data: any) => Promise<void>): ModalSchema => ({
    id: 'nurse-modal',
    title: 'Nurse Profile',
    description: 'Create or edit nurse profile',
    size: 'lg',
    sections: [
      {
        title: 'Personal Details',
        fields: [
          { name: 'user.name', label: 'Full Name', type: 'text', required: true },
          { name: 'user.email', label: 'Email', type: 'email', required: true },
          { name: 'user.phone', label: 'Phone', type: 'text' },
          { name: 'user.emergency_contact_name', label: 'Emergency Contact Name', type: 'text' },
          { name: 'user.emergency_contact_phone', label: 'Emergency Contact Phone', type: 'text' }
        ]
      },
      {
        title: 'Employment Details',
        fields: [
          { name: 'employee_id', label: 'Employee ID', type: 'text', required: true },
          { name: 'specialization', label: 'Specialization', type: 'text' },
          { name: 'license_number', label: 'License Number', type: 'text' },
          { name: 'employment_type', label: 'Employment Type', type: 'select', options: [
              { label: 'Full Time', value: 'full_time' },
              { label: 'Part Time', value: 'part_time' },
              { label: 'Per Diem', value: 'per_diem' },
              { label: 'Travel', value: 'travel' }
            ], defaultValue: 'full_time' },
          { name: 'base_hourly_rate', label: 'Base Hourly Rate', type: 'number', step: 0.01 },
          { name: 'max_hours_per_week', label: 'Max Hours / Week', type: 'number' }
        ]
      },
      {
        title: 'Shift Preferences',
        fields: [
          { name: 'preferences.prefers_day_shifts', label: 'Prefers Day Shifts', type: 'checkbox' },
          { name: 'preferences.prefers_night_shifts', label: 'Prefers Night Shifts', type: 'checkbox' },
          { name: 'preferences.weekend_availability', label: 'Weekend Availability', type: 'checkbox' }
        ]
      }
    ],
    submitButton: { text: 'Save Nurse', loadingText: 'Saving...' },
    cancelButton: { text: 'Cancel', variant: 'outline' },
    onSubmit,
  })

  const openNurseModal = useCallback((initialData?: any) => {
    const nurseSchema = getNurseSchema()
    openModal(nurseSchema, initialData)
  }, [openModal])

  const openNurseModalWithSubmit = useCallback((initialData?: any, onSubmit?: (data: any) => Promise<void>) => {
    const nurseSchema = getNurseSchema(onSubmit)
    openModal(nurseSchema, initialData)
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
    openNurseModal,
    openNurseModalWithSubmit,
    openSettingsModal,
    openModal
  }
} 