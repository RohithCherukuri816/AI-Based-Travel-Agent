"""
AI Travel Planning Agent - Advanced AI Chat Interface
Intelligent chat system for natural language travel planning
"""

import asyncio
import json
import logging
import re # We need to import the regex module
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Import load_dotenv early to be safe
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

# Try to import LangChain for advanced features
try:
    from langchain.agents import initialize_agent, AgentType
    from langchain.tools import Tool
    from langchain.memory import ConversationBufferMemory
    from langchain_openai import ChatOpenAI
    from langchain_anthropic import ChatAnthropic
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
    from langchain_core.prompts import ChatPromptTemplate
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("Warning: LangChain not available, chat features will be limited")

from config import get_ai_config
from real_apis import WeatherAPI, PlacesAPI, FlightAPI, HotelAPI
from models import ChatSession, ChatMessage, User, Trip

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIModel(str, Enum):
    """Available AI models"""
    GPT_4 = "gpt-4"
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    CLAUDE_3_OPUS = "claude-3-opus-20240229"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"
    CLAUDE_3_HAIKU = "claude-3-haiku-20240307"
    GEMINI_PRO = "gemini-pro"


@dataclass
class ChatContext:
    """Chat context and user preferences"""
    user_id: str
    trip_id: Optional[str] = None
    current_destination: Optional[str] = None
    travel_style: Optional[str] = None
    budget_range: Optional[Tuple[float, float]] = None
    preferences: List[str] = None
    travelers_count: int = 1
    trip_duration: Optional[int] = None
    language: str = "en"
    conversation_history: List[Dict[str, str]] = None

    def __post_init__(self):
        if self.preferences is None:
            self.preferences = []
        if self.conversation_history is None:
            self.conversation_history = []


def _extract_json(text: str) -> Optional[str]:
    """
    Extracts a JSON object from a string that may contain extra text.
    Handles cases where the JSON is wrapped in markdown code blocks.
    """
    # First, try to find a JSON block wrapped in ```json ... ```
    match = re.search(r"```json\n({.*?})\n```", text, re.DOTALL)
    if match:
        return match.group(1)
    
    # If not found, try to find a standalone JSON object
    match = re.search(r"({.*?})", text, re.DOTALL)
    if match:
        return match.group(1)
        
    return None

class AIChatManager:
    """Advanced AI chat manager for travel planning"""

    def __init__(self):
        self.ai_config = get_ai_config()
        self.weather_api = WeatherAPI()
        self.places_api = PlacesAPI()
        self.flight_api = FlightAPI()
        self.hotel_api = HotelAPI()
        self.gemini_model = None

        self._init_ai_clients()

        self.tools = self._create_travel_tools()
        self.agent = self._initialize_agent()

    def _init_ai_clients(self):
        """Initialize AI service clients based on config"""
        if self.ai_config["google"]["enabled"]:
            try:
                genai.configure(api_key=self.ai_config["google"]["api_key"])
                model_name = self.ai_config["google"].get("model", "gemini-pro")
                self.gemini_model = genai.GenerativeModel(model_name)
                logger.info("Google Gemini client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Google Gemini client: {e}")
                self.gemini_model = None
        else:
            logger.warning("Google AI is not enabled in the configuration.")

        if LANGCHAIN_AVAILABLE and self.ai_config.get("openai", {}).get("enabled"):
            try:
                from langchain_openai import ChatOpenAI
                self.openai_llm = ChatOpenAI(model=self.ai_config["openai"]["model"])
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                self.openai_llm = None
        
        if LANGCHAIN_AVAILABLE and self.ai_config.get("anthropic", {}).get("enabled"):
            try:
                from langchain_anthropic import ChatAnthropic
                self.anthropic_llm = ChatAnthropic(model=self.ai_config["anthropic"]["model"])
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic client: {e}")
                self.anthropic_llm = None

    def _create_travel_tools(self) -> List[Tool]:
        """Create travel planning tools for the AI agent"""
        if not LANGCHAIN_AVAILABLE:
            return []
        
        return [
            Tool(name="get_weather", func=lambda destination: f"Weather information for {destination} is a bit cloudy.", description="Get current weather and forecast for a destination"),
            Tool(name="search_places", func=lambda query: f"Found places for {query}: Eiffel Tower, Louvre Museum.", description="Search for attractions, restaurants, and activities in a destination"),
            Tool(name="find_flights", func=lambda query: "Flight search functionality is available. Please provide origin, destination, and dates.", description="Search for flight options between airports"),
            Tool(name="find_hotels", func=lambda query: "Hotel search functionality is available. Please provide destination, dates, and preferences.", description="Search for hotel accommodations in a destination"),
            Tool(name="calculate_budget", func=lambda query: "I can help you estimate travel costs.", description="Calculate estimated costs for different travel components"),
            Tool(name="plan_itinerary", func=lambda query: "I can create a personalized itinerary for you!", description="Create a day-by-day itinerary based on preferences and constraints")
        ]

    def _initialize_agent(self):
        """Initialize the LangChain agent if available and an AI provider is enabled"""
        if not LANGCHAIN_AVAILABLE:
            return None

        llm = None
        if self.ai_config["google"]["enabled"]:
            if getattr(self, "gemini_model", None):
                class GeminiLLM:
                    def __init__(self, model):
                        self.model = model
                    def __call__(self, prompt, **kwargs):
                        try:
                            response = self.model.generate_content(prompt)
                            return response.text if response and hasattr(response, "text") else ""
                        except Exception as e:
                            logger.error(f"Gemini API error: {e}")
                            return "I'm having trouble connecting to the AI service. Please try again."
                llm = GeminiLLM(self.gemini_model)
        elif self.ai_config["openai"]["enabled"] and getattr(self, "openai_llm", None):
            llm = self.openai_llm
        elif self.ai_config["anthropic"]["enabled"] and getattr(self, "anthropic_llm", None):
            llm = self.anthropic_llm
        
        if llm:
            try:
                agent = initialize_agent(
                    tools=self.tools,
                    llm=llm,
                    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
                    verbose=True,
                    handle_parsing_errors=True
                )
                logger.info("LangChain agent initialized successfully.")
                return agent
            except Exception as e:
                logger.error(f"Failed to initialize LangChain agent: {e}")
                return None
        
        logger.warning("No valid LLM client found or enabled for LangChain agent initialization.")
        return None

    async def process_message(self, user_id: str, message: str, session_id: Optional[str] = None, context: Optional[ChatContext] = None) -> Dict[str, Any]:
        """Process user message and generate AI response"""
        try:
            if context is None:
                context = await self._get_or_create_context(user_id, session_id)

            context.conversation_history.append({"role": "user", "content": message, "timestamp": datetime.utcnow().isoformat()})

            intent = await self._analyze_intent(message, context)

            if self.agent and intent.get("type") in ["travel_planning", "question", "booking"]:
                response_content = await self.agent.arun(message)
                response = {
                    "content": response_content,
                    "type": intent["type"],
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": self._get_next_steps(intent["type"])
                }
            else:
                if intent["type"] == "travel_planning":
                    response = await self._handle_travel_planning(message, context)
                elif intent["type"] == "question":
                    response = await self._handle_question(message, context)
                elif intent["type"] == "booking":
                    response = await self._handle_booking(message, context)
                else:
                    response = await self._generate_general_response(message, context)

            context.conversation_history.append({"role": "assistant", "content": response.get("content", "I am unable to generate a response at this time."), "timestamp": datetime.utcnow().isoformat()})
            
            await self._save_chat_session(user_id, session_id, context, message, response)

            return {"success": True, "response": response, "context": context, "intent": intent}
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {"success": False, "error": str(e), "response": {"content": "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.", "type": "error"}}

    async def _analyze_intent(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Analyze user message intent using AI with a direct prompt"""
        intent_prompt = f"""
        Analyze the following user message and determine the intent for travel planning.
        User Message: "{message}"
        Current Context: Destination: {context.current_destination}, Style: {context.travel_style}, Budget: {context.budget_range}

        Classify the intent into one of these categories:
        1. travel_planning - User wants to plan a trip or get itinerary suggestions
        2. question - User is asking for general travel information (e.g., "what's the weather like?")
        3. booking - User wants to book flights, hotels, or activities
        4. general - General conversation or unclear intent

        Return a JSON response with:
        - type: the intent category
        - confidence: confidence score (0-1)
        - entities: extracted entities (destinations, dates, preferences, etc.)
        - action_required: what action the AI should take
        """
        try:
            if self.gemini_model:
                response = await asyncio.to_thread(self.gemini_model.generate_content, intent_prompt)
                json_string = _extract_json(response.text)
                if json_string:
                    return json.loads(json_string)
                else:
                    raise ValueError("Could not extract a valid JSON string from the AI's response.")
        except Exception as e:
            logger.warning(f"Intent analysis with Gemini failed: {e}")

        return self._simple_intent_analysis(message)

    async def _handle_travel_planning(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle travel planning requests using AI"""
        prompt = f"""
        You are an expert AI travel planner. The user wants to plan a trip and said: "{message}"
        Current context:
        - Destination: {context.current_destination or 'not specified'}
        - Travel style: {context.travel_style or 'not specified'}
        - Budget: {context.budget_range or 'not specified'}
        - Travelers: {context.travelers_count}
        - Duration: {context.trip_duration or 'not specified'} days

        Provide a helpful response that:
        1. Acknowledges their request
        2. Asks clarifying questions if needed
        3. Offers to help plan their trip
        4. Suggests next steps
        Be enthusiastic and helpful!
        """
        try:
            if self.gemini_model:
                response = await asyncio.to_thread(self.gemini_model.generate_content, prompt)
                return {
                    "content": response.text,
                    "type": "travel_planning",
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": self._get_next_steps("travel_planning")
                }
        except Exception as e:
            logger.error(f"Travel planning response failed: {e}")
        
        return {
            "content": "I'm excited to help you plan your trip! Let me know your destination, dates, and preferences, and I'll create an amazing itinerary for you.",
            "type": "travel_planning",
            "suggestions": await self._generate_travel_suggestions(context),
            "next_steps": self._get_next_steps("travel_planning")
        }

    async def _handle_question(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle general questions about travel using AI"""
        prompt = f"""
        You are an expert travel advisor. Answer the following question about travel:
        Question: {message}
        Context: User is planning a trip to {context.current_destination or 'an unspecified destination'}
        Provide a helpful, informative response with practical travel advice.
        """
        try:
            if self.gemini_model:
                response = await asyncio.to_thread(self.gemini_model.generate_content, prompt)
                return {
                    "content": response.text,
                    "type": "question",
                    "suggestions": [],
                    "next_steps": []
                }
        except Exception as e:
            logger.error(f"Question handling response failed: {e}")

        return {
            "content": "I'm having a little trouble looking up that information right now. Can I help you with anything else?",
            "type": "question",
            "suggestions": [],
            "next_steps": []
        }
    
    async def _handle_booking(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle booking-related requests using AI"""
        prompt = f"""
        You are an AI booking assistant. The user said: "{message}"
        Current context:
        - Destination: {context.current_destination or 'not specified'}
        - Travelers: {context.travelers_count}
        - Preferences: {', '.join(context.preferences)}

        Guide the user through the booking process by asking for missing information (e.g., dates, origin city, etc.) and confirming their request.
        """
        try:
            if self.gemini_model:
                response = await asyncio.to_thread(self.gemini_model.generate_content, prompt)
                return {
                    "content": response.text,
                    "type": "booking",
                    "suggestions": ["Book a flight", "Find hotel options", "Reserve activities"],
                    "next_steps": []
                }
        except Exception as e:
            logger.error(f"Booking handling response failed: {e}")
        
        return {
            "content": "I can help with bookings! Please provide details like destination, dates, and the number of travelers, and I'll find the best options for you.",
            "type": "booking",
            "suggestions": ["Book a flight", "Find hotel options", "Reserve activities", "Check availability"],
            "next_steps": ["Specify booking type", "Provide destination", "Select dates"]
        }
    
    async def _generate_general_response(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Generate general conversational response using AI"""
        prompt = f"""
        You are a friendly AI travel assistant. The user said: "{message}"
        Provide a helpful, engaging response that encourages them to ask about travel planning.
        Keep it conversational and friendly.
        """
        try:
            if self.gemini_model:
                response = await asyncio.to_thread(self.gemini_model.generate_content, prompt)
                return {
                    "content": response.text,
                    "type": "general",
                    "suggestions": ["Plan a trip", "Ask travel questions", "Get destination info", "Check weather"],
                    "next_steps": []
                }
        except Exception as e:
            logger.error(f"General response generation failed: {e}")
        
        return {
            "content": "Hello! I'm here to help with your travel planning. How can I assist you today?",
            "type": "general",
            "suggestions": ["Plan a trip", "Ask travel questions", "Explore destinations"],
            "next_steps": []
        }

    def _simple_intent_analysis(self, message: str) -> Dict[str, Any]:
        """Simple keyword-based intent analysis fallback"""
        message_lower = message.lower()
        travel_keywords = ["plan", "trip", "itinerary", "schedule", "visit", "go to"]
        question_keywords = ["what", "how", "when", "where", "why", "tell me about"]
        booking_keywords = ["book", "reserve", "purchase", "buy", "flight", "hotel"]

        if any(keyword in message_lower for keyword in travel_keywords):
            return {"type": "travel_planning", "confidence": 0.8, "entities": {}, "action_required": "create_travel_plan"}
        elif any(keyword in message_lower for keyword in question_keywords):
            return {"type": "question", "confidence": 0.7, "entities": {}, "action_required": "answer_question"}
        elif any(keyword in message_lower for keyword in booking_keywords):
            return {"type": "booking", "confidence": 0.6, "entities": {}, "action_required": "assist_booking"}
        else:
            return {"type": "general", "confidence": 0.5, "entities": {}, "action_required": "general_response"}
    
    async def _generate_travel_suggestions(self, context: ChatContext) -> List[str]:
        """Generate relevant travel suggestions based on context"""
        suggestions = []
        if context.current_destination:
            suggestions.extend([
                f"Explore {context.current_destination}",
                f"Find activities in {context.current_destination}",
                f"Check weather in {context.current_destination}",
                f"Find hotels in {context.current_destination}"
            ])
        if context.travel_style:
            suggestions.extend([
                f"Find {context.travel_style} accommodations",
                f"Discover {context.travel_style} activities",
                f"Plan {context.travel_style} experiences"
            ])
        if not suggestions:
            suggestions = ["Plan a new trip", "Get destination inspiration", "Check travel deals", "Learn about popular destinations"]
        return suggestions[:4]

    def _get_next_steps(self, intent_type: str) -> List[str]:
        """Get suggested next steps based on intent"""
        if intent_type == "travel_planning":
            return ["Choose destination", "Set travel dates", "Define budget", "Select travel style"]
        elif intent_type == "booking":
            return ["Select service type", "Choose dates", "Compare options", "Make reservation"]
        else:
            return ["Ask more questions", "Start planning", "Explore destinations", "Check availability"]

    # Dummy tool functions for the AI agent
    def _get_weather_tool(self, destination: str) -> str:
        try:
            weather_data = asyncio.run(self.weather_api.get_weather(destination))
            return f"Weather in {destination}: {weather_data.get('summary', 'Information unavailable')}"
        except Exception as e:
            return f"Unable to get weather information for {destination}: {str(e)}"
    
    def _search_places_tool(self, query: str) -> str:
        try:
            places = asyncio.run(self.places_api.search_places(query))
            return f"Found {len(places)} places matching '{query}': {', '.join([p.get('name', 'Unknown') for p in places[:5]])}"
        except Exception as e:
            return f"Unable to search places for '{query}': {str(e)}"
    
    def _find_flights_tool(self, query: str) -> str:
        return "Flight search functionality is available. Please provide origin, destination, and dates for specific flight options."
    
    def _find_hotels_tool(self, query: str) -> str:
        return "Hotel search functionality is available. Please provide destination, dates, and preferences for specific hotel options."
    
    def _calculate_budget_tool(self, query: str) -> str:
        return "I can help you estimate travel costs. Please provide destination, duration, and travel style for a detailed budget breakdown."
    
    def _plan_itinerary_tool(self, query: str) -> str:
        return "I can create a personalized itinerary for you! Please provide destination, dates, interests, and budget for a custom travel plan."

    # Context management
    async def _get_or_create_context(self, user_id: str, session_id: Optional[str] = None) -> ChatContext:
        return ChatContext(user_id=user_id, session_id=session_id, preferences=["culture", "food", "adventure"], travelers_count=2)
    
    async def _save_chat_session(self, user_id: str, session_id: Optional[str], context: ChatContext, user_message: str, ai_response: Dict[str, Any]):
        logger.info(f"Chat session saved for user {user_id}")
    
    async def get_chat_history(self, user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return []
    
    async def create_new_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        session_id = f"session_{user_id}_{datetime.utcnow().timestamp()}"
        return session_id

class ChatSessionManager:
    """Manages chat sessions and user interactions"""
    def __init__(self):
        self.ai_manager = AIChatManager()
        self.active_sessions: Dict[str, ChatContext] = {}

    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        session_id = await self.ai_manager.create_new_session(user_id, trip_id)
        context = ChatContext(user_id=user_id, trip_id=trip_id, preferences=["culture", "food", "adventure"], travelers_count=1)
        self.active_sessions[session_id] = context
        return session_id

    async def send_message(self, user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        if session_id is None:
            session_id = await self.start_session(user_id)
        
        context = self.active_sessions.get(session_id)
        if context is None:
            context = ChatContext(user_id=user_id)
            self.active_sessions[session_id] = context
        
        response = await self.ai_manager.process_message(user_id, message, session_id, context)
        
        if response["success"]:
            self.active_sessions[session_id] = response["context"]
        
        return response

    async def end_session(self, session_id: str):
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]

    def get_session_context(self, session_id: str) -> Optional[ChatContext]:
        return self.active_sessions.get(session_id)

# Global chat manager instance - initialize lazily to avoid import errors
chat_manager = None
def get_chat_manager():
    """Get or create the global chat manager instance"""
    global chat_manager
    if chat_manager is None:
        try:
            chat_manager = ChatSessionManager()
        except Exception as e:
            logger.error(f"Failed to initialize chat manager: {e}")
            chat_manager = DummyChatManager()
    return chat_manager

class DummyChatManager:
    """Dummy chat manager for when the real one fails to initialize"""
    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        return f"dummy_session_{user_id}"
    
    async def send_message(self, user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        return {
            "success": False,
            "error": "Chat service temporarily unavailable",
            "response": {
                "content": "I apologize, but the chat service is currently unavailable. Please try again later.",
                "type": "error"
            }
        }
    async def end_session(self, session_id: str):
        pass
    def get_session_context(self, session_id: str) -> Optional[ChatContext]:
        return None

# API endpoints for chat functionality
async def chat_endpoint(user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
    """Main chat endpoint"""
    manager = get_chat_manager()
    return await manager.send_message(user_id, message, session_id)

async def start_chat_session(user_id: str, trip_id: Optional[str] = None) -> str:
    """Start a new chat session"""
    manager = get_chat_manager()
    return await manager.start_session(user_id, trip_id)

async def get_chat_history(user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get chat history"""
    manager = get_chat_manager()
    return await manager.get_chat_history(user_id, session_id)

if __name__ == "__main__":
    async def test_chat():
        print("🧠 Testing AI Chat System...")
        
        # Test basic message processing
        response = await chat_endpoint("test_user", "I want to plan a trip to Paris")
        print(f"Response: {response}")
        
        # Test session management
        session_id = await start_chat_session("test_user")
        print(f"Session ID: {session_id}")
        
        # Test follow-up message
        response2 = await chat_endpoint("test_user", "What should I do there?", session_id)
        print(f"Follow-up Response: {response2}")
    
    asyncio.run(test_chat())