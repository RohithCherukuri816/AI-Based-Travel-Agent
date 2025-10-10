"""
AI Travel Planning Agent - Simplified AI Chat Interface
Basic chat system for travel planning
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIModel(str, Enum):
    """Available AI models"""
    GOOGLE_GEMINI = "google_gemini"
    MOCK = "mock"

@dataclass
class ChatContext:
    """Chat context for maintaining conversation state"""
    user_id: str
    session_id: Optional[str] = None
    current_location: Optional[Dict[str, float]] = None
    preferences: Optional[Dict[str, Any]] = None
    trip_context: Optional[Dict[str, Any]] = None

class ChatManager:
    """Simplified chat manager"""
    def __init__(self):
        self.sessions = {}
        self.ai_manager = SimplifiedAIManager()
    
    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "user_id": user_id,
            "trip_id": trip_id,
            "messages": [],
            "created_at": datetime.now()
        }
        return session_id
    
    async def get_history(self, user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if session_id and session_id in self.sessions:
            return self.sessions[session_id]["messages"]
        return []

class SimplifiedAIManager:
    """Simplified AI manager for basic responses"""
    
    async def process_message(self, user_id: str, message: str, session_id: Optional[str] = None, context: Optional[ChatContext] = None) -> Dict[str, Any]:
        """Process user message and return AI response"""
        try:
            # Simple rule-based responses for travel planning
            response_text = self._generate_response(message)
            
            return {
                "success": True,
                "response": {
                    "content": response_text,
                    "type": "text",
                    "suggestions": ["Tell me about flights", "Find hotels", "Plan activities", "Check weather"]
                },
                "context": context
            }
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "success": False,
                "response": {
                    "content": "I'm sorry, I'm having trouble processing your request right now. Please try again.",
                    "type": "error"
                },
                "error": str(e)
            }
    
    def _generate_response(self, message: str) -> str:
        """Generate simple rule-based responses"""
        message_lower = message.lower()
        
        # Check if this is a travel preferences message from the form
        if "travel preferences are:" in message_lower or ("destination" in message_lower and "budget" in message_lower and "start date" in message_lower):
            return "Perfect! I've received your travel preferences. Let me analyze your requirements and create a personalized travel plan for you. Based on your preferences, I'll suggest the best flights, accommodations, activities, and create a detailed itinerary that fits your budget and travel style. Give me a moment to process this information..."
        
        elif any(word in message_lower for word in ["hello", "hi", "hey"]):
            return "Hello! I'm your AI travel assistant. I can help you plan amazing trips! Where would you like to go?"
        
        elif any(word in message_lower for word in ["flight", "flights", "fly"]):
            return "I can help you find flights! What's your destination and preferred travel dates?"
        
        elif any(word in message_lower for word in ["hotel", "hotels", "accommodation", "stay"]):
            return "I'll help you find great accommodations! What city are you visiting and what's your budget range?"
        
        elif any(word in message_lower for word in ["activity", "activities", "things to do", "attractions"]):
            return "I can suggest amazing activities! What are your interests? (culture, food, adventure, relaxation, etc.)"
        
        elif any(word in message_lower for word in ["weather", "climate", "temperature"]):
            return "I can check the weather for your destination! Which city and dates are you interested in?"
        
        elif any(word in message_lower for word in ["budget", "cost", "price", "expensive"]):
            return "I can help you plan within your budget! What's your total budget and how many days are you planning to travel?"
        
        elif any(word in message_lower for word in ["plan", "itinerary", "schedule"]):
            return "I'd love to create a personalized itinerary for you! Please tell me: destination, dates, budget, and your interests."
        
        else:
            return "That's interesting! I'm here to help you plan your perfect trip. You can ask me about flights, hotels, activities, weather, or budget planning. What would you like to explore?"
    
    async def _get_or_create_context(self, user_id: str, session_id: Optional[str] = None, current_location: Optional[Dict[str, float]] = None) -> ChatContext:
        """Get or create chat context"""
        return ChatContext(
            user_id=user_id,
            session_id=session_id,
            current_location=current_location
        )
    
    async def delete_chat_session(self, session_id: str):
        """Delete a chat session"""
        # In a real implementation, this would delete from database
        pass

# Global chat manager instance
_chat_manager = None

def get_chat_manager() -> ChatManager:
    """Get global chat manager instance"""
    global _chat_manager
    if _chat_manager is None:
        _chat_manager = ChatManager()
    return _chat_manager

# API endpoints
async def start_chat_session(user_id: str, trip_id: Optional[str] = None) -> str:
    """Start a new chat session"""
    manager = get_chat_manager()
    return await manager.start_session(user_id, trip_id)

async def get_chat_history(user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get chat history"""
    manager = get_chat_manager()
    return await manager.get_history(user_id, session_id)

async def chat_endpoint(user_id: str, message: str, session_id: Optional[str] = None, current_location: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """Main chat endpoint"""
    manager = get_chat_manager()
    context = await manager.ai_manager._get_or_create_context(user_id, session_id, current_location)
    return await manager.ai_manager.process_message(user_id, message, session_id, context)