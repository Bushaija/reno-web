'use client'
import React from 'react'
import { NurseForm } from '@/components/api-forms/nurse-form'
import { NurseAvailabilityForm } from '@/components/api-forms/nurse-availability-form'

const ApiForms = () => {
  const nurseId = '123' // TODO: Replace with actual nurse selection
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">API Forms</h1>

      <section>
        <h2 className="text-xl font-medium mb-4">Create Nurse</h2>
        <NurseForm />
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4">Update Nurse Availability</h2>
        <NurseAvailabilityForm nurseId={nurseId} />
      </section>
    </div>
  )
}

export default ApiForms