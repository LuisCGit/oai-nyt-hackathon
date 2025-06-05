import { useState, useCallback, useRef, useEffect } from 'react'
import { categorizeError } from '@/components/ErrorRecovery'

export interface OptimizationEvent {
  type: string
  data: any
  timestamp: Date
}

export interface StreamMessage {
  id: string
  type: 'tool_start' | 'tool_response' | 'agent_response'
  content: string
  timestamp: Date
  isComplete?: boolean
}

interface ErrorInfo {
  message: string
  type: 'network' | 'server' | 'timeout' | 'unknown'
  timestamp: Date
  retryCount: number
}

interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  lastConnected?: Date
  retryCount: number
}

export function useOptimizationStream() {
  const [messages, setMessages] = useState<StreamMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    retryCount: 0
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPopupConfigRef = useRef<any>(null)
  
  const maxRetries = 3
  const baseRetryDelay = 1000

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  const attemptConnection = useCallback(async (popupConfig: any, isRetry = false): Promise<boolean> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    lastPopupConfigRef.current = popupConfig
    
    setConnectionState(prev => ({ 
      ...prev, 
      isConnecting: true,
      retryCount: isRetry ? prev.retryCount + 1 : 0
    }))
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30s timeout
      })
      
      const fetchPromise = fetch('http://localhost:8000/popup-optimization-structured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          business_description: `E-commerce store with popup configuration: ${JSON.stringify(popupConfig)}`,
          optimization_goals: "Optimize popup conversion rates and user engagement"
        }),
        signal: abortControllerRef.current.signal
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false,
        lastConnected: new Date()
      }))

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body available')
      }

      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6))
              handleStreamEvent(eventData)
            } catch (e) {
              console.error('Error parsing event:', e)
            }
          }
        }
      }
      
      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: false 
      }))
      
      return true
    } catch (err) {
      console.error('Connection error:', err)
      
      if (err instanceof Error && err.name === 'AbortError') {
        return false // Don't retry if aborted
      }
      
      const errorInfo = categorizeError(err instanceof Error ? err : 'Unknown error')
      errorInfo.retryCount = connectionState.retryCount || 0
      
      setError(errorInfo)
      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isConnecting: false 
      }))
      
      // Auto-retry logic
      if (connectionState.retryCount < maxRetries) {
        const delay = baseRetryDelay * Math.pow(2, connectionState.retryCount) // Exponential backoff
        
        reconnectTimeoutRef.current = setTimeout(() => {
          attemptConnection(popupConfig, true)
        }, delay)
      }
      
      return false
    }
  }, [connectionState.retryCount])

  const startOptimization = useCallback(async (popupConfig: any) => {
    setMessages([])
    setIsStreaming(true)
    setError(null)

    const success = await attemptConnection(popupConfig)
    
    if (!success && connectionState.retryCount >= maxRetries) {
      setIsStreaming(false)
    } else if (success) {
      setIsStreaming(false)
    }
  }, [attemptConnection, connectionState.retryCount])

  const retryConnection = useCallback(() => {
    if (lastPopupConfigRef.current) {
      setError(null)
      setConnectionState(prev => ({ ...prev, retryCount: 0 }))
      startOptimization(lastPopupConfigRef.current)
    }
  }, [])

  const handleStreamEvent = useCallback((event: any) => {
    const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 9)
    
    console.log('Received event:', event)
    
    // Handle structured events from the backend
    if (event.type === 'tool_start') {
      setMessages(prev => [...prev, {
        id: messageId,
        type: 'tool_start',
        content: `${event.tool_description || event.tool_name}`,
        timestamp: new Date(),
        isComplete: false
      }])
    }
    else if (event.type === 'tool_complete') {
      setMessages(prev => {
        const updated = [...prev]
        const lastToolIndex = updated.map(m => m.type).lastIndexOf('tool_start')
        if (lastToolIndex !== -1 && !updated[lastToolIndex].isComplete) {
          updated[lastToolIndex] = {
            ...updated[lastToolIndex],
            content: updated[lastToolIndex].content.replace('...', ' ✓'),
            isComplete: true
          }
        }
        return updated
      })
    }
    else if (event.type === 'text_chunk') {
      setMessages(prev => {
        const updated = [...prev]
        const lastMessage = updated[updated.length - 1]
        
        if (lastMessage && lastMessage.type === 'agent_response') {
          // Append to existing response
          updated[updated.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + event.content
          }
        } else {
          // Create new response message
          updated.push({
            id: messageId,
            type: 'agent_response',
            content: event.content,
            timestamp: new Date()
          })
        }
        
        return updated
      })
    }
    else if (event.type === 'analysis_start') {
      // Optional: Add a start message
      setMessages(prev => [...prev, {
        id: messageId,
        type: 'tool_start',
        content: event.message || 'Starting analysis...',
        timestamp: new Date(),
        isComplete: true
      }])
    }
  }, [])

  const reset = useCallback(() => {
    // Cancel any ongoing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    setMessages([])
    setIsStreaming(false)
    setError(null)
    setConnectionState({
      isConnected: false,
      isConnecting: false,
      retryCount: 0
    })
    lastPopupConfigRef.current = null
  }, [])

  return {
    messages,
    isStreaming,
    error,
    connectionState,
    startOptimization,
    retryConnection,
    reset
  }
}