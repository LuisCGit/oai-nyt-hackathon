import { useState, useEffect, useMemo } from "react";
import { Breakpoint } from "@/types/ui";

// Define the style object structure
interface StylesByBreakpoint {
  default?: Record<string, any>;
  "max-sm"?: Record<string, any>;
  "max-md"?: Record<string, any>;
  "max-lg"?: Record<string, any>;
  "max-xl"?: Record<string, any>;
  "max-2xl"?: Record<string, any>;
  [key: string]: Record<string, any> | undefined;
}

// Define breakpoint configuration type
interface BreakpointConfig {
  name: Exclude<Breakpoint, null>;
  query: string;
}

/**
 * Hook to get the appropriate styles for the current breakpoint
 *
 * @param {StylesByBreakpoint} styles - Object containing styles for different breakpoints
 * @param {Record<string, any>} styles.default - Default styles
 * @param {Record<string, any>} [styles.max-sm] - Styles for small screens (max-width: 639px)
 * @param {Record<string, any>} [styles.max-md] - Styles for medium screens (max-width: 767px)
 * @param {Record<string, any>} [styles.max-lg] - Styles for large screens (max-width: 1023px)
 * @param {Record<string, any>} [styles.max-xl] - Styles for extra large screens (max-width: 1279px)
 * @param {Record<string, any>} [styles.max-2xl] - Styles for 2xl screens (max-width: 1535px)
 * @param {Breakpoint} [overrideBreakpoint] - Optional breakpoint to override the detected window size
 * @returns {Record<string, any>} - Combined styles for the current breakpoint
 */
export const useResponsiveStyles = (
  styles: StylesByBreakpoint = { default: {} },
  overrideBreakpoint?: Breakpoint
): Record<string, any> => {
  // Track detected breakpoint based on window size
  const [detectedBreakpoint, setDetectedBreakpoint] =
    useState<Breakpoint>(Breakpoint.DEFAULT);

  // Use override if provided, otherwise use detected breakpoint
  const currentBreakpoint =
    overrideBreakpoint !== undefined ? overrideBreakpoint : detectedBreakpoint;

  // Define breakpoints in descending order (most specific first)
  const breakpoints = useMemo<BreakpointConfig[]>(
    () => [
      { name: Breakpoint.MAX_SM, query: "(max-width: 639px)" },
      { name: Breakpoint.MAX_MD, query: "(max-width: 767px)" },
      { name: Breakpoint.MAX_LG, query: "(max-width: 1023px)" },
      { name: Breakpoint.MAX_XL, query: "(max-width: 1279px)" },
      { name: Breakpoint.MAX_2XL, query: "(max-width: 1535px)" },
    ],
    []
  );

  // Set up media query listeners
  useEffect(() => {
    // Create media query list for each breakpoint
    const mediaQueries = breakpoints.map((bp) => ({
      ...bp,
      mql: window.matchMedia(bp.query),
    }));

    // Function to update detected breakpoint
    const updateBreakpoint = () => {
      // Find the first matching breakpoint (most specific)
      const match = mediaQueries.find((bp) => bp.mql.matches);
      setDetectedBreakpoint(match ? match.name : Breakpoint.DEFAULT);
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Add event listeners
    mediaQueries.forEach((bp) => {
      bp.mql.addEventListener("change", updateBreakpoint);
    });

    // Clean up event listeners
    return () => {
      mediaQueries.forEach((bp) => {
        bp.mql.removeEventListener("change", updateBreakpoint);
      });
    };
  }, [breakpoints]);

  // Compute the final styles based on current breakpoint (either override or detected)
  const responsiveStyles = useMemo(() => {
    // Start with default styles
    const finalStyles = { ...styles.default };

    // Apply breakpoint-specific styles if available
    if (currentBreakpoint && styles[currentBreakpoint]) {
      return { ...finalStyles, ...styles[currentBreakpoint] };
    }

    return finalStyles;
  }, [styles, currentBreakpoint]);

  return responsiveStyles;
};