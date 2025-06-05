'use client'

import React, { useState, useEffect } from 'react'

interface ProgressStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed'
  icon?: React.ReactNode
}

interface ProgressTrackerProps {
  steps: ProgressStep[]
  animated?: boolean
}

export function ProgressTracker({ steps, animated = true }: ProgressTrackerProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const activeIndex = steps.findIndex(step => step.status === 'active')
    if (activeIndex !== -1) {
      setCurrentStep(activeIndex)
    }
  }, [steps])

  const getStepStatus = (index: number, step: ProgressStep) => {
    if (step.status === 'completed') return 'completed'
    if (step.status === 'active') return 'active'
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white'
      case 'active': return 'bg-blue-500 text-white animate-pulse'
      default: return 'bg-gray-200 text-gray-500'
    }
  }

  const getConnectorColor = (index: number) => {
    if (index < currentStep) return 'bg-green-500'
    if (index === currentStep) return 'bg-blue-500'
    return 'bg-gray-200'
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${getStatusColor(getStepStatus(index, step))}`}
              >
                {step.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.icon || (index + 1)}
              </div>
              
              {/* Step Content */}
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${step.status === 'active' ? 'text-blue-600' : step.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 max-w-24">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mt-5">
                <div 
                  className={`h-full transition-all duration-500 ${getConnectorColor(index)} ${animated ? 'animate-pulse' : ''}`}
                  style={{ 
                    width: step.status === 'active' ? '50%' : step.status === 'completed' ? '100%' : '0%'
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

interface InteractiveResponseProps {
  content: string
  onHighlight?: (text: string) => void
  onCopy?: (text: string) => void
}

export function InteractiveResponse({ content, onHighlight, onCopy }: InteractiveResponseProps) {
  const [selectedText, setSelectedText] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString() || ''
    
    if (text) {
      setSelectedText(text)
      
      // Get selection position for tooltip
      const range = selection?.getRangeAt(0)
      if (range) {
        const rect = range.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        })
        setShowTooltip(true)
      }
    } else {
      setShowTooltip(false)
    }
  }

  const handleHighlight = () => {
    if (selectedText && onHighlight) {
      onHighlight(selectedText)
      setShowTooltip(false)
    }
  }

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
      if (onCopy) onCopy(selectedText)
      setShowTooltip(false)
    }
  }

  return (
    <div className="relative">
      <div 
        className="prose prose-sm max-w-none text-gray-900 cursor-text select-text"
        onMouseUp={handleTextSelection}
      >
        {content.split('\n').map((line, index) => (
          <p key={index} className="mb-2 leading-relaxed hover:bg-gray-50 transition-colors duration-200 rounded p-1">
            {line}
          </p>
        ))}
      </div>
      
      {/* Selection Tooltip */}
      {showTooltip && (
        <div 
          className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg flex space-x-2"
          style={{
            left: tooltipPosition.x - 60,
            top: tooltipPosition.y - 50
          }}
        >
          <button
            onClick={handleHighlight}
            className="text-xs hover:text-yellow-300 transition-colors"
            title="Highlight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="text-xs hover:text-blue-300 transition-colors"
            title="Copy"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

interface FloatingActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  color?: 'blue' | 'green' | 'red' | 'gray'
}

export function FloatingActionButton({ 
  icon, 
  label, 
  onClick, 
  position = 'bottom-right',
  color = 'blue' 
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left': return 'bottom-6 left-6'
      case 'top-right': return 'top-6 right-6'
      case 'top-left': return 'top-6 left-6'
      default: return 'bottom-6 right-6'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'bg-green-500 hover:bg-green-600 text-white'
      case 'red': return 'bg-red-500 hover:bg-red-600 text-white'
      case 'gray': return 'bg-gray-500 hover:bg-gray-600 text-white'
      default: return 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${getColorClasses()}
          w-14 h-14 rounded-full shadow-lg 
          flex items-center justify-center
          transform transition-all duration-200
          hover:scale-110 hover:shadow-xl
          active:scale-95
        `}
      >
        {icon}
      </button>
      
      {/* Label Tooltip */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap animate-fade-in">
          {label}
          <div className="absolute top-full right-4 w-2 h-2 bg-gray-800 transform rotate-45 -mt-1" />
        </div>
      )}
    </div>
  )
}

interface AnimatedCounterProps {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export function AnimatedCounter({ 
  target, 
  duration = 2000, 
  prefix = '', 
  suffix = '', 
  decimals = 0 
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const value = target * easeOut
      
      setCurrent(value)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, duration])

  return (
    <span className="font-mono">
      {prefix}{current.toFixed(decimals)}{suffix}
    </span>
  )
}

// Utility hook for interactive features
export function useInteractiveFeatures() {
  const [highlights, setHighlights] = useState<string[]>([])
  const [copiedTexts, setCopiedTexts] = useState<string[]>([])

  const addHighlight = (text: string) => {
    setHighlights(prev => [...prev, text])
  }

  const addCopiedText = (text: string) => {
    setCopiedTexts(prev => [...prev, text])
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setCopiedTexts(prev => prev.filter(t => t !== text))
    }, 3000)
  }

  const clearHighlights = () => {
    setHighlights([])
  }

  return {
    highlights,
    copiedTexts,
    addHighlight,
    addCopiedText,
    clearHighlights
  }
}