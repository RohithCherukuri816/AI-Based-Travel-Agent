from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import logging
from dotenv import load_dotenv # Import load_dotenv
import os # Import os to access environment variables
from contextlib import asynccontextmanager

from ai_chat import chat_endpoint, start_chat_session, get_chat_history, ChatContext
from database import init_db # Import init_db from your database setup
from ai_chat import get_chat_manager # Import get_chat_manager for session deletion

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application...")
    init_db()  # Initialize the database when the application starts
    logger.info("Database initialized.")
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application...")

app = FastAPI(
    title="AI Travel Agent Backend",
    description="Backend for the AI-powered travel planning agent, using FastAPI, LangChain, and LangGraph.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
# In a production environment, replace "*" with your frontend's exact origin(s).
origins = [
    "http://localhost:3000",  # React development server
    "http://localhost:8000",  # FastAPI development server
    "http://localhost:8001",  # Frontend server (http.server)
    "http://127.0.0.1:3000",  # Alternative localhost
    "http://127.0.0.1:8000",  # Alternative localhost
    "http://127.0.0.1:8001",  # Alternative localhost
    "*" # Allow all origins for now, for development flexibility. Restrict in production.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)

# Pydantic models for request and response bodies
class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: Optional[str] = None
    # Add a field for current_location if the frontend will send it
    current_location: Optional[Dict[str, float]] = None 

class ChatResponse(BaseModel):
    success: bool
    response: Dict[str, Any]
    context: Optional[ChatContext] = None
    error: Optional[str] = None

class StartSessionResponse(BaseModel):
    session_id: str

class ChatHistoryResponse(BaseModel):
    history: List[Dict[str, Any]]

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application...")
    init_db()  # Initialize the database when the application starts
    logger.info("Database initialized.")
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application...")

@app.get("/", tags=["Health Check"])
async def read_root():
    return {"message": "AI Travel Agent Backend is running!"}

@app.post("/start_session", response_model=StartSessionResponse, tags=["Chat"]) 
async def start_new_chat_session(user_id: str, trip_id: Optional[str] = None):
    try:
        session_id = await start_chat_session(user_id, trip_id)
        return {"session_id": session_id}
    except Exception as e:
        logger.error(f"Error starting new session for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start session: {e}")

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_with_ai(request: ChatRequest):
    try:
        # The process_message function in ai_chat.py now expects context to be passed,
        # and current_location is part of ChatContext. We need to fetch/create context first.
        # This ensures the AI manager always gets a full context object.
        manager = get_chat_manager()
        
        # Retrieve or create context, passing current_location from request
        context = await manager.ai_manager._get_or_create_context(
            request.user_id, 
            request.session_id, 
            request.current_location # Pass current_location here
        )
        
        response = await manager.ai_manager.process_message(
            request.user_id, 
            request.message, 
            request.session_id, 
            context # Pass the fetched/created context
        )
        
        return ChatResponse(**response)
    except Exception as e:
        logger.error(f"Error in chat_with_ai for user {request.user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.get("/history/{user_id}", response_model=ChatHistoryResponse, tags=["Chat"])
async def get_user_chat_history(user_id: str, session_id: Optional[str] = None):
    try:
        history = await get_chat_history(user_id, session_id)
        return {"history": history}
    except Exception as e:
        logger.error(f"Error retrieving chat history for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {e}")

@app.delete("/delete_session", tags=["Chat"])
async def delete_chat_session(session_id: str):
    try:
        manager = get_chat_manager()
        await manager.ai_manager.delete_chat_session(session_id)
        return {"message": "Chat session deleted successfully."}
    except Exception as e:
        logger.error(f"Error deleting chat session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {e}")

# Import travel planning functionality from app.py
try:
    from app import (
        plan_travel, TravelRequest, TravelResponse,
        get_analytics_dashboard, get_analytics_realtime,
        search_places, get_destinations
    )
    
    # Add travel planning endpoints
    @app.post("/api/plan", response_model=TravelResponse, tags=["Travel Planning"])
    async def plan_travel_endpoint(request: dict):
        """Plan a complete travel itinerary"""
        return await plan_travel(request)
    
    @app.get("/api/places/search", tags=["Travel Planning"])
    async def search_places_endpoint(q: str):
        """Search for destinations and places"""
        return await search_places(q)
    
    @app.get("/api/destinations", tags=["Travel Planning"])
    async def get_destinations_endpoint():
        """Get available destinations"""
        return await get_destinations()
    
    @app.get("/api/analytics/dashboard", tags=["Analytics"])
    async def get_analytics_dashboard_endpoint(time_range: str = "month"):
        """Get analytics dashboard data"""
        return await get_analytics_dashboard(time_range)
    
    @app.get("/api/analytics/realtime", tags=["Analytics"])
    async def get_analytics_realtime_endpoint():
        """Get real-time analytics"""
        return await get_analytics_realtime()
        
except ImportError as e:
    logger.warning(f"Could not import travel planning features: {e}")
    logger.warning("Travel planning features will not be available")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
