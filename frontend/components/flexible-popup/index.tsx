'use client'

import { useState } from 'react'
import PopupContent from './components/popup-content'
import { useFormHandling } from './hooks/use-form-handling'
import type { FlexibleContent, Breakpoint } from '@/types/ui'

interface FlexiblePopupProps {
  content: FlexibleContent
  overrideBreakpoint?: Breakpoint
  onClose?: () => void
  onSubmit?: (data: Record<string, string>) => Promise<void>
  className?: string
}

export function FlexiblePopup({ 
  content, 
  overrideBreakpoint, 
  onClose, 
  onSubmit,
  className = ''
}: FlexiblePopupProps) {
  // Collect all input components for form handling
  const allComponents = Object.values(content.sections).flatMap(section => section.components)
  const { formData, errors, isSubmitting, updateField, handleSubmit } = useFormHandling(allComponents)

  const [formErrors] = useState<Record<string, string>>({})

  const handleFormSubmit = async (e: React.FormEvent | null, submitType?: string) => {
    if (e) e.preventDefault()
    
    const success = await handleSubmit(onSubmit)
    if (success && onClose) {
      onClose()
    }
  }

  const handleQuizSubmit = (answer: string) => {
    console.log('Quiz answer:', answer)
  }

  return (
    <PopupContent
      flexible_content={content}
      formData={formData}
      formErrors={formErrors}
      setFormData={(data) => {
        Object.entries(data).forEach(([key, value]) => {
          updateField(key, value)
        })
      }}
      onClose={onClose}
      handleSubmit={handleFormSubmit}
      handleQuizSubmit={handleQuizSubmit}
      isOptinSubmitLoading={isSubmitting}
      isPreviewMode={true}
      overrideBreakpoint={overrideBreakpoint}
      className={className}
    />
  )
}

export default FlexiblePopup