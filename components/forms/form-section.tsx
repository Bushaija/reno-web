"use client"

import React, { useState } from 'react'
import { FormSection as FormSectionType, FormField } from '@/types/modal-schemas'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormSectionProps {
  section: FormSectionType
  renderField: (field: FormField) => React.ReactNode
}

export function FormSection({ section, renderField }: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(section.collapsed ?? false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (!section.title && !section.description) {
    // No section header, just render fields
    return (
      <div className="space-y-4">
        {section.fields.map((field) => renderField(field))}
      </div>
    )
  }

  return (
    <Card className="border-none shadown-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {section.collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="h-6 w-6 p-0"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            {section.title && (
              <CardTitle className="text-lg font-semibold">
                {section.title}
              </CardTitle>
            )}
          </div>
        </div>
        {section.description && !isCollapsed && (
          <p className="text-sm text-muted-foreground mt-1">
            {section.description}
          </p>
        )}
      </CardHeader>
      {(!section.collapsible || !isCollapsed) && (
        <CardContent className="space-y-4 grid grid-cols-2 gap-4">
          {section.fields.map((field) => renderField(field))}
        </CardContent>
      )}
    </Card>
  )
} 