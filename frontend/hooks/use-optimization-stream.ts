import { useState, useCallback } from 'react'

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

export function useOptimizationStream() {
  const [messages, setMessages] = useState<StreamMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startOptimization = useCallback(async (popupConfig: any) => {
    setMessages([])
    setIsStreaming(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ popup_config: popupConfig }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const handleStreamEvent = useCallback((event: any) => {
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    // Add debug logging
    console.log('Received event:', event)
    
    // Handle tool calls - look for function call events in raw_response_event
    if (event.type === 'raw_response_event' && typeof event.data === 'string') {
      console.log('Processing raw_response_event:', event.data)
      
      // Try to parse the stringified event data
      try {
        // Check if it's a function call event
        if (event.data.includes('ResponseOutputItemAddedEvent') && event.data.includes('function_call')) {
          console.log('Found function call event')
          // Extract function name from the event data string
          const fetchProductMatch = event.data.match(/fetch_product_data/)
          const fetchPopupMatch = event.data.match(/fetch_popup_data/)
          
          if (fetchProductMatch) {
            console.log('Adding fetch_product_data message')
            setMessages(prev => [...prev, {
              id: messageId,
              type: 'tool_start',
              content: 'Fetching product data...',
              timestamp: new Date(),
              isComplete: false
            }])
          } else if (fetchPopupMatch) {
            console.log('Adding fetch_popup_data message')
            setMessages(prev => [...prev, {
              id: messageId,
              type: 'tool_start', 
              content: 'Fetching popup data...',
              timestamp: new Date(),
              isComplete: false
            }])
          }
        }
        // Check for function completion
        else if (event.data.includes('ResponseOutputItemDoneEvent') && event.data.includes('function_call')) {
          console.log('Found function completion event')
          setMessages(prev => {
            const updated = [...prev]
            const lastToolIndex = updated.map(m => m.type).lastIndexOf('tool_start')
            if (lastToolIndex !== -1 && !updated[lastToolIndex].isComplete) {
              const originalContent = updated[lastToolIndex].content
              let completionMessage = ''
              
              if (originalContent.includes('product data')) {
                completionMessage = 'Product data analyzed'
              } else if (originalContent.includes('popup data')) {
                completionMessage = 'Popup data analyzed'
              } else {
                completionMessage = originalContent.replace('...', ' completed')
              }
              
              updated[lastToolIndex] = {
                ...updated[lastToolIndex],
                content: completionMessage,
                isComplete: true
              }
            }
            return updated
          })
        }
        // Check for text deltas
        else if (event.data.includes('ResponseTextDeltaEvent')) {
          // Extract delta from the event data string
          const deltaMatch = event.data.match(/delta='([^']*)'/) || event.data.match(/delta="([^"]*)"/)
          if (deltaMatch) {
            const delta = deltaMatch[1]
            console.log('Found text delta:', delta)
            
            setMessages(prev => {
              const updated = [...prev]
              const lastMessage = updated[updated.length - 1]
              
              if (lastMessage && lastMessage.type === 'agent_response') {
                // Append to existing response
                updated[updated.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + delta
                }
              } else {
                // Create new response message
                updated.push({
                  id: messageId,
                  type: 'agent_response',
                  content: delta,
                  timestamp: new Date()
                })
              }
              
              return updated
            })
          }
        }
      } catch (e) {
        console.error('Error parsing event data:', e)
      }
    }
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setIsStreaming(false)
    setError(null)
  }, [])

  return {
    messages,
    isStreaming,
    error,
    startOptimization,
    reset
  }
}