import os
import json
import re
from typing import Dict, Any
from openai import OpenAI

from src.config import settings


def modify_popup_configuration(
    instructions: str, current_config: Dict[str, Any], ui_schema_content: str
) -> Dict[str, Any]:
    """
    Uses OpenAI's responses API to modify popup configuration based on instructions.

    Args:
        instructions: Natural language instructions for modifications
        current_config: Current popup configuration as a dictionary
        ui_schema_content: Content of the ui.py file as text

    Returns:
        Modified popup configuration as a dictionary
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    prompt = f"""You are an expert UI/UX designer and developer specializing in popup optimization. 
Your task is to modify popup configurations based on natural language instructions.

You will be given:
1. Natural language instructions for modifications
2. The current popup configuration (JSON)
3. The UI schema definitions (Python Pydantic models)

Your job is to:
- Understand the modification request
- Apply the changes to the popup configuration
- Return a valid JSON configuration that follows the schema
- Make intelligent design decisions that improve conversion rates
- Ensure all modifications are technically feasible

UI Schema Reference:
{ui_schema_content}

Guidelines:
- Always maintain the existing structure unless explicitly asked to change it
- Use appropriate CSS properties for styling (colors, fonts, spacing, etc.)
- Consider responsive design (different breakpoints: default, max-sm, max-md, max-lg, max-xl, max-2xl)
- For colors, use valid CSS color values (hex, rgb, rgba, named colors)
- For fonts, use web-safe font families or common system fonts
- For spacing, use consistent units (px, rem, %, etc.)
- Keep component IDs stable unless renaming is specifically requested
- Ensure visibility is set to true for components that should be shown

Response format:
Return ONLY a valid JSON object that represents the modified popup configuration. 
Do not include any explanations, markdown formatting, or additional text.

Please modify the following popup configuration based on these instructions:

Instructions: {instructions}

Current Configuration:
{json.dumps(current_config, indent=2)}

Return the modified configuration as JSON."""

    try:
        # Use the responses API
        response = client.responses.create(
            model="o4-mini",
            input=prompt,
        )

        # Extract the response content
        print(f"response: {response}")

        # Find the output message in the response
        output_message = None
        for output_item in response.output:
            if hasattr(output_item, "content") and output_item.content:
                output_message = output_item
                break

        if output_message and output_message.content:
            response_content = output_message.content[0].text
        else:
            raise ValueError("No content found in response")

        # Parse the JSON response
        try:
            modified_config = json.loads(response_content)
            return modified_config
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract JSON from the response
            # Sometimes the model might include extra text
            json_match = re.search(r"\{.*\}", response_content, re.DOTALL)
            if json_match:
                modified_config = json.loads(json_match.group())
                return modified_config
            else:
                raise ValueError(f"Failed to parse JSON response: {e}")

    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        # Return original config if there's an error
        return current_config


def load_ui_schema() -> str:
    """Load the UI schema content from the ui.py file"""
    try:
        ui_file_path = os.path.join(os.path.dirname(__file__), "..", "ui.py")
        with open(ui_file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error loading UI schema: {e}")
        return ""


# Example usage
if __name__ == "__main__":
    # Example current configuration (simplified)
    with open(
        "/Users/luiscosta/Desktop/tutto/cluster/repos/oai-nyt-hackathon/frontend/data/sample-flexible-content.json",
        "r",
        encoding="utf-8",
    ) as f:
        example_config = json.load(f)

    # Example instructions
    instructions = "Change the heading text to 'Special Offer!' and make it red color"

    # Load UI schema
    ui_schema = load_ui_schema()

    # Test the modification
    modified = modify_popup_configuration(instructions, example_config, ui_schema)

    # Print the differences between original and modified config
    import difflib

    original_json = json.dumps(example_config, indent=2, sort_keys=True)
    modified_json = json.dumps(modified, indent=2, sort_keys=True)

    diff = difflib.unified_diff(
        original_json.splitlines(keepends=True),
        modified_json.splitlines(keepends=True),
        fromfile="original_config",
        tofile="modified_config",
        lineterm="",
    )

    print("Differences between original and modified config:")
    print("".join(diff))
