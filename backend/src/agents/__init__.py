# Mock agents module for PopupGenius
# Provides compatibility when openai-agents is not available

def function_tool(func):
    """
    Mock function_tool decorator that preserves function functionality
    without OpenAI agents dependency
    """
    return func

# Placeholder for when openai-agents is available
try:
    from openai import OpenAI
    from agents import Agent, Runner
    OPENAI_AGENTS_AVAILABLE = True
except ImportError:
    OPENAI_AGENTS_AVAILABLE = False
    
    # Mock classes for when not available
    class Agent:
        def __init__(self, **kwargs):
            self.name = kwargs.get('name', 'MockAgent')
            self.instructions = kwargs.get('instructions', '')
            self.tools = kwargs.get('tools', [])
            self.model = kwargs.get('model', 'mock')
    
    class Runner:
        @staticmethod
        def run_streamed(agent, input):
            # Mock streaming response
            class MockResult:
                async def stream_events(self):
                    # Yield mock streaming events
                    class MockEvent:
                        type = "raw_response_event"
                        class MockData:
                            delta = f"Mock response for: {input}"
                        data = MockData()
                    
                    yield MockEvent()
            
            return MockResult()

__all__ = ['function_tool', 'Agent', 'Runner', 'OPENAI_AGENTS_AVAILABLE']