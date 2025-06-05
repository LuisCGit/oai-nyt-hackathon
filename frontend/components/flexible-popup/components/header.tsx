'use client'

import type { PopupConfig, Breakpoint } from '@/types/ui'

interface HeaderProps {
  config?: PopupConfig
  overrideBreakpoint?: Breakpoint
  onClose?: () => void
}

export function Header({ config, onClose }: HeaderProps) {
  if (!config?.close_button) return null

  const { size = '24px', color = '#ffffff', position = 'right', opacity = 0.6 } = config.close_button

  const buttonStyle = {
    position: 'absolute' as const,
    top: '16px',
    [position]: '16px',
    width: size,
    height: size,
    color,
    opacity,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    zIndex: 10,
  }

  return (
    <button
      style={buttonStyle}
      onClick={onClose}
      aria-label="Close popup"
    >
      ×
    </button>
  )
}