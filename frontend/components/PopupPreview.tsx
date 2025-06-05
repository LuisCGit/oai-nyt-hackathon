'use client'

import React, { useState } from "react";
import { FlexiblePopup } from './flexible-popup'
import { OptimizationInterface } from './OptimizationInterface'
import type { FlexibleContent } from '@/types/ui'
import { Breakpoint } from '@/types/ui'

// Using the sample data from our existing JSON file
import sampleContent from '@/data/sample-flexible-content.json'

export const PopupPreview: React.FC = () => {
  const [showOptimization, setShowOptimization] = useState(false)

  const handleOptimize = () => {
    setShowOptimization(true)
  }

  const handleBackToPreview = () => {
    setShowOptimization(false)
  };

  const handlePopupSubmit = async (data: Record<string, string>) => {
    console.log('Popup form submitted:', data)
    // Handle form submission here
  }

  return (
    <div className="h-screen flex">
      {/* Left side - Mobile Popup Preview */}
      <div className="w-96 bg-black border-r border-gray-200 relative overflow-hidden flex items-center justify-center">
        {/* Mobile Frame */}
        <div className="w-80 h-[640px] bg-white rounded-2xl overflow-hidden shadow-2xl relative">
          <FlexiblePopup
            content={sampleContent as FlexibleContent}
            overrideBreakpoint={Breakpoint.MAX_SM}
            onSubmit={handlePopupSubmit}
          />
        </div>
      </div>

      {/* Right side - Optimization Panel */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {showOptimization ? (
          <OptimizationInterface 
            popupConfig={sampleContent as FlexibleContent}
            onBack={handleBackToPreview}
          />
        ) : (
          <div className="p-6 flex flex-col">
            <div className="flex-1 flex flex-col justify-center items-center">
              {/* Connected Status */}
              <div className="mb-8 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-600">Store Connected</p>
                <p className="text-xs text-gray-500 mt-1">Ready to optimize</p>
              </div>

              {/* Popup Info */}
              <div className="w-full max-w-md bg-white rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Current Popup</h3>
                <p className="text-sm text-gray-600 mb-3">Email capture with free shipping offer</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Components:</span>
                    <span>{Object.values(sampleContent.sections).reduce((acc, section) => acc + section.components.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Layout:</span>
                    <span>{sampleContent.layout.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>View:</span>
                    <span>Mobile</span>
                  </div>
                </div>
              </div>

              {/* Optimize Button */}
              <button
                onClick={handleOptimize}
                className="w-full max-w-md bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Optimize Popup
              </button>

              {/* Additional Info */}
              <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
                AI will analyze your store data and suggest improvements
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};