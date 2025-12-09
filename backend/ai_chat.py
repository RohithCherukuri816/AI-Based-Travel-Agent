"""
AI Travel Planning Agent - Enhanced AI Chat Interface
Real-time chat system for travel planning with Gemini AI integration
"""

import asyncio
import json
import logging
import uuid
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import Gemini AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    
    # Configure Gemini
    google_ai_key = os.getenv("GOOGLE_AI_API_KEY")
    if google_ai_key:
        genai.configure(api_key=google_ai_key)
        try:
            gemini_model = genai.GenerativeModel('gemini-pro')
        except:
            try:
                gemini_model = genai.GenerativeModel('gemini-1.5-pro')
            except:
                try:
                    gemini_model = genai.GenerativeModel('models/gemini-pro')
                except:
                    print("⚠️ Could not initialize Gemini model for chat")
                    gemini_model = None
                    GEMINI_AVAILABLE = False
    else:
        gemini_model = None
        GEMINI_AVAILABLE = False
        print("⚠️ GOOGLE_AI_API_KEY not found in environment")
except ImportError:
    GEMINI_AVAILABLE = False
    gemini_model = None
    print("⚠️ google-generativeai package not installed")

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
    """Enhanced chat manager with session handling"""
    def __init__(self):
        self.sessions = {}
        self.ai_manager = EnhancedAIManager()
    
    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "user_id": user_id,
            "trip_id": trip_id,
            "messages": [],
            "created_at": datetime.now()
        }
        logger.info(f"Started new chat session {session_id} for user {user_id}")
        return session_id
    
    async def get_history(self, user_id: str, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if session_id and session_id in self.sessions:
            return self.sessions[session_id]["messages"]
        return []
    
    async def add_message(self, session_id: str, message: Dict[str, Any]):
        """Add message to session history"""
        if session_id in self.sessions:
            self.sessions[session_id]["messages"].append(message)

class EnhancedAIManager:
    """Enhanced AI manager with real-time Gemini integration"""
    
    async def process_message(self, user_id: str, message: str, session_id: Optional[str] = None, context: Optional[ChatContext] = None) -> Dict[str, Any]:
        """Process user message and return AI response"""
        try:
            logger.info(f"Processing message from user {user_id}: {message[:100]}...")
            print(f"🎯 Processing message: '{message}' from user: {user_id}")
            print(f"📍 Context available: {context is not None}")
            if context and context.current_location:
                print(f"📍 User location: {context.current_location}")
            
            # Try Gemini AI first for intelligent responses
            if GEMINI_AVAILABLE and gemini_model:
                response_text = await self._generate_ai_response(message, context)
                if response_text:
                    # Check if user is asking for nearby places and we have their location
                    location_keywords = [
                        "nearby", "near me", "around here", "close to me", "local", 
                        "in my location", "my location", "around me", "my area", 
                        "in my area", "where i am", "current location", "here",
                        "places to visit in my", "top places in my", "attractions in my",
                        "at my location", "places at my", "beautiful places at my"
                    ]
                    
                    # Debug logging
                    print(f"🔍 Checking location query: '{message}'")
                    print(f"📍 Has location context: {context and context.current_location is not None}")
                    if context and context.current_location:
                        print(f"📍 Location: {context.current_location}")
                    
                    location_query_detected = any(keyword in message.lower() for keyword in location_keywords)
                    print(f"🎯 Location query detected: {location_query_detected}")
                    print(f"🎯 Keywords found: {[kw for kw in location_keywords if kw in message.lower()]}")
                    
                    if context and context.current_location and location_query_detected:
                        try:
                            from real_api_config import real_api_manager
                            lat = context.current_location.get("latitude")
                            lon = context.current_location.get("longitude")
                            
                            if lat and lon:
                                # Determine what type of places to search for
                                place_type = "tourist_attraction"  # default
                                if any(word in message.lower() for word in ["restaurant", "food", "eat", "dining"]):
                                    place_type = "restaurant"
                                elif any(word in message.lower() for word in ["hotel", "stay", "accommodation"]):
                                    place_type = "lodging"
                                elif any(word in message.lower() for word in ["shop", "shopping", "store"]):
                                    place_type = "store"
                                elif any(word in message.lower() for word in ["hospital", "medical", "pharmacy"]):
                                    place_type = "hospital"
                                elif any(word in message.lower() for word in ["gas", "fuel", "petrol"]):
                                    place_type = "gas_station"
                                
                                nearby_places = await real_api_manager.get_nearby_places(lat, lon, place_type, radius=10000)
                                
                                if nearby_places and len(nearby_places) > 0:
                                    places_text = "\n\n🗺️ **Beautiful Places Near Your Location:**\n\n"
                                    for i, place in enumerate(nearby_places[:8], 1):
                                        distance = place.get("distance", "Unknown")
                                        rating = place.get("rating", "N/A")
                                        price = place.get("price", 0)
                                        price_text = "Free" if price == 0 else f"${price}"
                                        
                                        places_text += f"{i}. **{place['name']}**\n"
                                        places_text += f"   📍 {distance}km away | ⭐ {rating}/5 | 💰 {price_text}\n"
                                        places_text += f"   {place['description']}\n\n"
                                    
                                    places_text += "\n💡 **Tip:** You can ask me for more details about any of these places, or request specific types like 'restaurants near me' or 'museums nearby'!"
                                    response_text += places_text
                                else:
                                    response_text += "\n\n📍 I can see you're asking about places in your area! I have your location but I'm having trouble accessing real-time place data right now. You can try asking about specific types of places like 'restaurants near me' or 'attractions nearby'."
                        except Exception as e:
                            print(f"Error getting nearby places: {e}")
                            response_text += "\n\n📍 I can see you're asking about places in your area! I have your location but I'm having trouble accessing real-time place data right now. Please try again or ask about specific types of places."
                    
                    return {
                        "success": True,
                        "response": {
                            "content": response_text,
                            "type": "text",
                            "suggestions": self._generate_smart_suggestions(message, context),
                            "timestamp": datetime.now().isoformat()
                        },
                        "context": context,
                        "model_used": "gemini"
                    }
            
            # Check for location queries even without Gemini
            location_keywords = [
                "nearby", "near me", "around here", "close to me", "local", 
                "in my location", "my location", "around me", "my area", 
                "in my area", "where i am", "current location", "here",
                "places to visit in my", "top places in my", "attractions in my",
                "at my location", "places at my", "beautiful places at my"
            ]
            
            location_query_detected = any(keyword in message.lower() for keyword in location_keywords)
            print(f"🔍 Fallback: Location query detected: {location_query_detected}")
            
            if location_query_detected:
                if not context or not context.current_location:
                    response_text = "I'd love to help you find places in your area! However, I don't have access to your current location. Please allow location access in your browser, or you can tell me which city you're in and I can suggest great places to visit there!"
                else:
                    # Try to get nearby places even without Gemini
                    try:
                        from real_api_config import real_api_manager
                        lat = context.current_location.get("latitude")
                        lon = context.current_location.get("longitude")
                        
                        if lat and lon:
                            print(f"🔍 Fallback: Getting nearby places for ({lat}, {lon})")
                            
                            # Determine place type from message
                            place_type = "tourist_attraction"
                            if any(word in message.lower() for word in ["restaurant", "food", "eat", "dining"]):
                                place_type = "restaurant"
                            elif any(word in message.lower() for word in ["hotel", "stay", "accommodation"]):
                                place_type = "lodging"
                            elif any(word in message.lower() for word in ["shop", "shopping", "store"]):
                                place_type = "store"
                            
                            nearby_places = await real_api_manager.get_nearby_places(lat, lon, place_type, radius=10000)
                            
                            if nearby_places and len(nearby_places) > 0:
                                response_text = "🗺️ **Here are some beautiful places near your location:**\n\n"
                                for i, place in enumerate(nearby_places[:8], 1):
                                    distance = place.get("distance", "Unknown")
                                    rating = place.get("rating", "N/A")
                                    price = place.get("price", 0)
                                    price_text = "Free" if price == 0 else f"${price}"
                                    
                                    response_text += f"{i}. **{place['name']}**\n"
                                    response_text += f"   📍 {distance}km away | ⭐ {rating}/5 | 💰 {price_text}\n"
                                    response_text += f"   {place['description']}\n\n"
                                
                                response_text += "\n💡 **Tip:** I'm using your live GPS location to show you real-time nearby recommendations! Ask me for more specific types of places anytime."
                            else:
                                response_text = "I can see you're asking about places in your area! I have your location but I'm having trouble finding nearby places right now. You can try asking about specific types of places like 'restaurants near me' or 'attractions nearby'."
                        else:
                            response_text = "I can see you're asking about places in your area! Let me help you find some great nearby recommendations."
                    except Exception as e:
                        print(f"❌ Error in fallback location search: {e}")
                        response_text = "I can see you're asking about places in your area! I have your location but I'm having trouble accessing place data right now. Please try again."
            else:
                # Fallback to rule-based responses
                response_text = self._generate_fallback_response(message)
            
            return {
                "success": True,
                "response": {
                    "content": response_text,
                    "type": "text",
                    "suggestions": self._generate_basic_suggestions(),
                    "timestamp": datetime.now().isoformat()
                },
                "context": context,
                "model_used": "fallback"
            }
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Error processing message: {e}")
            logger.error(f"Full traceback: {error_details}")
            print(f"❌ Chat processing error: {e}")
            print(f"❌ Full traceback: {error_details}")
            return {
                "success": False,
                "response": {
                    "content": f"I'm sorry, I'm having trouble processing your request right now. Error: {str(e)}. Please try again.",
                    "type": "error",
                    "timestamp": datetime.now().isoformat()
                },
                "error": str(e)
            }
    
    async def _generate_ai_response(self, message: str, context: Optional[ChatContext] = None) -> Optional[str]:
        """Generate intelligent response using Gemini AI"""
        try:
            # Build context for the AI
            context_info = ""
            if context:
                if context.current_location:
                    lat = context.current_location.get("latitude")
                    lon = context.current_location.get("longitude")
                    context_info += f"🌍 User's LIVE GPS Location: Latitude {lat}, Longitude {lon}\n"
                    context_info += "✅ IMPORTANT: The user's location is being tracked in REAL-TIME via GPS.\n"
                    context_info += "✅ When they ask about 'nearby', 'near me', 'at my location', or 'beautiful places at my location', you can provide real-time recommendations.\n"
                    context_info += "✅ The system will automatically fetch nearby places from Google Places API based on their GPS coordinates.\n\n"
                if context.preferences:
                    context_info += f"User preferences: {context.preferences}\n"
                if context.trip_context:
                    context_info += f"Trip context: {context.trip_context}\n"
            
            # Create a comprehensive prompt for travel assistance
            prompt = f"""
You are TravelBot, an expert AI travel assistant. You help users plan amazing trips with personalized recommendations.

Context:
{context_info}

User message: {message}

Instructions:
- Be helpful, friendly, and knowledgeable about travel
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Suggest destinations, activities, and travel tips
- Help with budgeting, timing, and logistics
- Keep responses conversational and engaging (2-4 sentences)
- If the user is asking about travel preferences, help them plan their trip step by step
- Use real-time information when possible
- Be enthusiastic about travel planning
- 🌍 REAL-TIME LOCATION AWARENESS: If the user has shared their GPS location and asks about nearby places, beautiful places at their location, or anything "near me", acknowledge that you're using their LIVE GPS coordinates to provide real-time recommendations
- For location-based queries with GPS data, emphasize that you're showing them places based on their current real-time location
- When GPS location is available, encourage users to explore nearby attractions, restaurants, and points of interest

Respond in a natural, helpful way:
"""
            
            response = gemini_model.generate_content(prompt)
            ai_response = response.text.strip()
            
            if ai_response and len(ai_response) > 10:
                logger.info("Generated AI response using Gemini")
                return ai_response
                
        except Exception as e:
            logger.error(f"Gemini AI error: {e}")
            return None
    
    def _generate_smart_suggestions(self, message: str, context: Optional[ChatContext] = None) -> List[str]:
        """Generate smart suggestions based on message and context"""
        message_lower = message.lower()
        
        # Location-based suggestions if we have user's location
        if context and context.current_location:
            if any(word in message_lower for word in ["nearby", "near", "local", "around"]):
                return [
                    "Show me nearby restaurants",
                    "What attractions are close to me?",
                    "Find local shopping areas",
                    "Any good hotels nearby?"
                ]
        
        # Context-aware suggestions
        if any(word in message_lower for word in ["destination", "where", "place", "country", "city"]):
            suggestions = [
                "What's your budget for this trip?",
                "How many days are you planning?",
                "What activities interest you most?",
                "Any specific travel dates in mind?"
            ]
            
            # Add location-based suggestion if we have user's location
            if context and context.current_location:
                suggestions.insert(0, "What's interesting near my current location?")
            
            return suggestions
        elif any(word in message_lower for word in ["budget", "cost", "money", "expensive", "cheap"]):
            return [
                "What destinations fit this budget?",
                "How to save money while traveling?",
                "Best value accommodations?",
                "Free activities in your destination?"
            ]
        elif any(word in message_lower for word in ["flight", "flights", "fly", "airline"]):
            return [
                "When do you want to travel?",
                "Any preferred airlines?",
                "Direct flights or connections OK?",
                "What about hotels at your destination?"
            ]
        elif any(word in message_lower for word in ["hotel", "accommodation", "stay", "lodging"]):
            return [
                "What's your preferred hotel style?",
                "Location preferences in the city?",
                "Any specific amenities needed?",
                "What about activities nearby?"
            ]
        elif any(word in message_lower for word in ["activity", "activities", "things to do", "attractions"]):
            return [
                "Indoor or outdoor activities?",
                "Cultural or adventure experiences?",
                "Day trips or city exploration?",
                "What's the local weather like?"
            ]
        elif any(word in message_lower for word in ["weather", "climate", "temperature"]):
            return [
                "Best time to visit your destination?",
                "What to pack for the weather?",
                "Indoor backup activities?",
                "Seasonal events and festivals?"
            ]
        else:
            return [
                "Tell me about your dream destination",
                "What's your travel budget?",
                "How many days for your trip?",
                "Any specific interests or preferences?"
            ]
    
    def _generate_fallback_response(self, message: str) -> str:
        """Generate rule-based responses when AI is not available"""
        message_lower = message.lower()
        
        # Check if this is a travel preferences message from the form
        if "travel preferences are:" in message_lower or ("destination" in message_lower and "budget" in message_lower and "start date" in message_lower):
            return "Perfect! I've received your travel preferences. Let me analyze your requirements and create a personalized travel plan for you. Based on your preferences, I'll suggest the best flights, accommodations, activities, and create a detailed itinerary that fits your budget and travel style."
        
        # Greeting responses
        if any(word in message_lower for word in ["hello", "hi", "hey", "greetings"]):
            return "Hello! I'm your AI travel assistant. I can help you plan amazing trips! Where would you like to go?"
        
        # Destination queries
        elif any(word in message_lower for word in ["destination", "where", "place", "country", "city"]):
            return "I can help you find the perfect destination! What type of experience are you looking for - adventure, relaxation, culture, or something else?"
        
        # Budget queries
        elif any(word in message_lower for word in ["budget", "cost", "money", "expensive", "cheap"]):
            return "I can help you plan within your budget! What's your total budget and how many days are you planning to travel?"
        
        # Activity queries
        elif any(word in message_lower for word in ["activity", "activities", "things to do", "attractions"]):
            if context and context.current_location:
                return "I can suggest amazing activities! I can show you what's nearby your current location or help you explore activities in your travel destination. What are your interests? (culture, adventure, food, nature, etc.)"
            else:
                return "I can suggest amazing activities! What are your interests? (culture, adventure, food, nature, etc.)"
        
        # Weather queries
        elif any(word in message_lower for word in ["weather", "climate", "temperature"]):
            return "I can check the weather for your destination! Which city are you interested in?"
        
        # Flight queries
        elif any(word in message_lower for word in ["flight", "flights", "fly", "airline"]):
            return "I'd love to help you find flights! What's your departure city and destination?"
        
        # Hotel queries
        elif any(word in message_lower for word in ["hotel", "accommodation", "stay", "lodging"]):
            return "I can help you find great accommodations! What's your preferred location and any specific amenities you need?"
        
        # Planning queries
        elif any(word in message_lower for word in ["plan", "itinerary", "schedule"]):
            return "I love to create personalized itineraries! Please tell me: destination, dates, budget, and your interests."
        
        else:
            return "I'm here to help you plan the perfect trip! You can ask me about flights, hotels, activities, weather, destinations, or budget planning. What would you like to explore?"
    
    def _generate_basic_suggestions(self) -> List[str]:
        """Generate basic suggestions when AI is not available"""
        return [
            "Tell me about your dream destination",
            "What's your travel budget?",
            "Find flights for my trip",
            "Suggest activities and attractions"
        ]
    
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
        logger.info(f"Deleted chat session: {session_id}")

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
    response = await manager.ai_manager.process_message(user_id, message, session_id, context)
    
    # Add message to session history
    if session_id:
        await manager.add_message(session_id, {
            "user_message": message,
            "ai_response": response["response"]["content"],
            "timestamp": datetime.now().isoformat()
        })
    
    return response

# Test function
async def test_chat():
    """Test the chat functionality"""
    print("Testing AI Chat System...")
    
    # Test basic functionality
    response = await chat_endpoint("test_user", "Hello, I want to plan a trip to Paris")
    print(f"Response: {response['response']['content']}")
    
    # Test with preferences
    prefs_message = "Travel preferences are: Destination: Tokyo, Budget: $3000, Start Date: 2024-03-15, Duration: 7 days"
    response = await chat_endpoint("test_user", prefs_message)
    print(f"Preferences Response: {response['response']['content']}")

if __name__ == "__main__":
    asyncio.run(test_chat())