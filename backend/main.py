from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import json
from src.agents.hypothesis_agent import create_agent_stream
from src.agents.popup_optimization_agent import create_popup_agent_stream, create_popup_agent_stream_structured
import asyncio

app = FastAPI(title="PopupGenius: AI-Powered E-Commerce Optimization API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    message: str


class PopupOptimizationRequest(BaseModel):
    business_description: str
    optimization_goals: str = ""


@app.post("/chat")
async def chat(chat_message: ChatMessage):
    """Legacy chat endpoint for hypothesis agent"""
    async def generate():
        async for chunk in create_agent_stream(chat_message.message):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/popup-optimization")
async def popup_optimization(request: PopupOptimizationRequest):
    """Main popup optimization endpoint with streaming response"""
    full_description = f"{request.business_description} {request.optimization_goals}".strip()
    
    async def generate():
        async for chunk in create_popup_agent_stream(full_description):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/popup-optimization-structured")
async def popup_optimization_structured(request: PopupOptimizationRequest):
    """Structured popup optimization endpoint with rich JSON streaming for frontend UI"""
    full_description = f"{request.business_description} {request.optimization_goals}".strip()
    
    async def generate():
        async for event in create_popup_agent_stream_structured(full_description):
            # Send each event as a JSON line for easy parsing
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(generate(), media_type="text/plain")


@app.websocket("/ws/popup-optimization")
async def popup_optimization_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time popup optimization with structured events"""
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request_data = json.loads(data)
            
            business_description = request_data.get("business_description", "")
            optimization_goals = request_data.get("optimization_goals", "")
            full_description = f"{business_description} {optimization_goals}".strip()
            
            # Stream structured events for rich UI updates
            async for event in create_popup_agent_stream_structured(full_description):
                await websocket.send_text(json.dumps(event))
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Error: {str(e)}",
            "timestamp": asyncio.get_event_loop().time()
        }))


@app.websocket("/ws/popup-optimization-simple")
async def popup_optimization_websocket_simple(websocket: WebSocket):
    """WebSocket endpoint for simple text streaming (backward compatibility)"""
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request_data = json.loads(data)
            
            business_description = request_data.get("business_description", "")
            optimization_goals = request_data.get("optimization_goals", "")
            full_description = f"{business_description} {optimization_goals}".strip()
            
            # Send progress updates and analysis results
            await websocket.send_text(json.dumps({
                "type": "analysis_start",
                "message": "🚀 Starting PopupGenius analysis..."
            }))
            
            # Stream the agent response
            async for chunk in create_popup_agent_stream(full_description):
                if chunk.strip():  # Only send non-empty chunks
                    await websocket.send_text(json.dumps({
                        "type": "analysis_chunk",
                        "content": chunk
                    }))
            
            # Send completion signal
            await websocket.send_text(json.dumps({
                "type": "analysis_complete",
                "message": "✨ Analysis complete!"
            }))
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Error: {str(e)}"
        }))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "PopupGenius API"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
