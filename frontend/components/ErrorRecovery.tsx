'use client'

import React, { useState, useEffect } from 'react'

interface ErrorInfo {
  message: string
  type: 'network' | 'server' | 'timeout' | 'unknown'
  timestamp: Date
  retryCount?: number
}

interface ErrorRecoveryProps {
  error: ErrorInfo | null
  onRetry: () => void
  onReset: () => void
  maxRetries?: number
  autoRetry?: boolean
  retryDelay?: number
}

export function ErrorRecovery({ 
  error, 
  onRetry, 
  onReset, 
  maxRetries = 3, 
  autoRetry = true,
  retryDelay = 3000 
}: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [userDecision, setUserDecision] = useState<'retry' | 'reset' | null>(null)

  useEffect(() => {
    if (error && autoRetry && !userDecision && (error.retryCount || 0) < maxRetries) {
      setRetryCountdown(retryDelay / 1000)
      
      const interval = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            handleAutoRetry()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [error, autoRetry, userDecision, maxRetries, retryDelay])

  const handleAutoRetry = async () => {
    setIsRetrying(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Brief delay for UX
    onRetry()
    setIsRetrying(false)
  }

  const handleManualRetry = async () => {
    setUserDecision('retry')
    setIsRetrying(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onRetry()
    setIsRetrying(false)
  }

  const handleReset = () => {
    setUserDecision('reset')
    onReset()
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'server':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        )
      case 'timeout':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getErrorTitle = (type: string) => {
    switch (type) {
      case 'network': return 'Connection Error'
      case 'server': return 'Server Error'
      case 'timeout': return 'Request Timeout'
      default: return 'Something went wrong'
    }
  }

  const getErrorSuggestion = (type: string) => {
    switch (type) {
      case 'network': return 'Please check your internet connection and try again.'
      case 'server': return 'Our servers are experiencing issues. We\'ll retry automatically.'
      case 'timeout': return 'The request took too long. We\'ll try with a faster connection.'
      default: return 'An unexpected error occurred. Please try again.'
    }
  }

  const canRetry = (error?.retryCount || 0) < maxRetries

  if (!error) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        {getErrorIcon(error.type)}
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {getErrorTitle(error.type)}
          </h3>
          
          <p className="text-red-700 mb-4">
            {error.message}
          </p>
          
          <p className="text-sm text-red-600 mb-4">
            {getErrorSuggestion(error.type)}
          </p>
          
          {/* Retry Info */}
          {canRetry && (
            <div className="mb-4">
              <div className="text-sm text-red-600">
                Retry attempt {(error.retryCount || 0) + 1} of {maxRetries}
              </div>
              
              {retryCountdown > 0 && !userDecision && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  <span className="text-sm text-red-600">
                    Retrying in {retryCountdown}s...
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {canRetry && (
              <button
                onClick={handleManualRetry}
                disabled={isRetrying || retryCountdown > 0}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry Now</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Start Over
            </button>
            
            {/* Cancel Auto Retry */}
            {retryCountdown > 0 && !userDecision && (
              <button
                onClick={() => setUserDecision('retry')}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Cancel Auto Retry
              </button>
            )}
          </div>
          
          {/* Max Retries Reached */}
          {!canRetry && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-red-800">
                    Maximum retries exceeded
                  </div>
                  <div className="text-sm text-red-700">
                    Please start over or contact support if the issue persists.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting: boolean
  lastConnected?: Date
  onReconnect?: () => void
}

export function ConnectionStatus({ 
  isConnected, 
  isConnecting, 
  lastConnected, 
  onReconnect 
}: ConnectionStatusProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Connected</span>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-medium">Connecting...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-sm font-medium">Disconnected</span>
      </div>
      
      {onReconnect && (
        <button
          onClick={onReconnect}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Reconnect
        </button>
      )}
      
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Details
      </button>
      
      {showDetails && lastConnected && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="text-sm text-gray-600">
            Last connected: {lastConnected.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to categorize errors
export function categorizeError(error: Error | string): ErrorInfo {
  const message = typeof error === 'string' ? error : error.message
  const timestamp = new Date()
  
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return { message, type: 'network', timestamp }
  }
  
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return { message, type: 'server', timestamp }
  }
  
  if (message.includes('timeout') || message.includes('AbortError')) {
    return { message, type: 'timeout', timestamp }
  }
  
  return { message, type: 'unknown', timestamp }
}