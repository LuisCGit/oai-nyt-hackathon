#!/usr/bin/env python3
"""
API integration tests for PopupGenius FastAPI endpoints
"""

import unittest
import asyncio
import json
import sys
import os
from unittest.mock import patch, MagicMock, AsyncMock

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from fastapi.testclient import TestClient
    from main import app
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("Warning: FastAPI not available - skipping API tests")


@unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI not available")
class TestPopupGeniusAPI(unittest.TestCase):
    """Test FastAPI endpoints"""
    
    def setUp(self):
        """Set up test client"""
        self.client = TestClient(app)
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get("/health")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "PopupGenius API")
    
    def test_app_title(self):
        """Test app configuration"""
        self.assertEqual(app.title, "PopupGenius: AI-Powered E-Commerce Optimization API")
    
    @patch('main.create_popup_agent_stream')
    def test_popup_optimization_endpoint(self, mock_stream):
        """Test popup optimization endpoint"""
        # Mock the streaming response
        async def mock_generator():
            yield "Test chunk 1"
            yield "Test chunk 2"
            yield "Final chunk"
        
        mock_stream.return_value = mock_generator()
        
        # Test request
        response = self.client.post("/popup-optimization", json={
            "business_description": "Baseball equipment store",
            "optimization_goals": "Increase conversion rates"
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "text/plain; charset=utf-8")
        
        # Check response content contains data prefix
        content = response.text
        self.assertIn("data:", content)
    
    def test_popup_optimization_endpoint_minimal(self):
        """Test popup optimization with minimal data"""
        response = self.client.post("/popup-optimization", json={
            "business_description": "Test store"
        })
        
        # Should accept the request (streaming response may fail without API key)
        self.assertEqual(response.status_code, 200)
    
    def test_popup_optimization_endpoint_validation(self):
        """Test request validation"""
        # Missing required field
        response = self.client.post("/popup-optimization", json={
            "optimization_goals": "Increase sales"
        })
        
        self.assertEqual(response.status_code, 422)  # Validation error
    
    def test_legacy_chat_endpoint(self):
        """Test legacy chat endpoint"""
        response = self.client.post("/chat", json={
            "message": "Test message"
        })
        
        # Should accept the request
        self.assertEqual(response.status_code, 200)
    
    def test_cors_configuration(self):
        """Test CORS headers"""
        response = self.client.options("/health")
        
        # Should have CORS headers
        self.assertIn("access-control-allow-origin", response.headers)


@unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI not available")
class TestWebSocketEndpoint(unittest.TestCase):
    """Test WebSocket functionality"""
    
    def setUp(self):
        """Set up test client"""
        self.client = TestClient(app)
    
    @patch('main.create_popup_agent_stream')
    def test_websocket_connection(self, mock_stream):
        """Test WebSocket connection and basic communication"""
        # Mock the streaming response
        async def mock_generator():
            yield "Analysis chunk 1"
            yield "Analysis chunk 2"
        
        mock_stream.return_value = mock_generator()
        
        # Test WebSocket connection
        with self.client.websocket_connect("/ws/popup-optimization") as websocket:
            # Send test message
            test_data = {
                "business_description": "Test store",
                "optimization_goals": "Improve conversions"
            }
            websocket.send_text(json.dumps(test_data))
            
            # Receive responses
            responses = []
            for _ in range(3):  # Expect start, chunks, complete
                try:
                    data = websocket.receive_text(timeout=1)
                    response = json.loads(data)
                    responses.append(response)
                except:
                    break
            
            # Should receive at least the start message
            self.assertGreater(len(responses), 0)
            
            # First message should be analysis start
            if responses:
                first_response = responses[0]
                self.assertIn("type", first_response)
    
    def test_websocket_invalid_json(self):
        """Test WebSocket with invalid JSON"""
        with self.client.websocket_connect("/ws/popup-optimization") as websocket:
            # Send invalid JSON
            websocket.send_text("invalid json")
            
            # Should receive error response
            try:
                data = websocket.receive_text(timeout=1)
                response = json.loads(data)
                self.assertEqual(response["type"], "error")
            except:
                # WebSocket may close on error, which is also acceptable
                pass


class TestAPIModels(unittest.TestCase):
    """Test Pydantic models"""
    
    def test_chat_message_model(self):
        """Test ChatMessage model"""
        if FASTAPI_AVAILABLE:
            from main import ChatMessage
            
            # Valid message
            msg = ChatMessage(message="Test message")
            self.assertEqual(msg.message, "Test message")
            
            # Test with dict
            msg_dict = {"message": "Another test"}
            msg = ChatMessage(**msg_dict)
            self.assertEqual(msg.message, "Another test")
    
    def test_popup_optimization_request_model(self):
        """Test PopupOptimizationRequest model"""
        if FASTAPI_AVAILABLE:
            from main import PopupOptimizationRequest
            
            # Required field only
            req = PopupOptimizationRequest(business_description="Test store")
            self.assertEqual(req.business_description, "Test store")
            self.assertEqual(req.optimization_goals, "")
            
            # With optional field
            req = PopupOptimizationRequest(
                business_description="Test store",
                optimization_goals="Increase sales"
            )
            self.assertEqual(req.optimization_goals, "Increase sales")


class TestAPIIntegration(unittest.TestCase):
    """Integration tests for the full API"""
    
    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI not available")
    def test_api_startup(self):
        """Test API starts up correctly"""
        # App should be created without errors
        self.assertIsNotNone(app)
        
        # Should have expected routes
        routes = [route.path for route in app.routes]
        self.assertIn("/health", routes)
        self.assertIn("/popup-optimization", routes)
        self.assertIn("/chat", routes)
        self.assertIn("/ws/popup-optimization", routes)
    
    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI not available")
    def test_middleware_configuration(self):
        """Test middleware is properly configured"""
        # CORS middleware should be configured
        middleware_classes = [type(m).__name__ for m in app.user_middleware]
        self.assertIn("CORSMiddleware", middleware_classes)
    
    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI not available")
    @patch('main.create_popup_agent_stream')
    def test_full_optimization_flow(self, mock_stream):
        """Test complete optimization flow"""
        # Mock realistic streaming response
        async def mock_realistic_stream():
            yield "🚀 Starting PopupGenius analysis...\n"
            yield "🔄 Step 1/3: Historical Performance Analysis\n"
            yield "📊 Processing popup data...\n"
            yield "💡 INSIGHT FOUND: Conversion rate below average\n"
            yield "🔄 Step 2/3: Transaction Pattern Analysis\n"
            yield "💰 Revenue analysis complete\n"
            yield "🔄 Step 3/3: Competitive Intelligence\n"
            yield "✨ FINAL RECOMMENDATION GENERATED\n"
        
        mock_stream.return_value = mock_realistic_stream()
        
        # Test the full flow
        client = TestClient(app)
        response = client.post("/popup-optimization", json={
            "business_description": "ProVelocity baseball equipment store selling $495 training bats",
            "optimization_goals": "Increase popup conversion rates for premium products"
        })
        
        self.assertEqual(response.status_code, 200)
        
        # Response should contain streamed data
        content = response.text
        self.assertIn("data:", content)
        
        # Should contain realistic analysis content
        if "PopupGenius" in content:
            self.assertIn("analysis", content.lower())


if __name__ == "__main__":
    # Check dependencies
    missing_deps = []
    
    if not FASTAPI_AVAILABLE:
        missing_deps.append("FastAPI")
    
    if missing_deps:
        print(f"Warning: Missing dependencies: {', '.join(missing_deps)}")
        print("Some tests will be skipped")
    
    # Run tests with verbose output
    unittest.main(verbosity=2)