'use client'

import { cn } from '@/lib/utils'
import type { Device } from '@/types/ui'

interface DeviceToggleProps {
  device: Device
  onDeviceChange: (device: Device) => void
  className?: string
}

export function DeviceToggle({ device, onDeviceChange, className }: DeviceToggleProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <button
        onClick={() => onDeviceChange('desktop')}
        className={cn(
          'px-3 py-1 rounded-md text-sm font-medium transition-colors',
          device === 'desktop'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        )}
      >
        Desktop
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={cn(
          'px-3 py-1 rounded-md text-sm font-medium transition-colors',
          device === 'mobile'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        )}
      >
        Mobile
      </button>
    </div>
  )
}