'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useOptimizationStream, StreamMessage } from '@/hooks/use-optimization-stream'
import { MetricsHighlight, extractMetricsFromText } from './MetricsHighlight'
import { BeforeAfterComparison, extractBeforeAfterFromText } from './BeforeAfterComparison'
import { ProgressTracker, InteractiveResponse, FloatingActionButton, useInteractiveFeatures } from './InteractiveElements'
import { ErrorRecovery, ConnectionStatus } from './ErrorRecovery'
import type { FlexibleContent } from '@/types/ui'

interface OptimizationInterfaceProps {
  popupConfig: FlexibleContent
  onBack: () => void
}

const LoadingDots = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
)

const MessageItem = ({ message, onHighlight, onCopy }: { 
  message: StreamMessage
  onHighlight?: (text: string) => void
  onCopy?: (text: string) => void 
}) => {
  if (message.type === 'tool_start') {
    return (
      <div className="flex items-center space-x-3 py-2">
        {!message.isComplete ? (
          <LoadingDots />
        ) : (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        )}
        <span className={`text-sm ${message.isComplete ? 'text-green-600' : 'text-gray-500'}`}>
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
    const metrics = extractMetricsFromText(message.content)
    const comparisons = extractBeforeAfterFromText(message.content)
    
    return (
      <div className="py-4 space-y-4">
        {/* Metrics Cards */}
        {metrics.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Key Metrics</h4>
            <MetricsHighlight metrics={metrics} />
          </div>
        )}
        
        {/* Before/After Comparisons */}
        {comparisons.length > 0 && (
          <div className="mb-4">
            <BeforeAfterComparison comparisons={comparisons} />
          </div>
        )}
        
        {/* Interactive Response Content */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <InteractiveResponse 
            content={message.content.replace(/\\n/g, '\n')}
            onHighlight={onHighlight}
            onCopy={onCopy}
          />
        </div>
      </div>
    )
  }
  
  return null
}

export function OptimizationInterface({ popupConfig, onBack }: OptimizationInterfaceProps) {
  const { messages, isStreaming, error, connectionState, startOptimization, retryConnection, reset } = useOptimizationStream()
  const { addHighlight, addCopiedText, highlights, copiedTexts } = useInteractiveFeatures()
  const [showAdvancedView, setShowAdvancedView] = useState(false)
  
  // Create progress steps based on tool messages
  const progressSteps = [
    {
      id: 'connect',
      title: 'Connect',
      description: 'Connecting to analysis engine',
      status: connectionState.isConnected ? 'completed' : connectionState.isConnecting ? 'active' : 'pending',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4 4m-1.102 1.102l-4 4" />
        </svg>
      )
    },
    {
      id: 'analyze',
      title: 'Analyze',
      description: 'Analyzing store data',
      status: messages.some(m => m.content.includes('product data')) ? 'completed' : 
             messages.some(m => m.type === 'tool_start' && !m.isComplete) ? 'active' : 'pending',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'optimize',
      title: 'Optimize',
      description: 'Generating recommendations',
      status: messages.some(m => m.type === 'agent_response') ? 'completed' : 
             messages.some(m => m.content.includes('analyzed')) ? 'active' : 'pending',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]

  const handleStartOptimization = () => {
    startOptimization(popupConfig)
  }

  const handleReset = () => {
    reset()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Popup Optimization</h2>
                <p className="text-sm text-gray-600">AI-powered conversion optimization analysis</p>
              </div>
              <ConnectionStatus 
                isConnected={connectionState.isConnected}
                isConnecting={connectionState.isConnecting}
                lastConnected={connectionState.lastConnected}
                onReconnect={retryConnection}
              />
            </div>
            
            {/* Progress Tracker */}
            {(isStreaming || messages.length > 0) && (
              <div className="mt-4">
                <ProgressTracker steps={progressSteps} />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedView(!showAdvancedView)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                showAdvancedView ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {showAdvancedView ? 'Simple' : 'Advanced'}
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 && !isStreaming ? (
          /* Initial State */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Optimize</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Our AI will analyze your store data and current popup performance to provide 
                personalized optimization recommendations.
              </p>
              <button
                onClick={handleStartOptimization}
                disabled={isStreaming}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Start Optimization Analysis
              </button>
            </div>
          </div>
        ) : (
          /* Streaming/Results State */
          <div className="flex-1 flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                    onHighlight={addHighlight}
                    onCopy={addCopiedText}
                  />
                ))}
                
                {isStreaming && messages.length > 0 && (
                  <div className="flex items-center space-x-3 py-2">
                    <LoadingDots />
                    <span className="text-sm text-gray-500">Analyzing...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isStreaming && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <LoadingDots />
                      <span>Analysis in progress...</span>
                    </div>
                  )}
                  
                  {!isStreaming && messages.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Analysis complete</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {!isStreaming && messages.length > 0 && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  
                  {!isStreaming && messages.length > 0 && (
                    <button
                      onClick={handleStartOptimization}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Re-analyze
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 border-t border-gray-200">
            <ErrorRecovery 
              error={error}
              onRetry={retryConnection}
              onReset={reset}
              maxRetries={3}
              autoRetry={true}
            />
          </div>
        )}
      </div>
      
      {/* Floating Action Buttons */}
      {messages.length > 0 && !isStreaming && (
        <>
          <FloatingActionButton
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            label="Copy Analysis"
            onClick={() => {
              const fullText = messages
                .filter(m => m.type === 'agent_response')
                .map(m => m.content)
                .join('\n\n')
              navigator.clipboard.writeText(fullText)
              addCopiedText('Full analysis copied!')
            }}
            position="bottom-right"
            color="blue"
          />
          
          {highlights.length > 0 && (
            <FloatingActionButton
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
              label={`${highlights.length} Highlights`}
              onClick={() => {
                navigator.clipboard.writeText(highlights.join('\n\n'))
                addCopiedText('Highlights copied!')
              }}
              position="bottom-left"
              color="green"
            />
          )}
        </>
      )}
      
      {/* Notification for copied text */}
      {copiedTexts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {copiedTexts.map((text, index) => (
            <div
              key={index}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in"
            >
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}