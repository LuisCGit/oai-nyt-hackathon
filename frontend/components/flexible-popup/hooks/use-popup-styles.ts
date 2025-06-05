import { useMemo } from 'react'
import { useResponsiveStyles } from '@/hooks/use-responsive-styles'
import type { FlexibleContent, Breakpoint } from '@/types/ui'

interface UsePopupStylesProps {
  flexible_content: FlexibleContent
  isPreviewMode?: boolean
  overrideBreakpoint?: Breakpoint
}

export function usePopupStyles({
  flexible_content,
  isPreviewMode = false,
  overrideBreakpoint,
}: UsePopupStylesProps) {
  const { layout } = flexible_content
  const popupConfig = layout?.custom_properties?.popup_config

  // Get responsive container styles
  const containerStyles = useResponsiveStyles(
    popupConfig?.responsive || {},
    overrideBreakpoint
  )

  // Get background styles from gradient config
  const backgroundStyles = useMemo(() => {
    if (!popupConfig?.gradient) return {}

    const { type, direction, stops } = popupConfig.gradient
    if (!stops || stops.length === 0) return {}

    const gradientStops = stops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ')

    return {
      background: `${type}-gradient(${direction}, ${gradientStops})`,
    }
  }, [popupConfig?.gradient])

  // Split layout styles (if needed)
  const splitStyles = useMemo(() => {
    const isSplitLayout = layout?.type === 'split'
    if (!isSplitLayout) return { left: {}, right: {} }

    const splitRatio = layout?.custom_properties?.split_ratio || 50
    return {
      left: { width: `${splitRatio}%` },
      right: { width: `${100 - splitRatio}%` },
    }
  }, [layout])

  // Extract overlay and close button configs
  const overlayConfig = popupConfig?.overlay || {}
  const closeButtonConfig = popupConfig?.close_button || {}
  
  // Split config for mobile stacking
  const splitConfig = {
    mobileStackDirection: layout?.custom_properties?.mobile_stack_direction || 'left_first',
  }

  return {
    containerStyles,
    backgroundStyles,
    splitStyles,
    overlayConfig,
    closeButtonConfig,
    splitConfig,
  }
}