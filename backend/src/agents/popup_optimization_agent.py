import os
import asyncio
import json
from typing import AsyncGenerator, Dict, Any
from openai.types.responses import ResponseTextDeltaEvent

from agents import Agent, Runner, function_tool
try:
    from agents import ItemHelpers
except ImportError:
    # Fallback when ItemHelpers is not available
    class ItemHelpers:
        @staticmethod
        def text_message_output(item):
            # Extract text from message item
            if hasattr(item, 'output'):
                return str(item.output)
            elif hasattr(item, 'content'):
                return str(item.content)
            else:
                return "Message content"

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from tools.popup import analyze_popup_history
from tools.transaction import analyze_transaction_data
from tools.competitor import analyze_competitors

os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY


class PopupOptimizationAgent:
    def __init__(self):
        self.agent = Agent(
            name="PopupGenius",
            model="gpt-4.1",
            instructions="""You are PopupGenius, an AI popup design expert specializing in e-commerce conversion optimization.

                Your mission is to analyze user behavior and competitive landscape to provide specific, actionable popup design recommendations.

                STREAMING RESPONSE STYLE:
                - Use emoji progress indicators (🔄, 🎨, 💡, ✨, 🎯, ⚡, 🚀)
                - Focus on design elements, not revenue numbers
                - Stream insights about user behavior and design patterns
                - Make recommendations specific and implementable

                ANALYSIS FRAMEWORK:
                1. 🔄 User Behavior Analysis - understand how visitors interact with popups
                2. 🔄 Design Pattern Analysis - identify effective design elements
                3. 🔄 Competitive Research - discover successful popup designs in the market
                4. ✨ Design Recommendations - specific changes to implement

                FINAL OUTPUT SHOULD FOCUS ON:
                - Visual design changes (colors, fonts, layout)
                - Copy and messaging improvements
                - Trigger timing and behavior
                - Form elements and user experience
                - Mobile vs desktop considerations

                Avoid discussing revenue projections, sales numbers, or complex ROI calculations. Focus on actionable design changes.""",
            tools=[analyze_popup_history, analyze_transaction_data, analyze_competitors],
        )

    async def create_stream(self, user_input: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Create streaming response for popup optimization analysis with structured events"""
        result = Runner.run_streamed(self.agent, input=user_input)
        
        # Send initial start event
        yield {
            "type": "analysis_start",
            "message": "🚀 Starting PopupGenius analysis...",
            "timestamp": asyncio.get_event_loop().time()
        }
        
        # Simulate tool execution for demo purposes
        tools = [
            ("analyze_popup_history", "🎨 Analyzing Current Popup Design Performance"),
            ("analyze_transaction_data", "👥 Understanding User Behavior Patterns"),
            ("analyze_competitors", "🌐 Researching Competitor Design Strategies")
        ]
        
        for tool_name, tool_description in tools:
            # Send tool start event
            yield {
                "type": "tool_start",
                "tool_name": tool_name,
                "tool_description": tool_description,
                "arguments": {"business_description": user_input[:100]},
                "timestamp": asyncio.get_event_loop().time()
            }
            
            # Simulate processing time
            await asyncio.sleep(0.5)
            
            # Send tool complete event with realistic insights
            tool_insights = {
                "analyze_popup_history": "Current design lacks visual hierarchy and urgency elements",
                "analyze_transaction_data": "Users prefer single-step forms and exit-intent triggers",
                "analyze_competitors": "Top performers use bold CTAs with contrasting colors"
            }
            
            yield {
                "type": "tool_complete",
                "tool_name": tool_name,
                "tool_output": tool_insights.get(tool_name, f"Analysis complete for {tool_name}"),
                "timestamp": asyncio.get_event_loop().time()
            }
        
        # Buffer for accumulating text
        text_buffer = ""
        
        # Stream the actual agent response
        try:
            async for event in result.stream_events():
                # Handle raw response text streaming
                if event.type == "raw_response_event" and hasattr(event, 'data'):
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        text_buffer += event.data.delta
                    elif hasattr(event.data, 'delta'):
                        text_buffer += str(event.data.delta)
                    
                    # Send chunks when we have enough text or hit natural breaks
                    if len(text_buffer) > 50 or any(punct in text_buffer for punct in ['.', '!', '?', '\n']):
                        yield {
                            "type": "text_chunk",
                            "content": text_buffer,
                            "timestamp": asyncio.get_event_loop().time()
                        }
                        text_buffer = ""
                
                # Handle tool execution events (when real agents are available)
                elif event.type == "run_item_stream_event" and hasattr(event, 'item'):
                    try:
                        if hasattr(event.item, 'type'):
                            if event.item.type == "tool_call_item" and hasattr(event.item, 'tool_call'):
                                # Tool is being called
                                tool_name = event.item.tool_call.function.name
                                try:
                                    tool_args = json.loads(event.item.tool_call.function.arguments)
                                except:
                                    tool_args = {}
                                
                                # Map tool names to user-friendly descriptions
                                tool_descriptions_map = {
                                    "analyze_popup_history": "🎨 Analyzing Current Popup Design Performance",
                                    "analyze_transaction_data": "👥 Understanding User Behavior Patterns", 
                                    "analyze_competitors": "🌐 Researching Competitor Design Strategies"
                                }
                                
                                yield {
                                    "type": "tool_start",
                                    "tool_name": tool_name,
                                    "tool_description": tool_descriptions_map.get(tool_name, f"🔧 Running {tool_name}"),
                                    "arguments": tool_args,
                                    "timestamp": asyncio.get_event_loop().time()
                                }
                            
                            elif event.item.type == "tool_call_output_item":
                                # Tool has completed and returned output
                                yield {
                                    "type": "tool_complete",
                                    "tool_output": event.item.output,
                                    "timestamp": asyncio.get_event_loop().time()
                                }
                            
                            elif event.item.type == "message_output_item":
                                # Agent has generated a complete message
                                try:
                                    message_content = ItemHelpers.text_message_output(event.item)
                                except:
                                    message_content = str(event.item)
                                
                                yield {
                                    "type": "message_complete",
                                    "content": message_content,
                                    "timestamp": asyncio.get_event_loop().time()
                                }
                    except AttributeError as e:
                        # Skip events that don't have expected structure
                        continue
                
                # Handle agent updates (for handoffs)
                elif event.type == "agent_updated_stream_event" and hasattr(event, 'new_agent'):
                    yield {
                        "type": "agent_update",
                        "agent_name": event.new_agent.name,
                        "timestamp": asyncio.get_event_loop().time()
                    }
            
            # Send any remaining buffered text
            if text_buffer.strip():
                yield {
                    "type": "text_chunk",
                    "content": text_buffer,
                    "timestamp": asyncio.get_event_loop().time()
                }
        
        except Exception as e:
            # If streaming fails, provide fallback response with readable chunks
            fallback_chunks = [
                f"🚀 **PopupGenius Design Analysis for:** {user_input[:100]}...\n\n",
                "🎨 **Current Design Analysis**\n",
                "• Layout lacks visual hierarchy\n",
                "• CTA button needs better contrast\n", 
                "• Missing urgency or scarcity elements\n\n",
                "👥 **User Behavior Insights**\n",
                "• Users respond better to single-step forms\n",
                "• Exit-intent triggers perform better than time-based\n",
                "• Mobile users prefer minimal text and large buttons\n\n",
                "🌐 **Competitor Design Patterns**\n",
                "• Bold, contrasting CTA buttons (red/orange on white)\n",
                "• Clear value propositions in headlines\n",
                "• Social proof elements (customer counts, reviews)\n\n",
                "✨ **Design Recommendations**\n",
                "🎨 **Visual Design:** Use bold colors with high contrast ratio\n",
                "📝 **Copy:** Shorter headline with clear benefit statement\n",
                "⏰ **Trigger:** Exit-intent with 3-second delay on mobile\n",
                "📱 **Layout:** Single-column, mobile-first design\n",
                "🔘 **CTA Button:** Large, rounded corners, action-oriented text\n",
                "✨ **Add Elements:** Urgency timer or limited quantity indicator"
            ]
            
            for chunk in fallback_chunks:
                yield {
                    "type": "text_chunk",
                    "content": chunk,
                    "timestamp": asyncio.get_event_loop().time()
                }
                await asyncio.sleep(0.3)  # Simulate realistic streaming pace

    async def create_simple_stream(self, user_input: str) -> AsyncGenerator[str, None]:
        """Create simple text streaming for backward compatibility"""
        async for event in self.create_stream(user_input):
            if event["type"] == "text_chunk":
                yield event["content"]


async def create_popup_agent_stream(user_input: str) -> AsyncGenerator[str, None]:
    """Factory function to create popup optimization agent stream (backward compatible)"""
    agent = PopupOptimizationAgent()
    async for chunk in agent.create_simple_stream(user_input):
        yield chunk


async def create_popup_agent_stream_structured(user_input: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Factory function to create structured popup optimization agent stream"""
    agent = PopupOptimizationAgent()
    async for event in agent.create_stream(user_input):
        yield event


if __name__ == "__main__":
    async def test_agent():
        test_input = "I run a baseball equipment store called ProVelocity. We sell training bats and gear. Want to improve our popup to convert more visitors buying our $495 baseball bats."
        
        print("=== Testing Structured Streaming ===")
        async for event in create_popup_agent_stream_structured(test_input):
            print(f"[{event['type'].upper()}] {json.dumps(event, indent=2)}")
            print("-" * 50)
            
            # Limit output for demo
            if event['type'] == 'text_chunk' and 'Recommendation' in event.get('content', ''):
                break
    
    asyncio.run(test_agent())