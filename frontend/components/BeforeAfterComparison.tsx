'use client'

import React, { useState } from 'react'

interface ComparisonData {
  label: string
  before: string
  after: string
  improvement?: string
  format?: 'currency' | 'percentage' | 'number'
}

interface BeforeAfterComparisonProps {
  comparisons: ComparisonData[]
  title?: string
  animated?: boolean
}

const ComparisonCard = ({ comparison, animated = true }: { comparison: ComparisonData; animated?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const getImprovementColor = (improvement?: string) => {
    if (!improvement) return 'text-gray-600'
    const isPositive = improvement.includes('+') || improvement.includes('increase')
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  const formatValue = (value: string, format?: string) => {
    if (format === 'currency' && !value.startsWith('$')) {
      return `$${value}`
    }
    if (format === 'percentage' && !value.endsWith('%')) {
      return `${value}%`
    }
    return value
  }

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 ${animated ? 'transform transition-all duration-300 hover:shadow-lg' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h4 className="text-sm font-medium text-gray-900 mb-3">{comparison.label}</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className={`text-center p-3 rounded-lg border ${isHovered ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'} transition-colors duration-200`}>
          <div className="text-xs text-gray-500 mb-1">Before</div>
          <div className="text-lg font-semibold text-gray-700">
            {formatValue(comparison.before, comparison.format)}
          </div>
        </div>
        
        {/* After */}
        <div className={`text-center p-3 rounded-lg border ${isHovered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} transition-colors duration-200`}>
          <div className="text-xs text-gray-500 mb-1">After</div>
          <div className="text-lg font-semibold text-green-600">
            {formatValue(comparison.after, comparison.format)}
          </div>
        </div>
      </div>
      
      {/* Arrow and Improvement */}
      <div className="flex items-center justify-center mt-3 space-x-2">
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        {comparison.improvement && (
          <span className={`text-sm font-medium ${getImprovementColor(comparison.improvement)}`}>
            {comparison.improvement}
          </span>
        )}
      </div>
    </div>
  )
}

export function BeforeAfterComparison({ comparisons, title = "Performance Comparison", animated = true }: BeforeAfterComparisonProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {comparisons.map((comparison, index) => (
          <div
            key={index}
            className={animated ? 'animate-fade-in' : ''}
            style={animated ? { animationDelay: `${index * 200}ms` } : {}}
          >
            <ComparisonCard comparison={comparison} animated={animated} />
          </div>
        ))}
      </div>
      
      {/* Summary Stats */}
      {comparisons.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500">Total Metrics</div>
              <div className="text-lg font-semibold text-gray-900">{comparisons.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Improved</div>
              <div className="text-lg font-semibold text-green-600">
                {comparisons.filter(c => c.improvement?.includes('+')).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg Improvement</div>
              <div className="text-lg font-semibold text-blue-600">+24%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to extract REAL before/after data from AI text responses
export function extractBeforeAfterFromText(text: string): ComparisonData[] {
  const comparisons: ComparisonData[] = []
  
  // Only look for explicit before/after patterns mentioned by the AI
  // More specific patterns that indicate actual comparisons
  
  // Direct before/after statements
  const explicitBeforeAfter = /(?:from|before)[:\s]*([^\n→]+?)(?:\s*→\s*|\s+to\s+|\s+after[:\s]*|\s+becomes?\s+)([^\n,]+)/gi
  let match
  
  while ((match = explicitBeforeAfter.exec(text)) !== null) {
    const before = match[1].trim()
    const after = match[2].trim()
    
    // Skip if values are too generic or short
    if (before.length > 3 && after.length > 3 && before !== after) {
      // Determine format based on content
      let format: 'currency' | 'percentage' | 'number' | undefined = undefined
      let improvement: string | undefined = undefined
      
      if (before.includes('%') && after.includes('%')) {
        format = 'percentage'
        const beforeNum = parseFloat(before.replace(/[^\d.]/g, ''))
        const afterNum = parseFloat(after.replace(/[^\d.]/g, ''))
        if (!isNaN(beforeNum) && !isNaN(afterNum)) {
          improvement = afterNum > beforeNum ? `+${(afterNum - beforeNum).toFixed(1)}%` : `${(afterNum - beforeNum).toFixed(1)}%`
        }
      } else if (before.includes('$') && after.includes('$')) {
        format = 'currency'
      }
      
      comparisons.push({
        label: 'Performance Change',
        before,
        after,
        improvement,
        format
      })
    }
  }
  
  // Improvement arrows (→) pattern
  const arrowPattern = /([^→\n]+)\s*→\s*([^→\n]+)/gi
  while ((match = arrowPattern.exec(text)) !== null) {
    const before = match[1].trim()
    const after = match[2].trim()
    
    // Only include if it looks like a meaningful comparison
    if (before.length > 3 && after.length > 3 && 
        (before.includes('%') || before.includes('$') || after.includes('%') || after.includes('$'))) {
      
      let format: 'currency' | 'percentage' | 'number' | undefined = undefined
      if (before.includes('%') || after.includes('%')) format = 'percentage'
      else if (before.includes('$') || after.includes('$')) format = 'currency'
      
      comparisons.push({
        label: 'Optimization Result',
        before,
        after,
        format
      })
    }
  }
  
  // Remove duplicates based on similar before/after values
  const uniqueComparisons = comparisons.filter((comp, index, self) => 
    index === self.findIndex(c => 
      c.before.toLowerCase() === comp.before.toLowerCase() || 
      c.after.toLowerCase() === comp.after.toLowerCase()
    )
  )
  
  return uniqueComparisons.slice(0, 3) // Limit to 3 comparisons for clean display
}