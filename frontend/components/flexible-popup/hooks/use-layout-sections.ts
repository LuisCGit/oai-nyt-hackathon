import { useMemo } from 'react'
import type { LayoutConfig, Section } from '@/types/ui'

interface UseLayoutSectionsProps {
  layout: LayoutConfig
  sections: Record<string, Section>
  isSplitLayout: boolean
}

export function useLayoutSections({
  layout,
  sections,
  isSplitLayout,
}: UseLayoutSectionsProps) {
  const { leftSection, rightSection } = useMemo(() => {
    if (!isSplitLayout) {
      return { leftSection: null, rightSection: null }
    }

    const slotMapping = layout.slot_mapping || {}
    const sectionEntries = Object.entries(sections)

    // Find sections mapped to left and right slots
    const leftSectionId = Object.keys(slotMapping).find(
      id => slotMapping[id] === 'left'
    )
    const rightSectionId = Object.keys(slotMapping).find(
      id => slotMapping[id] === 'right'
    )

    const leftSection = leftSectionId 
      ? sections[leftSectionId] 
      : sectionEntries[0]?.[1] || null
      
    const rightSection = rightSectionId 
      ? sections[rightSectionId] 
      : sectionEntries[1]?.[1] || null

    return { leftSection, rightSection }
  }, [layout, sections, isSplitLayout])

  return { leftSection, rightSection }
}