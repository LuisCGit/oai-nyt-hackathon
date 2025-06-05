from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from src.agents.hypothesis_agent import create_agent_stream

app = FastAPI(title="Closed-Loop CRO Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    message: str


@app.post("/chat")
async def chat(chat_message: ChatMessage):
    async def generate():
        async for chunk in create_agent_stream(chat_message.message):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(generate(), media_type="text/plain")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
