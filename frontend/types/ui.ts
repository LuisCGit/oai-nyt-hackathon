// UI Types for Flexible Popup System
export type Device = 'desktop' | 'mobile'

// Breakpoint enum
export enum Breakpoint {
  DEFAULT = "default",
  MAX_SM = "max-sm",
  MAX_MD = "max-md",
  MAX_LG = "max-lg",
  MAX_XL = "max-xl",
  MAX_2XL = "max-2xl",
}

// ComponentType enum
export enum ComponentType {
  TEXT = "text",
  IMAGE = "image",
  BUTTON = "button",
  QUIZ_OPTION = "quiz_option",
  INPUT = "input",
  PRODUCT_CARD = "product_card",
  DISCOUNT_DISPLAY = "discount_display",
  DIVIDER = "divider",
  SPACER = "spacer",
  CUSTOM = "custom",
}

// Properties interfaces
export interface ImageProperties {
  src?: string;
  alt?: string;
}

export interface TextProperties {
  content?: string;
  font?: string;
  action?: string; // close
}

export interface InputProperties {
  input_type?: string; // email, name, phone, quiz
  placeholder?: string;
  required?: boolean;
  field_type?: string;
  name?: string;
  font?: string;
}

export interface ButtonProperties {
  content?: string;
  action?: string; // submit
  font?: string;
}

export interface QuizOptionProperties {
  action?: string; // submit
  content?: string; // text for the option
  field_type?: string; // quiz
  font?: string;
}

export type ComponentProperties =
  | ImageProperties
  | TextProperties
  | InputProperties
  | ButtonProperties
  | QuizOptionProperties
  | Record<string, any>;

// Component interface
export interface Component {
  id: string;
  type: ComponentType | string;
  styles?: {
    [key in Breakpoint]?: Record<string, any>;
  };
  properties: ComponentProperties;
  visible: boolean;
}

// Section interface
export interface Section {
  id: string;
  name: string;
  components: Component[];
  styles?: {
    [key in Breakpoint]?: Record<string, any>;
  };
  layout?: string; // vertical, horizontal, grid
}

// ViewportConfig interface
export interface ViewportConfig {
  width: string;
  height: string;
}

// PopupOverlayConfig interface
export interface PopupOverlayConfig {
  background_color?: string;
  backdrop_filter?: string;
  box_shadow?: string;
  border_radius?: string;
}

// PopupCloseButtonConfig interface
export interface PopupCloseButtonConfig {
  position?: string;
  color?: string;
  size?: string;
  delay?: number;
  opacity?: number;
}

// GradientStop interface
export interface GradientStop {
  position: number; // Percentage (0-100)
  color: string; // CSS color value
}

// GradientConfig interface
export interface GradientConfig {
  type?: string; // linear or radial
  direction?: string; // CSS gradient direction
  stops?: GradientStop[];
}

// PopupConfig interface
export interface PopupConfig {
  responsive?: {
    [key in Breakpoint]?: ViewportConfig;
  };
  overlay?: PopupOverlayConfig;
  close_button?: PopupCloseButtonConfig;
  gradient?: GradientConfig;
}

// SplitLayoutConfig interface
export interface SplitLayoutConfig {
  split_ratio?: string;
  mobile_stack_direction?: string;
  popup_config?: PopupConfig;
}

// LayoutConfig interface
export interface LayoutConfig {
  type: string; // standard, split, etc.
  slot_mapping?: Record<string, string>; // Maps section_id to slot name
  custom_properties?: SplitLayoutConfig | Record<string, any>; // Custom properties
}

// FlexibleContent interface
export interface FlexibleContent {
  layout: LayoutConfig;
  sections: Record<string, Section>;
  metadata?: Record<string, any>;
}

// Props interfaces
export interface PopupHeaderProps {
  onClose: () => void;
  closeIconPosition?: string;
  iconColor?: string;
  delay?: number;
  fadeStyle?: {
    opacity: number;
    transition: string;
    [key: string]: any;
  };
}

export interface FlexibleSectionProps {
  section: Section;
  formData: Record<string, string>;
  setFormData: any;
  formErrors: Record<string, string>;
  handleSubmit: (e: React.FormEvent | null, submitType?: string) => void;
  handleClose: () => void;
  isOptinSubmitLoading?: boolean;
  nodeType: string;
  handleQuizSubmit: (answer: string) => void;
  overrideBreakpoint?: Breakpoint;
}

export interface FlexibleComponentProps {
  component: Component;
  formData: Record<string, string>;
  setFormData: any;
  formErrors: Record<string, string>;
  handleSubmit: (e: React.FormEvent | null, submitType?: string) => void;
  handleClose: () => void;
  isOptinSubmitLoading?: boolean;
  nodeType: string;
  handleQuizSubmit: (answer: string) => void;
  overrideBreakpoint?: Breakpoint;
}