'use client'

import React from "react";
import { cn } from "@/lib/utils";
import { useResponsiveStyles } from "@/hooks/use-responsive-styles";
import type { 
  FlexibleComponentProps,
  ButtonProperties,
  QuizOptionProperties,
  TextProperties,
  ImageProperties,
  InputProperties,
} from "@/types/ui";

/**
 * Renders a UI component based on its type and properties
 */
export const FlexibleComponent = ({
  component,
  formData,
  setFormData,
  formErrors,
  handleSubmit,
  handleClose,
  isOptinSubmitLoading,
  nodeType,
  handleQuizSubmit,
  overrideBreakpoint,
}: FlexibleComponentProps) => {
  const { id, type, styles, properties, visible } = component;

  const responsiveStyles = useResponsiveStyles(styles, overrideBreakpoint);

  if (!visible) return null;

  // Helper function to determine the submit type based on node type and button action
  const getSubmitType = () => {
    if (nodeType === "discount") {
      if ((properties as ButtonProperties).action === "primary_submit") {
        return "discount_primary";
      } else if (
        (properties as ButtonProperties).action === "secondary_submit"
      ) {
        return "discount_secondary";
      }
    }
    return "default";
  };

  // Check if the action is a submit action
  const isSubmitAction = [
    "submit",
    "primary_submit",
    "secondary_submit",
  ].includes((properties as ButtonProperties).action || "");

  // Get the submit type if it's a submit action
  const submitType = getSubmitType();

  // Handle click based on action type
  const handleActionClick = (e: React.MouseEvent<Element>) => {
    if (isSubmitAction) {
      handleSubmit(e, submitType);
    } else if ((properties as ButtonProperties).action === "close") {
      handleClose();
    }
  };

  const handleQuizOptionClick = () => {
    if (
      (properties as QuizOptionProperties).field_type === "quiz" &&
      handleQuizSubmit
    ) {
      handleQuizSubmit((properties as QuizOptionProperties).content || "");
    }
  };

  switch (type) {
    case "text":
      return (
        <div
          id={id}
          data-component-id={id}
          style={responsiveStyles}
          className={cn(
            "text-base",
            (properties as TextProperties)?.font &&
              `${(properties as TextProperties).font}`,
            (properties as ButtonProperties)?.action && "cursor-pointer"
          )}
          onClick={(properties as any).action ? handleActionClick : undefined}
        >
          {(properties as TextProperties).content}
        </div>
      );

    case "image":
      return (
        <img
          id={id}
          data-component-id={id}
          src={(properties as ImageProperties).src}
          alt={(properties as ImageProperties).alt || ""}
          style={responsiveStyles}
        />
      );

    case "button":
      return (
        <button
          id={id}
          data-component-id={id}
          style={responsiveStyles}
          className={cn(
            "outline-none border-none",
            (properties as ButtonProperties)?.font &&
              `${(properties as ButtonProperties).font}`
          )}
          type={isSubmitAction ? "submit" : "button"}
          onClick={
            (properties as ButtonProperties).action
              ? handleActionClick
              : undefined
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && (properties as ButtonProperties).action) {
              handleActionClick(e as any);
            }
          }}
        >
          {isOptinSubmitLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Loading...
            </div>
          ) : (
            (properties as ButtonProperties).content
          )}
        </button>
      );

    case "input":
      return (
        <>
          <input
            id={id}
            data-component-id={id}
            type={(properties as InputProperties).input_type || "text"}
            placeholder={(properties as InputProperties).placeholder || ""}
            required={(properties as InputProperties).required || false}
            style={responsiveStyles}
            className={cn(
              "outline-none",
              (properties as InputProperties)?.font &&
                `${(properties as InputProperties).font}`,
              formErrors && formErrors[id] && "border-red-500"
            )}
            value={formData[id] || ""}
            onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e, "default");
              }
            }}
            name={(properties as InputProperties).name || id}
            data-field-type={
              (properties as InputProperties).field_type ||
              (properties as InputProperties).input_type ||
              "text"
            }
          />
          {formErrors && formErrors[id] && (
            <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px' }}>
              {formErrors[id]}
            </div>
          )}
        </>
      );

    case "quiz_option":
      return (
        <button
          id={id}
          data-component-id={id}
          style={responsiveStyles}
          className={cn(
            "secondary-font w-full text-center font-medium hover:opacity-90 transition-opacity active:scale-95 relative",
            isOptinSubmitLoading ? "cursor-not-allowed opacity-80" : "",
            (properties as QuizOptionProperties)?.font &&
              `${(properties as QuizOptionProperties).font}`
          )}
          onClick={handleQuizOptionClick}
          disabled={isOptinSubmitLoading}
        >
          {isOptinSubmitLoading ? (
            <div className="flex items-center justify-center gap-2">
              Loading...
            </div>
          ) : (
            (properties as QuizOptionProperties).content
          )}
        </button>
      );

    case "discount_display":
      return (
        <div
          id={id}
          data-component-id={id}
          style={responsiveStyles}
          className="bg-gray-50 p-4 border border-gray-200 rounded text-center"
        >
          <span className="font-mono text-lg font-bold block">
            {(properties as any).code}
          </span>
          <p className="text-gray-600 mt-2">
            {(properties as any).description}
          </p>
        </div>
      );

    case "divider":
      return (
        <hr
          id={id}
          data-component-id={id}
          style={responsiveStyles}
          className="my-4 border-t border-gray-200"
        />
      );

    case "spacer":
      return <div id={id} data-component-id={id} style={responsiveStyles} className="h-6" />;

    case "custom":
      // Handle custom components
      return (
        <div
          id={id}
          data-component-id={id}
          style={responsiveStyles}
          dangerouslySetInnerHTML={{ __html: (properties as any).html }}
        />
      );

    default:
      return <div data-component-id={id}>Unknown component type: {type}</div>;
  }
};