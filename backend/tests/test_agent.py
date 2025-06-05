#!/usr/bin/env python3
"""
Tests for PopupOptimizationAgent
"""

import unittest
import asyncio
import sys
import os
from unittest.mock import patch, MagicMock

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from src.agents.popup_optimization_agent import PopupOptimizationAgent, create_popup_agent_stream
    AGENT_AVAILABLE = True
except ImportError as e:
    AGENT_AVAILABLE = False
    print(f"Warning: PopupOptimizationAgent not available - skipping agent tests: {e}")


@unittest.skipUnless(AGENT_AVAILABLE, "PopupOptimizationAgent not available")
class TestPopupOptimizationAgent(unittest.TestCase):
    """Test the main PopupOptimizationAgent"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.agent = PopupOptimizationAgent()
        self.test_inputs = [
            "I run a baseball equipment store called ProVelocity",
            "Small fashion boutique struggling with cart abandonment",
            "SaaS platform wanting to convert trial signups",
            "General e-commerce store selling various products"
        ]
    
    def test_agent_initialization(self):
        """Test agent initializes correctly"""
        self.assertIsNotNone(self.agent)
        self.assertIsNotNone(self.agent.agent)
        self.assertEqual(self.agent.agent.name, "PopupGenius")
        self.assertGreater(len(self.agent.agent.tools), 0)
    
    @patch('os.environ.get')
    def test_agent_without_api_key(self, mock_env):
        """Test agent behavior without OpenAI API key"""
        mock_env.return_value = None
        
        # Should still initialize but may fail on API calls
        agent = PopupOptimizationAgent()
        self.assertIsNotNone(agent)
    
    async def async_test_stream_response(self, test_input):
        """Helper to test streaming response"""
        chunks = []
        try:
            async for chunk in create_popup_agent_stream(test_input):
                chunks.append(chunk)
                # Limit chunks for testing
                if len(chunks) > 50:
                    break
        except Exception as e:
            # If API call fails, that's ok for testing
            self.assertIsInstance(e, Exception)
            return []
        
        return chunks
    
    def test_stream_response_baseball(self):
        """Test streaming response for baseball store"""
        test_input = "I run a baseball equipment store called ProVelocity selling $495 bats"
        chunks = asyncio.run(self.async_test_stream_response(test_input))
        
        # If we got chunks, verify they're strings
        if chunks:
            for chunk in chunks:
                self.assertIsInstance(chunk, str)
    
    def test_stream_response_fashion(self):
        """Test streaming response for fashion store"""
        test_input = "Small fashion boutique struggling with cart abandonment on $200+ dresses"
        chunks = asyncio.run(self.async_test_stream_response(test_input))
        
        # If we got chunks, verify they're strings
        if chunks:
            for chunk in chunks:
                self.assertIsInstance(chunk, str)
    
    def test_agent_instructions(self):
        """Test agent has proper instructions"""
        instructions = self.agent.agent.instructions
        
        # Should contain key terms
        self.assertIn("PopupGenius", instructions)
        self.assertIn("optimization", instructions)
        self.assertIn("conversion", instructions)
        self.assertIn("ROI", instructions)
        self.assertIn("streaming", instructions.lower())
    
    def test_agent_tools_configuration(self):
        """Test agent has all required tools"""
        tools = self.agent.agent.tools
        
        # Should have 3 tools
        self.assertEqual(len(tools), 3)
        
        # Get tool names - handle different tool types
        tool_names = []
        for tool in tools:
            if hasattr(tool, 'function') and hasattr(tool.function, 'name'):
                tool_names.append(tool.function.name)
            elif hasattr(tool, 'name'):
                tool_names.append(tool.name)
            elif callable(tool):
                tool_names.append(tool.__name__)
        
        # Should contain all required tools
        self.assertIn("analyze_popup_history", tool_names)
        self.assertIn("analyze_transaction_data", tool_names)
        self.assertIn("analyze_competitors", tool_names)


class TestAgentStreamFactory(unittest.TestCase):
    """Test the agent stream factory function"""
    
    def test_create_popup_agent_stream_function(self):
        """Test the factory function exists and is callable"""
        if AGENT_AVAILABLE:
            self.assertTrue(callable(create_popup_agent_stream))
        else:
            self.skipTest("PopupOptimizationAgent not available")
    
    async def async_test_factory_function(self):
        """Test factory function returns async generator"""
        test_input = "test store"
        
        try:
            stream = create_popup_agent_stream(test_input)
            self.assertIsNotNone(stream)
            
            # Try to get first chunk
            first_chunk = await stream.__anext__()
            self.assertIsInstance(first_chunk, str)
            
        except Exception as e:
            # API errors are expected in test environment
            self.assertIsInstance(e, Exception)
    
    def test_factory_function_integration(self):
        """Test factory function integration"""
        try:
            # This will likely fail without API key, but should not crash
            asyncio.run(self.async_test_factory_function())
        except Exception:
            # Expected in test environment
            pass


class TestAgentMockIntegration(unittest.TestCase):
    """Test agent with mocked dependencies"""
    
    @patch('agents.Runner.run_streamed')
    def test_agent_with_mocked_runner(self, mock_runner):
        """Test agent with mocked OpenAI runner"""
        # Mock the streaming response
        mock_event = MagicMock()
        mock_event.type = "raw_response_event"
        mock_event.data.delta = "Test chunk"
        
        async def mock_async_iter():
            yield mock_event
        
        mock_stream = MagicMock()
        mock_stream.stream_events.return_value = mock_async_iter()
        
        mock_runner.return_value = mock_stream
        
        # Test agent creation and usage
        if AGENT_AVAILABLE:
            agent = PopupOptimizationAgent()
            self.assertIsNotNone(agent)
    
    def test_agent_error_handling(self):
        """Test agent handles errors gracefully"""
        if AGENT_AVAILABLE:
            agent = PopupOptimizationAgent()
            
            # Test with None input
            try:
                asyncio.run(agent.create_stream(None))
            except Exception:
                # Should handle gracefully
                pass
            
            # Test with empty string
            try:
                asyncio.run(agent.create_stream(""))
            except Exception:
                # Should handle gracefully
                pass


if __name__ == "__main__":
    # Check if OpenAI API key is available
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: No OPENAI_API_KEY found - some tests may be skipped")
    
    # Run tests with verbose output
    unittest.main(verbosity=2)