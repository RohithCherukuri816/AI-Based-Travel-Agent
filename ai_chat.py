"""
AI Travel Planning Agent - Advanced AI Chat Interface
Intelligent chat system for natural language travel planning
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

import openai
from anthropic import Anthropic
import google.generativeai as genai
from langchain.chat_models import ChatOpenAI, ChatAnthropic
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.tools import Tool
from langchain.agents import initialize_agent, AgentType

from config import settings, get_ai_config
from models import ChatSession, ChatMessage, User, Trip
from real_apis import WeatherAPI, PlacesAPI, FlightAPI, HotelAPI

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


class AIChatManager:
    """Advanced AI chat manager for travel planning"""
    
    def __init__(self):
        self.ai_config = get_ai_config()
        self.weather_api = WeatherAPI()
        self.places_api = PlacesAPI()
        self.flight_api = FlightAPI()
        self.hotel_api = HotelAPI()
        
        # Initialize AI clients
        self._init_ai_clients()
        
        # Conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Travel planning tools
        self.tools = self._create_travel_tools()
        
        # Initialize agent
        self.agent = self._initialize_agent()
    
    def _init_ai_clients(self):
        """Initialize AI service clients"""
        if self.ai_config["openai"]["enabled"]:
            openai.api_key = self.ai_config["openai"]["api_key"]
            self.openai_client = openai.OpenAI()
        
        if self.ai_config["anthropic"]["enabled"]:
            self.anthropic_client = Anthropic(
                api_key=self.ai_config["anthropic"]["api_key"]
            )
        
        if self.ai_config["google"]["enabled"]:
            genai.configure(api_key=self.ai_config["google"]["api_key"])
            self.gemini_model = genai.GenerativeModel('gemini-pro')
    
    def _create_travel_tools(self) -> List[Tool]:
        """Create travel planning tools for the AI agent"""
        tools = [
            Tool(
                name="get_weather",
                func=self._get_weather_tool,
                description="Get current weather and forecast for a destination"
            ),
            Tool(
                name="search_places",
                func=self._search_places_tool,
                description="Search for attractions, restaurants, and activities in a destination"
            ),
            Tool(
                name="find_flights",
                func=self._find_flights_tool,
                description="Search for flight options between airports"
            ),
            Tool(
                name="find_hotels",
                func=self._find_hotels_tool,
                description="Search for hotel accommodations in a destination"
            ),
            Tool(
                name="calculate_budget",
                func=self._calculate_budget_tool,
                description="Calculate estimated costs for different travel components"
            ),
            Tool(
                name="plan_itinerary",
                func=self._plan_itinerary_tool,
                description="Create a day-by-day itinerary based on preferences and constraints"
            )
        ]
        return tools
    
    def _initialize_agent(self):
        """Initialize the LangChain agent"""
        if self.ai_config["openai"]["enabled"]:
            llm = ChatOpenAI(
                model=self.ai_config["openai"]["model"],
                temperature=self.ai_config["openai"]["temperature"],
                max_tokens=self.ai_config["openai"]["max_tokens"]
            )
            
            agent = initialize_agent(
                tools=self.tools,
                llm=llm,
                agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
                memory=self.memory,
                verbose=True,
                handle_parsing_errors=True
            )
            return agent
        return None
    
    async def process_message(
        self, 
        user_id: str, 
        message: str, 
        session_id: Optional[str] = None,
        context: Optional[ChatContext] = None
    ) -> Dict[str, Any]:
        """Process user message and generate AI response"""
        try:
            # Create or get chat context
            if context is None:
                context = await self._get_or_create_context(user_id, session_id)
            
            # Update context with user message
            context.conversation_history.append({
                "role": "user",
                "content": message,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Analyze message intent
            intent = await self._analyze_intent(message, context)
            
            # Generate response based on intent
            if intent["type"] == "travel_planning":
                response = await self._handle_travel_planning(message, context)
            elif intent["type"] == "question":
                response = await self._handle_question(message, context)
            elif intent["type"] == "booking":
                response = await self._handle_booking(message, context)
            else:
                response = await self._generate_general_response(message, context)
            
            # Update context with AI response
            context.conversation_history.append({
                "role": "assistant",
                "content": response["content"],
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Save chat session
            await self._save_chat_session(user_id, session_id, context, message, response)
            
            return {
                "success": True,
                "response": response,
                "context": context,
                "intent": intent
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": {
                    "content": "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
                    "type": "error"
                }
            }
    
    async def _analyze_intent(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Analyze user message intent using AI"""
        intent_prompt = f"""
        Analyze the following user message and determine the intent for travel planning.
        
        User Message: "{message}"
        Current Context: Destination: {context.current_destination}, Style: {context.travel_style}, Budget: {context.budget_range}
        
        Classify the intent into one of these categories:
        1. travel_planning - User wants to plan a trip or get itinerary suggestions
        2. question - User is asking for information about destinations, activities, etc.
        3. booking - User wants to book flights, hotels, or activities
        4. general - General conversation or unclear intent
        
        Return a JSON response with:
        - type: the intent category
        - confidence: confidence score (0-1)
        - entities: extracted entities (destinations, dates, preferences, etc.)
        - action_required: what action the AI should take
        """
        
        try:
            if self.ai_config["openai"]["enabled"]:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": intent_prompt}],
                    max_tokens=200,
                    temperature=0.1
                )
                intent_data = json.loads(response.choices[0].message.content)
                return intent_data
            else:
                # Fallback to simple keyword matching
                return self._simple_intent_analysis(message)
        except Exception as e:
            logger.warning(f"Intent analysis failed: {e}")
            return self._simple_intent_analysis(message)
    
    def _simple_intent_analysis(self, message: str) -> Dict[str, Any]:
        """Simple keyword-based intent analysis fallback"""
        message_lower = message.lower()
        
        travel_keywords = ["plan", "trip", "itinerary", "schedule", "visit", "go to"]
        question_keywords = ["what", "how", "when", "where", "why", "tell me about"]
        booking_keywords = ["book", "reserve", "purchase", "buy", "flight", "hotel"]
        
        if any(keyword in message_lower for keyword in travel_keywords):
            return {
                "type": "travel_planning",
                "confidence": 0.8,
                "entities": {},
                "action_required": "create_travel_plan"
            }
        elif any(keyword in message_lower for keyword in question_keywords):
            return {
                "type": "question",
                "confidence": 0.7,
                "entities": {},
                "action_required": "answer_question"
            }
        elif any(keyword in message_lower for keyword in booking_keywords):
            return {
                "type": "booking",
                "confidence": 0.6,
                "entities": {},
                "action_required": "assist_booking"
            }
        else:
            return {
                "type": "general",
                "confidence": 0.5,
                "entities": {},
                "action_required": "general_response"
            }
    
    async def _handle_travel_planning(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle travel planning requests"""
        try:
            # Use the LangChain agent for complex travel planning
            if self.agent:
                agent_response = await self.agent.arun(message)
                return {
                    "content": agent_response,
                    "type": "travel_planning",
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": self._get_next_steps("travel_planning")
                }
            else:
                # Fallback to direct AI response
                return await self._generate_travel_response(message, context)
        except Exception as e:
            logger.error(f"Travel planning failed: {e}")
            return await self._generate_travel_response(message, context)
    
    async def _handle_question(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle general questions about travel"""
        prompt = f"""
        You are an expert travel advisor. Answer the following question about travel:
        
        Question: {message}
        Context: User is planning a trip to {context.current_destination or 'an unspecified destination'}
        
        Provide a helpful, informative response with practical travel advice.
        """
        
        try:
            if self.ai_config["openai"]["enabled"]:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=300,
                    temperature=0.7
                )
                return {
                    "content": response.choices[0].message.content,
                    "type": "question",
                    "suggestions": [],
                    "next_steps": []
                }
            else:
                return {
                    "content": "I'd be happy to help with your travel question! However, I'm currently experiencing technical difficulties. Please try again later.",
                    "type": "question",
                    "suggestions": [],
                    "next_steps": []
                }
        except Exception as e:
            logger.error(f"Question handling failed: {e}")
            return {
                "content": "I apologize, but I'm having trouble processing your question right now. Please try again.",
                "type": "error",
                "suggestions": [],
                "next_steps": []
            }
    
    async def _handle_booking(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle booking-related requests"""
        return {
            "content": "I can help you with booking flights, hotels, and activities! To get started, please let me know:\n\n1. What you'd like to book (flight, hotel, activity)\n2. Your destination\n3. Travel dates\n4. Number of travelers\n\nI'll then search for the best options and guide you through the booking process.",
            "type": "booking",
            "suggestions": [
                "Book a flight",
                "Find hotel options",
                "Reserve activities",
                "Check availability"
            ],
            "next_steps": [
                "Specify booking type",
                "Provide destination",
                "Select dates",
                "Choose preferences"
            ]
        }
    
    async def _generate_general_response(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Generate general conversational response"""
        prompt = f"""
        You are a friendly AI travel assistant. The user said: "{message}"
        
        Provide a helpful, engaging response that encourages them to ask about travel planning.
        Keep it conversational and friendly.
        """
        
        try:
            if self.ai_config["openai"]["enabled"]:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.8
                )
                return {
                    "content": response.choices[0].message.content,
                    "type": "general",
                    "suggestions": [
                        "Plan a trip",
                        "Ask travel questions",
                        "Get destination info",
                        "Check weather"
                    ],
                    "next_steps": []
                }
            else:
                return {
                    "content": "Hello! I'm your AI travel assistant. I can help you plan amazing trips, find the best deals, and discover incredible destinations. What would you like to know about?",
                    "type": "general",
                    "suggestions": [
                        "Plan a trip",
                        "Ask travel questions",
                        "Get destination info",
                        "Check weather"
                    ],
                    "next_steps": []
                }
        except Exception as e:
            logger.error(f"General response generation failed: {e}")
            return {
                "content": "Hello! I'm here to help with your travel planning. How can I assist you today?",
                "type": "general",
                "suggestions": [
                    "Plan a trip",
                    "Ask travel questions",
                    "Get destination info",
                    "Check weather"
                ],
                "next_steps": []
            }
    
    async def _generate_travel_response(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Generate travel planning response using AI"""
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
            if self.ai_config["openai"]["enabled"]:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=250,
                    temperature=0.7
                )
                return {
                    "content": response.choices[0].message.content,
                    "type": "travel_planning",
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": self._get_next_steps("travel_planning")
                }
            else:
                return {
                    "content": "I'd love to help you plan your trip! To get started, I'll need a few details:\n\n1. Where would you like to go?\n2. When are you planning to travel?\n3. What's your travel style (luxury, budget, adventure)?\n4. How many people are traveling?\n5. What's your budget?\n\nOnce you provide these details, I can create a personalized itinerary just for you!",
                    "type": "travel_planning",
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": self._get_next_steps("travel_planning")
                }
        except Exception as e:
            logger.error(f"Travel response generation failed: {e}")
            return {
                "content": "I'm excited to help you plan your trip! Let me know your destination, dates, and preferences, and I'll create an amazing itinerary for you.",
                "type": "travel_planning",
                "suggestions": await self._generate_travel_suggestions(context),
                "next_steps": self._get_next_steps("travel_planning")
            }
    
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
            suggestions = [
                "Plan a new trip",
                "Get destination inspiration",
                "Check travel deals",
                "Learn about popular destinations"
            ]
        
        return suggestions[:4]  # Limit to 4 suggestions
    
    def _get_next_steps(self, intent_type: str) -> List[str]:
        """Get suggested next steps based on intent"""
        if intent_type == "travel_planning":
            return [
                "Choose destination",
                "Set travel dates",
                "Define budget",
                "Select travel style"
            ]
        elif intent_type == "booking":
            return [
                "Select service type",
                "Choose dates",
                "Compare options",
                "Make reservation"
            ]
        else:
            return [
                "Ask more questions",
                "Start planning",
                "Explore destinations",
                "Check availability"
            ]
    
    # Tool functions for the AI agent
    def _get_weather_tool(self, destination: str) -> str:
        """Get weather information for a destination"""
        try:
            weather_data = asyncio.run(self.weather_api.get_weather(destination))
            return f"Weather in {destination}: {weather_data.get('summary', 'Information unavailable')}"
        except Exception as e:
            return f"Unable to get weather information for {destination}: {str(e)}"
    
    def _search_places_tool(self, query: str) -> str:
        """Search for places in a destination"""
        try:
            places = asyncio.run(self.places_api.search_places(query))
            return f"Found {len(places)} places matching '{query}': {', '.join([p.get('name', 'Unknown') for p in places[:5]])}"
        except Exception as e:
            return f"Unable to search places for '{query}': {str(e)}"
    
    def _find_flights_tool(self, query: str) -> str:
        """Search for flight options"""
        try:
            # This would integrate with real flight APIs
            return f"Flight search functionality is available. Please provide origin, destination, and dates for specific flight options."
        except Exception as e:
            return f"Unable to search flights: {str(e)}"
    
    def _find_hotels_tool(self, query: str) -> str:
        """Search for hotel options"""
        try:
            # This would integrate with real hotel APIs
            return f"Hotel search functionality is available. Please provide destination, dates, and preferences for specific hotel options."
        except Exception as e:
            return f"Unable to search hotels: {str(e)}"
    
    def _calculate_budget_tool(self, query: str) -> str:
        """Calculate estimated travel costs"""
        try:
            # Simple budget calculation logic
            return "I can help you estimate travel costs. Please provide destination, duration, and travel style for a detailed budget breakdown."
        except Exception as e:
            return f"Unable to calculate budget: {str(e)}"
    
    def _plan_itinerary_tool(self, query: str) -> str:
        """Plan a day-by-day itinerary"""
        try:
            return "I can create a personalized itinerary for you! Please provide destination, dates, interests, and budget for a custom travel plan."
        except Exception as e:
            return f"Unable to plan itinerary: {str(e)}"
    
    # Context management
    async def _get_or_create_context(self, user_id: str, session_id: Optional[str] = None) -> ChatContext:
        """Get or create chat context for user"""
        # In a real implementation, this would fetch from database
        return ChatContext(
            user_id=user_id,
            session_id=session_id,
            preferences=["culture", "food", "adventure"],
            travelers_count=2
        )
    
    async def _save_chat_session(
        self, 
        user_id: str, 
        session_id: Optional[str], 
        context: ChatContext, 
        user_message: str, 
        ai_response: Dict[str, Any]
    ):
        """Save chat session to database"""
        # In a real implementation, this would save to database
        logger.info(f"Chat session saved for user {user_id}")
    
    async def get_chat_history(self, user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get chat history for user"""
        # In a real implementation, this would fetch from database
        return []
    
    async def create_new_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        """Create a new chat session"""
        # In a real implementation, this would create in database
        session_id = f"session_{user_id}_{datetime.utcnow().timestamp()}"
        return session_id


# Chat session manager
class ChatSessionManager:
    """Manages chat sessions and user interactions"""
    
    def __init__(self):
        self.ai_manager = AIChatManager()
        self.active_sessions: Dict[str, ChatContext] = {}
    
    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        """Start a new chat session"""
        session_id = await self.ai_manager.create_new_session(user_id, trip_id)
        
        # Create context
        context = ChatContext(
            user_id=user_id,
            trip_id=trip_id,
            preferences=["culture", "food", "adventure"],
            travelers_count=1
        )
        
        self.active_sessions[session_id] = context
        
        return session_id
    
    async def send_message(self, user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Send a message and get AI response"""
        if session_id is None:
            session_id = await self.start_session(user_id)
        
        context = self.active_sessions.get(session_id)
        if context is None:
            context = ChatContext(user_id=user_id)
            self.active_sessions[session_id] = context
        
        response = await self.ai_manager.process_message(user_id, message, session_id, context)
        
        # Update context
        if response["success"]:
            self.active_sessions[session_id] = response["context"]
        
        return response
    
    async def end_session(self, session_id: str):
        """End a chat session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
    
    def get_session_context(self, session_id: str) -> Optional[ChatContext]:
        """Get context for a session"""
        return self.active_sessions.get(session_id)


# Global chat manager instance
chat_manager = ChatSessionManager()


# API endpoints for chat functionality
async def chat_endpoint(user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
    """Main chat endpoint"""
    return await chat_manager.send_message(user_id, message, session_id)


async def start_chat_session(user_id: str, trip_id: Optional[str] = None) -> str:
    """Start a new chat session"""
    return await chat_manager.start_session(user_id, trip_id)


async def get_chat_history(user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get chat history"""
    return await chat_manager.get_chat_history(user_id, session_id)


if __name__ == "__main__":
    # Test the chat system
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
