'use client'

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { FlexibleSection } from "./flexible-section";
import { usePopupStyles } from "../hooks/use-popup-styles";
import { useLayoutSections } from "../hooks/use-layout-sections";
import type { FlexibleContent, Breakpoint } from "@/types/ui";

interface PopupContentProps {
  node?: any;
  flexible_content: FlexibleContent;
  formData: Record<string, string>;
  formErrors: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  onClose?: () => void;
  handleSubmit: (e: React.FormEvent | null, submitType?: string) => void;
  handleQuizSubmit?: (answer: string) => void;
  isOptinSubmitLoading?: boolean;
  isPreviewMode?: boolean;
  className?: string;
  overrideBreakpoint?: Breakpoint;
}

const PopupContent = forwardRef<HTMLDivElement, PopupContentProps>(
  (
    {
      node = { type: 'default' },
      flexible_content,
      formData,
      formErrors,
      setFormData,
      onClose,
      handleSubmit,
      handleQuizSubmit = () => {},
      isOptinSubmitLoading = false,
      isPreviewMode = false,
      className,
      overrideBreakpoint,
    },
    ref
  ) => {
    const { layout, sections } = flexible_content;
    const isSplitLayout = layout?.type === "split";
    const isStackedLayout = layout?.type === "stacked";

    // Get styles and config
    const {
      containerStyles,
      backgroundStyles,
      splitStyles,
      overlayConfig,
      closeButtonConfig,
      splitConfig,
    } = usePopupStyles({
      flexible_content,
      isPreviewMode,
      overrideBreakpoint,
    });

    // Get sections based on layout
    const { leftSection, rightSection } = useLayoutSections({
      layout,
      sections,
      isSplitLayout,
    });

    const renderSplitLayout = () => (
      <>
        {leftSection && (
          <div
            className={cn(
              "w-full h-full",
              // If overrideBreakpoint is set, use it directly
              overrideBreakpoint
                ? overrideBreakpoint === "max-sm" &&
                  splitConfig.mobileStackDirection === "left_first"
                  ? "order-1"
                  : overrideBreakpoint === "max-sm" &&
                      splitConfig.mobileStackDirection === "right_first"
                    ? "order-2"
                    : "order-none"
                : // Otherwise use breakpoints
                  splitConfig.mobileStackDirection === "left_first"
                  ? "md:order-none order-1"
                  : "md:order-none order-2"
            )}
            style={splitStyles.left}
          >
            <FlexibleSection
              section={leftSection}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              handleSubmit={handleSubmit}
              handleClose={onClose || (() => {})}
              isOptinSubmitLoading={isOptinSubmitLoading}
              nodeType={node.type}
              handleQuizSubmit={handleQuizSubmit}
              overrideBreakpoint={overrideBreakpoint}
            />
          </div>
        )}

        {rightSection && (
          <div
            className={cn(
              "w-full",
              // If overrideBreakpoint is set, use it directly
              overrideBreakpoint
                ? overrideBreakpoint === "max-sm" &&
                  splitConfig.mobileStackDirection === "right_first"
                  ? "order-1"
                  : overrideBreakpoint === "max-sm" &&
                      splitConfig.mobileStackDirection === "left_first"
                    ? "order-2"
                    : "order-none"
                : // Otherwise use breakpoints
                  splitConfig.mobileStackDirection === "right_first"
                  ? "md:order-none order-1"
                  : "md:order-none order-2"
            )}
            style={splitStyles.right}
          >
            <FlexibleSection
              section={rightSection}
              formData={formData}
              formErrors={formErrors}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              handleClose={onClose || (() => {})}
              isOptinSubmitLoading={isOptinSubmitLoading}
              nodeType={node.type}
              handleQuizSubmit={handleQuizSubmit}
              overrideBreakpoint={overrideBreakpoint}
            />
          </div>
        )}
      </>
    );

    const renderStackedLayout = () => (
      <div className="flex flex-col w-full h-full items-center">
        {Object.values(sections).map((section: any) => (
          <FlexibleSection
            key={section.id}
            section={section}
            formData={formData}
            formErrors={formErrors}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleClose={onClose || (() => {})}
            isOptinSubmitLoading={isOptinSubmitLoading}
            nodeType={node.type}
            handleQuizSubmit={handleQuizSubmit}
            overrideBreakpoint={overrideBreakpoint}
          />
        ))}
      </div>
    );

    const renderDefaultLayout = () => (
      <div className="">
        {Object.values(sections).map((section: any) => (
          <FlexibleSection
            key={section.id}
            section={section}
            formData={formData}
            formErrors={formErrors}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleClose={onClose || (() => {})}
            isOptinSubmitLoading={isOptinSubmitLoading}
            nodeType={node.type}
            handleQuizSubmit={handleQuizSubmit}
            overrideBreakpoint={overrideBreakpoint}
          />
        ))}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-white overflow-y-auto popup-container",
          isSplitLayout
            ? cn(
                "flex",
                // If overrideBreakpoint is set, use it directly
                overrideBreakpoint
                  ? overrideBreakpoint === "max-sm"
                    ? "flex-col"
                    : "flex-row"
                  : // Otherwise use breakpoints
                    "md:flex-row flex-col"
              )
            : "",
          isStackedLayout ? "flex flex-col" : "",
          className
        )}
        style={{
          ...containerStyles,
          ...backgroundStyles,
          borderRadius: overlayConfig.border_radius || "8px",
          boxShadow:
            overlayConfig.box_shadow ||
            `0px 1px 0px 0px rgba(255, 255, 255, 0.50) inset, 0px 4px 4px -1px rgba(0, 0, 0, 0.25), 0px 3px 8px -2px rgba(0, 0, 0, 0.20), 0px 8px 12px -3px rgba(0, 0, 0, 0.15), 0px 16px 20px -4px rgba(0, 0, 0, 0.10)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <Header
            onClose={onClose}
            closeIconPosition={closeButtonConfig.position}
            iconColor={closeButtonConfig.color}
            delay={closeButtonConfig.delay}
            fadeStyle={{
              opacity: closeButtonConfig.opacity || 0.5,
              transition: "opacity 0.5s ease-in-out",
            }}
          />
        )}

        {isSplitLayout && renderSplitLayout()}
        {isStackedLayout && sections && renderStackedLayout()}
        {!isSplitLayout &&
          !isStackedLayout &&
          sections &&
          renderDefaultLayout()}
      </div>
    );
  }
);

PopupContent.displayName = "PopupContent";

export default PopupContent;