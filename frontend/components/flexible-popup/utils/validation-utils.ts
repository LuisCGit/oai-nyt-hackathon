export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email.trim()) {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = []
  
  if (!phone.trim()) {
    errors.push('Phone number is required')
  } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
    errors.push('Please enter a valid phone number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateText(text: string, minLength: number = 1): ValidationResult {
  const errors: string[] = []
  
  if (!text.trim()) {
    errors.push('This field is required')
  } else if (text.trim().length < minLength) {
    errors.push(`Must be at least ${minLength} characters`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateRequired(value: any): ValidationResult {
  const errors: string[] = []
  
  if (value === null || value === undefined || value === '') {
    errors.push('This field is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}