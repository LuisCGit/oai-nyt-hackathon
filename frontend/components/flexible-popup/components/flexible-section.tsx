'use client'

import { useResponsiveStyles } from '@/hooks/use-responsive-styles'
import { FlexibleComponent } from './flexible-component'
import type { FlexibleSection, Breakpoint } from '@/types/ui'

interface FlexibleSectionProps {
  section: FlexibleSection
  overrideBreakpoint?: Breakpoint
  formData?: Record<string, string>
  errors?: Record<string, string[]>
  onFieldChange?: (fieldId: string, value: string) => void
  onAction?: (action: string, componentId: string) => void
}

export function FlexibleSection({
  section,
  overrideBreakpoint,
  formData,
  errors,
  onFieldChange,
  onAction,
}: FlexibleSectionProps) {
  const { styles } = useResponsiveStyles(section.styles, overrideBreakpoint)

  const layoutStyles = {
    ...styles,
    ...(section.layout === 'horizontal' && {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: '1rem',
    }),
    ...(section.layout === 'vertical' && {
      display: 'flex',
      flexDirection: 'column' as const,
    }),
  }

  return (
    <div style={layoutStyles}>
      {section.components.map((component) => (
        <FlexibleComponent
          key={component.id}
          component={component}
          overrideBreakpoint={overrideBreakpoint}
          formData={formData}
          errors={errors}
          onFieldChange={onFieldChange}
          onAction={onAction}
        />
      ))}
    </div>
  )
}