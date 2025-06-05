'use client'

import React from 'react'

interface MetricData {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  format?: 'currency' | 'percentage' | 'number'
}

interface MetricsHighlightProps {
  metrics: MetricData[]
  animated?: boolean
}

const MetricCard = ({ metric, animated = true }: { metric: MetricData; animated?: boolean }) => {
  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getArrowIcon = (type?: string) => {
    if (type === 'positive') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      )
    } else if (type === 'negative') {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 ${animated ? 'transform transition-all duration-300 hover:scale-105 hover:shadow-md' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {metric.icon && (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {metric.icon}
            </div>
          )}
          <span className="text-sm text-gray-600 font-medium">{metric.label}</span>
        </div>
        {metric.change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(metric.changeType)}`}>
            {getArrowIcon(metric.changeType)}
            <span>{metric.change}</span>
          </div>
        )}
      </div>
      
      <div className={`text-2xl font-bold ${metric.format === 'currency' ? 'text-green-600' : 'text-gray-900'} ${animated ? 'transition-colors duration-300' : ''}`}>
        {metric.value}
      </div>
    </div>
  )
}

export function MetricsHighlight({ metrics, animated = true }: MetricsHighlightProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={animated ? 'animate-fade-in' : ''}
          style={animated ? { animationDelay: `${index * 150}ms` } : {}}
        >
          <MetricCard metric={metric} animated={animated} />
        </div>
      ))}
    </div>
  )
}

// Utility function to extract and highlight metrics from text
export function extractMetricsFromText(text: string): MetricData[] {
  const metrics: MetricData[] = []
  
  // Revenue patterns
  const revenuePatterns = [
    /\$[\d,]+(?:\.\d{2})?/g,
    /revenue.*?\$[\d,]+/gi,
    /sales.*?\$[\d,]+/gi
  ]
  
  // Percentage patterns  
  const percentagePatterns = [
    /\d+(?:\.\d+)?%/g,
    /conversion.*?(\d+(?:\.\d+)?%)/gi,
    /rate.*?(\d+(?:\.\d+)?%)/gi
  ]
  
  // Extract revenue metrics
  revenuePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        metrics.push({
          label: 'Revenue Impact',
          value: match.replace(/[^\d$.,]/g, ''),
          format: 'currency',
          icon: (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          )
        })
      })
    }
  })
  
  // Extract percentage metrics
  percentagePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const percentValue = match.match(/\d+(?:\.\d+)?%/)?.[0]
        if (percentValue) {
          metrics.push({
            label: 'Conversion Rate',
            value: percentValue,
            format: 'percentage',
            icon: (
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
              </svg>
            )
          })
        }
      })
    }
  })
  
  return metrics.slice(0, 6) // Limit to 6 metrics for clean display
}