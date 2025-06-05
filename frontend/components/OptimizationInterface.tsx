'use client'

import React, { useState, useEffect } from 'react'
import { useOptimizationStream, StreamMessage } from '@/hooks/use-optimization-stream'
import { ProgressTracker } from './InteractiveElements'
import { ErrorRecovery, ConnectionStatus } from './ErrorRecovery'
import type { FlexibleContent } from '@/types/ui'

interface OptimizationInterfaceProps {
  popupConfig: FlexibleContent
  onBack: () => void
  onPopupUpdate?: (newConfig: FlexibleContent) => void
}

const LoadingDots = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
)

const MessageItem = ({ message }: { message: StreamMessage }) => {
  if (message.type === 'tool_start') {
    return (
      <div className="flex items-center space-x-3 py-3 px-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        {!message.isComplete ? (
          <LoadingDots />
        ) : (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        )}
        <span className={`text-sm font-medium ${message.isComplete ? 'text-green-700' : 'text-blue-700'}`}>
          {message.content}
        </span>
        {message.isComplete && (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    )
  }
  
  if (message.type === 'agent_response') {
    // Extract key points from the content
    const content = message.content.replace(/\\n/g, '\n')
    const keyPoints = extractKeyPoints(content)
    
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-3">Design Analysis Results</h4>
            <div className="space-y-2">
              {keyPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

// Helper function to extract key points from analysis content
const extractKeyPoints = (content: string): string[] => {
  const lines = content.split('\n').filter(line => line.trim())
  const keyPoints: string[] = []
  
  // Look for bullet points, numbered lists, or lines with key indicators
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip headers and empty lines
    if (trimmed.startsWith('#') || trimmed.length < 10) continue
    
    // Extract bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      keyPoints.push(trimmed.substring(1).trim())
    }
    // Extract lines that seem like recommendations
    else if (trimmed.includes(':') && (
      trimmed.toLowerCase().includes('design') ||
      trimmed.toLowerCase().includes('button') ||
      trimmed.toLowerCase().includes('color') ||
      trimmed.toLowerCase().includes('layout') ||
      trimmed.toLowerCase().includes('copy') ||
      trimmed.toLowerCase().includes('recommend')
    )) {
      keyPoints.push(trimmed)
    }
  }
  
  // If no clear points found, take the first few meaningful sentences
  if (keyPoints.length === 0) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
    keyPoints.push(...sentences.slice(0, 3).map(s => s.trim()))
  }
  
  return keyPoints.slice(0, 5) // Limit to 5 key points for cleaner display
}

export function OptimizationInterface({ popupConfig, onBack, onPopupUpdate }: OptimizationInterfaceProps) {
  const { messages, isStreaming, error, connectionState, startOptimization, retryConnection, reset } = useOptimizationStream()
  const [isImplementing, setIsImplementing] = useState(false)
  const [implementationError, setImplementationError] = useState<string | null>(null)
  
  // Auto-scroll functionality
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  React.useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Create progress steps based on tool messages
  const progressSteps = [
    {
      id: 'connect',
      title: 'Connect',
      description: 'Connecting to analysis engine',
      status: (connectionState.isConnected ? 'completed' : connectionState.isConnecting ? 'active' : 'pending') as 'pending' | 'active' | 'completed',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4 4m-1.102 1.102l-4 4" />
        </svg>
      )
    },
    {
      id: 'analyze',
      title: 'Analyze',
      description: 'Analyzing popup design patterns',
      status: (messages.some(m => m.content.includes('product data')) ? 'completed' : 
             messages.some(m => m.type === 'tool_start' && !m.isComplete) ? 'active' : 'pending') as 'pending' | 'active' | 'completed',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'recommend',
      title: 'Recommend',
      description: 'Creating design recommendations',
      status: (messages.some(m => m.type === 'agent_response') ? 'completed' : 
             messages.some(m => m.content.includes('analyzed')) ? 'active' : 'pending') as 'pending' | 'active' | 'completed',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ]

  const handleStartOptimization = () => {
    startOptimization(popupConfig)
  }

  const handleReset = () => {
    reset()
    setImplementationError(null)
  }

  const extractUIInsights = (messages: StreamMessage[]): string => {
    // Extract design-focused insights from the analysis
    const analysisContent = messages
      .filter(m => m.type === 'agent_response')
      .map(m => m.content)
      .join('\n\n')
    
    // Focus on design-specific keywords, exclude revenue/sales terms
    const designKeywords = [
      'design', 'visual', 'color', 'button', 'CTA', 'layout', 'mobile', 'responsive',
      'font', 'typography', 'size', 'position', 'trigger', 'timing', 'copy', 'headline',
      'urgency', 'social proof', 'exit-intent', 'form', 'input', 'contrast', 'hierarchy',
      'spacing', 'alignment', 'icon', 'image', 'background', 'border', 'rounded',
      'single-step', 'single-column', 'minimal', 'bold', 'clear'
    ]
    
    // Terms to exclude (revenue/sales focused)
    const excludeKeywords = [
      'revenue', 'sales', 'profit', 'ROI', 'dollars', '$', 'income', 'earnings',
      'annually', 'monthly', 'payback', 'investment', 'financial', 'money'
    ]
    
    const sentences = analysisContent.split(/[.!?]+/)
    const designInsights = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase()
      
      // Must contain design keywords
      const hasDesignKeyword = designKeywords.some(keyword => 
        lowerSentence.includes(keyword.toLowerCase())
      )
      
      // Must not contain revenue/sales keywords
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        lowerSentence.includes(keyword.toLowerCase())
      )
      
      return hasDesignKeyword && !hasExcludedKeyword
    }).join('. ')
    
    // If no specific design insights found, extract from "Design Recommendations" section
    const recommendationsMatch = analysisContent.match(/Design Recommendations[^]*$/i)
    if (recommendationsMatch) {
      return recommendationsMatch[0]
    }
    
    return designInsights || "Focus on improving visual design, button contrast, and user experience elements."
  }

  const handleImplementChanges = async () => {
    if (!onPopupUpdate) return
    
    setIsImplementing(true)
    setImplementationError(null)
    
    try {
      const uiInsights = extractUIInsights(messages)
      
      const response = await fetch('http://localhost:8000/implement-popup-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insights: uiInsights,
          current_config: popupConfig
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to implement changes: ${response.statusText}`)
      }
      
      const newConfig = await response.json()
      onPopupUpdate(newConfig)
      
      // Replace current analysis with success message
      reset()
      
    } catch (error) {
      console.error('Error implementing changes:', error)
      setImplementationError(error instanceof Error ? error.message : 'Failed to implement changes')
    } finally {
      setIsImplementing(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">PopupGenius</h2>
                  <p className="text-sm text-gray-600">AI Design Optimization</p>
                </div>
              </div>
              <div className="hidden md:block">
                <ConnectionStatus 
                  isConnected={connectionState.isConnected}
                  isConnecting={connectionState.isConnecting}
                  lastConnected={connectionState.lastConnected}
                  onReconnect={retryConnection}
                />
              </div>
            </div>
            
            {/* Progress Tracker */}
            {(isStreaming || messages.length > 0) && (
              <div className="mt-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <ProgressTracker steps={progressSteps} />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 && !isStreaming ? (
          /* Initial State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center max-w-lg">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Transform Your Popup</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Our AI design expert will analyze user behavior patterns and competitor strategies 
                to provide specific, actionable popup design improvements.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Design Analysis</h4>
                  <p className="text-gray-600">Visual hierarchy & UX patterns</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">User Behavior</h4>
                  <p className="text-gray-600">Interaction & engagement insights</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Market Research</h4>
                  <p className="text-gray-600">Competitor design strategies</p>
                </div>
              </div>
              
              <button
                onClick={handleStartOptimization}
                disabled={isStreaming}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚀 Start Design Analysis
              </button>
            </div>
          </div>
        ) : (
          /* Streaming/Results State */
          <div className="flex-1 flex flex-col">
            {/* Messages Container - Fixed Height with Scroll */}
            <div className="flex-1 p-6">
              <div className="bg-gray-50 rounded-xl border border-gray-200 h-[32rem] overflow-y-auto shadow-inner">
                <div className="p-6 space-y-4">
                  {messages.map((message) => (
                    <MessageItem 
                      key={message.id} 
                      message={message}
                    />
                  ))}
                  
                  {isStreaming && (
                    <div className="flex items-center space-x-3 py-3 px-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <LoadingDots />
                      <span className="text-sm font-medium text-blue-700">Processing analysis...</span>
                    </div>
                  )}
                  
                  {/* Auto-scroll target */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isStreaming && (
                    <div className="flex items-center space-x-3 text-sm">
                      <LoadingDots />
                      <span className="text-blue-600 font-medium">Analyzing design patterns...</span>
                    </div>
                  )}
                  
                  {!isStreaming && messages.length > 0 && (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">Design analysis complete</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {!isStreaming && messages.length > 0 && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      🔄 Reset
                    </button>
                  )}
                  
                  {!isStreaming && messages.length > 0 && (
                    <button
                      onClick={handleImplementChanges}
                      disabled={isImplementing}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {isImplementing ? (
                        <>
                          <LoadingDots />
                          <span>Implementing Changes...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Apply Design Changes</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {!isStreaming && messages.length > 0 && (
                    <button
                      onClick={handleStartOptimization}
                      className="px-5 py-3 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      🔍 Re-analyze
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {(error || implementationError) && (
          <div className="p-4 border-t border-gray-200">
            {implementationError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800">Implementation Failed</h4>
                    <p className="text-sm text-red-600 mt-1">{implementationError}</p>
                    <button
                      onClick={() => setImplementationError(null)}
                      className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ErrorRecovery 
                error={error}
                onRetry={retryConnection}
                onReset={reset}
                maxRetries={3}
                autoRetry={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}