'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useOptimizationStream, StreamMessage } from '@/hooks/use-optimization-stream'
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

const MessageItem = ({ message }: { message: StreamMessage }) => {
  if (message.type === 'tool_start') {
    return (
      <div className="flex items-center space-x-3 py-2">
        {!message.isComplete ? (
          <LoadingDots />
        ) : (
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        )}
        <span className={`text-sm ${message.isComplete ? 'text-gray-600' : 'text-gray-500'}`}>
          {message.content}
        </span>
      </div>
    )
  }
  
  if (message.type === 'agent_response') {
    return (
      <div className="py-2">
        <div className="prose prose-sm max-w-none text-gray-900">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2">{children}</p>,
            }}
          >
            {message.content.replace(/\\n/g, '\n')}
          </ReactMarkdown>
        </div>
      </div>
    )
  }
  
  return null
}

export function OptimizationInterface({ popupConfig, onBack }: OptimizationInterfaceProps) {
  const { messages, isStreaming, error, startOptimization, reset } = useOptimizationStream()

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
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Popup Optimization</h2>
            <p className="text-sm text-gray-600">AI-powered conversion optimization analysis</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
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
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Optimization Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}