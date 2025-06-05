import { useState, useCallback } from 'react'
import { validateEmail, validatePhone, validateText, validateRequired } from '../utils/validation-utils'
import type { FlexibleComponent } from '@/types/ui'

export interface FormData {
  [key: string]: string
}

export interface FormErrors {
  [key: string]: string[]
}

export function useFormHandling(components: FlexibleComponent[]) {
  const [formData, setFormData] = useState<FormData>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear errors for this field when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {}
    
    components.forEach(component => {
      if (component.type === 'input' && component.properties.required) {
        const value = formData[component.id] || ''
        const inputType = component.properties.input_type || 'text'
        
        let validation
        switch (inputType) {
          case 'email':
            validation = validateEmail(value)
            break
          case 'tel':
          case 'phone':
            validation = validatePhone(value)
            break
          default:
            validation = validateText(value)
        }
        
        if (!validation.isValid) {
          newErrors[component.id] = validation.errors
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [components, formData])

  const handleSubmit = useCallback(async (onSubmit?: (data: FormData) => Promise<void>) => {
    if (isSubmitting) return false
    
    setIsSubmitting(true)
    
    try {
      const isValid = validateForm()
      if (!isValid) {
        setIsSubmitting(false)
        return false
      }
      
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default submission behavior
        console.log('Form submitted:', formData)
      }
      
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, isSubmitting])

  const resetForm = useCallback(() => {
    setFormData({})
    setErrors({})
    setIsSubmitting(false)
  }, [])

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
  }
}