from typing import Any, Literal, Union
from enum import Enum

from pydantic import BaseModel, Field


# ------ UI Components ------
class ComponentType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    BUTTON = "button"
    QUIZ_OPTION = "quiz_option"
    INPUT = "input"
    PRODUCT_CARD = "product_card"
    DISCOUNT_DISPLAY = "discount_display"
    DIVIDER = "divider"
    SPACER = "spacer"
    CUSTOM = "custom"


class ImageProperties(BaseModel):
    """Properties for image components"""

    src: str | None = None
    alt: str | None = None


class TextProperties(BaseModel):
    """Properties for text components"""

    content: str | None = None
    font: str | None = None
    action: str | None = None  # close


class InputProperties(BaseModel):
    """Properties for input components"""

    input_type: str | None = None  # email, name, phone, quiz
    placeholder: str | None = None
    required: bool = False
    font: str | None = None


class ButtonProperties(BaseModel):
    """Properties for button components"""

    content: str | None = None
    action: str | None = None  # submit
    font: str | None = None


class QuizOptionProperties(BaseModel):
    """Properties for quiz option components"""

    action: str | None = None  # submit
    content: str | None = None  # text for the option
    field_type: str | None = None  # quiz
    font: str | None = None


class Breakpoint(str, Enum):
    """Standard responsive breakpoints"""

    DEFAULT = "default"  # Default/base styles
    MAX_SM = "max-sm"  # @media (width < 40rem)
    MAX_MD = "max-md"  # @media (width < 48rem)
    MAX_LG = "max-lg"  # @media (width < 64rem)
    MAX_XL = "max-xl"  # @media (width < 80rem)
    MAX_2XL = "max-2xl"  # @media (width < 96rem)


# ------ UI Sections ------
class Component(BaseModel):
    """Base model for UI components"""

    id: str
    type: ComponentType
    styles: dict[Breakpoint, dict[str, Any]] = Field(
        default_factory=lambda: {
            Breakpoint.DEFAULT: {},  # Default/base styles
            Breakpoint.MAX_SM: {},  # Small devices
            Breakpoint.MAX_MD: {},  # Medium devices
            Breakpoint.MAX_LG: {},  # Large devices
            Breakpoint.MAX_XL: {},  # Extra large devices
            Breakpoint.MAX_2XL: {},  # 2XL devices
        }
    )
    properties: Union[ImageProperties, TextProperties, InputProperties, ButtonProperties, QuizOptionProperties] = {}
    visible: bool = True  # Make sure this is set to true to make


class Section(BaseModel):
    """A section containing components"""

    id: str
    name: str
    components: list[Component]
    styles: dict[Breakpoint, dict[str, Any]] = Field(
        default_factory=lambda: {
            Breakpoint.DEFAULT: {},  # Default/base styles
            Breakpoint.MAX_SM: {},  # Small devices
            Breakpoint.MAX_MD: {},  # Medium devices
            Breakpoint.MAX_LG: {},  # Large devices
            Breakpoint.MAX_XL: {},  # Extra large devices
            Breakpoint.MAX_2XL: {},  # 2XL devices
        }
    )
    layout: str = "vertical"  # vertical, horizontal, grid


# ------ UI Layouts ------


class ViewportConfig(BaseModel):
    """Configuration for a specific viewport size"""

    width: str = "80%"
    height: str = "70dvh"


class PopupOverlayConfig(BaseModel):
    """Configuration for popup overlay"""

    background_color: str = "rgba(0,0,0,0.6)"
    backdrop_filter: str = "blur(3px)"
    box_shadow: str = "0 0 10px 0 rgba(0,0,0,0.3)"
    border_radius: str = "8px"


class PopupCloseButtonConfig(BaseModel):
    """Configuration for popup close button"""

    position: str = "right"
    color: str = "#333333"
    size: str = "24px"
    delay: int = 1000
    opacity: float = 0.5


class GradientStop(BaseModel):
    """Configuration for a gradient color stop"""

    position: int  # Percentage (0-100)
    color: str  # CSS color value


class GradientConfig(BaseModel):
    """Configuration for gradient background"""

    type: str = "linear"  # linear or radial
    direction: str = "to bottom"  # CSS gradient direction
    stops: list[GradientStop] = []


class PopupConfig(BaseModel):
    """Configuration for popup container with responsive breakpoints"""

    responsive: dict[Breakpoint, ViewportConfig] = Field(
        default_factory=lambda: {
            # Default configuration (fallback)
            Breakpoint.DEFAULT: ViewportConfig(width="88%", height="70dvh"),
            # Small devices (phones)
            Breakpoint.MAX_SM: ViewportConfig(width="88%", height="70dvh"),
            # Medium devices (tablets)
            Breakpoint.MAX_MD: ViewportConfig(width="55%", height="40dvh"),
            # Large devices (laptops)
            Breakpoint.MAX_LG: ViewportConfig(width="65%", height="50dvh"),
            # Extra large devices (desktops)
            Breakpoint.MAX_XL: ViewportConfig(width="60%", height="50dvh"),
            # 2XL devices (large desktops)
            Breakpoint.MAX_2XL: ViewportConfig(width="45%", height="50dvh"),
        }
    )
    overlay: PopupOverlayConfig = PopupOverlayConfig()
    close_button: PopupCloseButtonConfig = PopupCloseButtonConfig()
    gradient: GradientConfig | None = None


class SplitLayoutConfig(BaseModel):
    """Configuration specific to split layout"""

    split_ratio: str = "50/50"
    mobile_stack_direction: str = "right_first"
    popup_config: PopupConfig = PopupConfig()


# Update the LayoutConfig to use typed custom properties for specific layouts
class LayoutConfig(BaseModel):
    """Defines how sections are arranged"""

    type: Literal["split", "stacked"] = "split"
    slot_mapping: dict[str, str] = {}  # Maps section_id to slot name
    custom_properties: dict[str, Any] = {}  # Generic custom properties

    # Helper method to get typed custom properties for specific layouts
    def get_split_config(self) -> SplitLayoutConfig:
        """Get typed configuration for split layout"""
        if self.type != "split":
            raise ValueError("This layout is not a split layout")

        # If custom_properties contains a properly structured dict, convert it
        if isinstance(self.custom_properties, dict):
            return SplitLayoutConfig(**self.custom_properties)

        # Return default config if no custom properties
        return SplitLayoutConfig()


class FlexibleContent(BaseModel):
    """Flexible content structure for a node"""

    layout: LayoutConfig
    sections: dict[str, Section]
    metadata: dict[str, Any] = {}
