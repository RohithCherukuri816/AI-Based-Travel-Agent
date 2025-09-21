"""
AI Travel Planning Agent - Advanced AI Chat Interface
Intelligent chat system for natural language travel planning
"""

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple, Annotated
from dataclasses import dataclass
from enum import Enum

from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

# New LangGraph and core imports
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool as langchain_tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser # Corrected import
from langchain.tools.render import format_tool_to_openai_tool
from langchain.tools import BaseTool

LANGCHAIN_AVAILABLE = True

from config import get_ai_config
from real_apis import WeatherAPI, PlacesAPI, FlightAPI, HotelAPI, WikipediaAPI, EventbriteAPI, get_weather, search_places, get_wikipedia_summary, search_events, get_directions, api_manager # Import the utility functions from real_apis
from models import ChatSession, ChatMessage, User, Trip

# Conditionally import LangGraph prebuilt tools
from langgraph.prebuilt import ToolNode # Corrected import

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIModel(str, Enum):
    """Available AI models"""
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
    current_location: Optional[Dict[str, float]] = None # New field for user's current GPS location
    suggested_places: List[Dict[str, Any]] = None # To track suggested places and prevent duplicates
    conversation_history: List[Dict[str, Any]] = None # To store the conversation history

    def __post_init__(self):
        if self.preferences is None:
            self.preferences = []
        if self.conversation_history is None:
            self.conversation_history = []
        if self.suggested_places is None:
            self.suggested_places = []


def _extract_json(text: str) -> Optional[str]:
    """
    Extracts a JSON object from a string that may contain extra text.
    Handles cases where the JSON is wrapped in markdown code blocks.
    """
    match = re.search(r"```json\n({.*?})\n```", text, re.DOTALL)
    if match:
        return match.group(1)
    
    match = re.search(r"({.*?})", text, re.DOTALL)
    if match:
        return match.group(1)
        
    return None


class AIChatManager:
    """Advanced AI chat manager for travel planning"""

    def __init__(self):
        self.ai_config = get_ai_config()
        # self.weather_api = WeatherAPI()  # No longer directly used
        # self.places_api = PlacesAPI()    # No longer directly used
        # self.flight_api = FlightAPI()    # No longer directly used
        # self.hotel_api = HotelAPI()    # No longer directly used
        self.api_manager = api_manager # Use the global API manager
        self.gemini_model = None
        self._init_ai_clients()
        self.tools = self._create_travel_tools()
        self.agent_graph = self._create_langgraph_agent()

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

    def _inject_location_into_tool_args(self, tool_name: str, tool_args: Dict[str, Any], current_location: Optional[Dict[str, float]]) -> Dict[str, Any]:
        """Helper to inject current_location into tool arguments if not explicitly provided by the LLM."""
        if not current_location:
            return tool_args

        modified_args = tool_args.copy()
        location_str = f"{current_location['lat']},{current_location['lon']}"
        default_city = "Paris" # Our default hardcoded city for Eiffel Tower coordinates

        if tool_name in ["get_current_weather", "search_nearby_places", "search_local_events"]:
            if "location" not in modified_args or not modified_args["location"]:
                modified_args["location"] = location_str # Prioritize coordinates for direct use
                if tool_name in ["get_current_weather", "search_local_events"] and "city_name" not in modified_args:
                    modified_args["city_name"] = default_city # Provide a city name fallback/alternative
        elif tool_name == "get_travel_directions":
            if "origin" not in modified_args or modified_args["origin"].lower() in ["my current location", "here"]:
                modified_args["origin"] = location_str
        
        return modified_args

    def _create_travel_tools(self) -> List[BaseTool]:
        """Create travel planning tools for the AI agent"""
        
        @langchain_tool
        async def get_current_weather(location: Optional[str] = None, current_location: Optional[Dict[str, float]] = None) -> str:
            """Get current weather and forecast for a destination. If no location is provided, it uses the user's current location from context."""
            target_location = location
            if not target_location and current_location:
                target_location = f"{current_location['lat']},{current_location['lon']}"

            if not target_location:
                return "Please provide a location to get weather information."

            weather_data = await self.api_manager.get_weather(target_location)
            if weather_data and weather_data.current:
                return f"Current weather in {target_location}: {weather_data.current.get('description', 'Unknown')}, Temperature: {weather_data.current.get('temperature')}°C."
            return f"Could not retrieve weather for {target_location}."

        @langchain_tool
        async def search_nearby_places(query: str, location: Optional[str] = None, type: Optional[str] = None, current_location: Optional[Dict[str, float]] = None) -> str:
            """Search for attractions, restaurants, and activities in a destination. If no location is provided, it uses the user's current location from context."""
            target_location = location
            if not target_location and current_location:
                target_location = f"{current_location['lat']},{current_location['lon']}"

            if not target_location:
                return "Please provide a location to search for places."

            places = await self.api_manager.search_places(query=query, location=target_location, type=type)
            if places:
                return json.dumps([p.__dict__ for p in places])
            return f"No places found for {query} in {target_location}."

        @langchain_tool
        async def get_place_details(place_id: str) -> str:
            """Get detailed information about a specific place using its ID."""
            details = await self.api_manager.places_api._get_place_details(place_id) # Direct access for now
            return json.dumps(details)

        @langchain_tool
        async def get_cultural_historical_context(title: str) -> str:
            """Get cultural and historical context for a place from Wikipedia."""
            article = await self.api_manager.wikipedia_api.get_summary(title)
            if article:
                return article.summary
            return f"No cultural or historical context found for {title}."

        @langchain_tool
        async def search_local_events(location: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None, query: Optional[str] = None, categories: Optional[List[str]] = None, current_location: Optional[Dict[str, float]] = None) -> str:
            """Search for local events using Eventbrite API. If no location is provided, it uses the user's current location from context."""
            target_location = location
            if not target_location and current_location:
                target_location = f"{current_location['lat']},{current_location['lon']}"

            if not target_location:
                return "Please provide a location to search for events."

            events = await self.api_manager.eventbrite_api.search_events(target_location, start_date, end_date, query, categories)
            if events:
                return json.dumps([e.__dict__ for e in events])
            return f"No events found for {target_location}."

        @langchain_tool
        async def get_travel_directions(origin: str, destination: str, mode: str = "walking", current_location: Optional[Dict[str, float]] = None) -> str:
            """Get travel directions between two points (e.g., 'Eiffel Tower' to 'Louvre Museum') with specified travel mode (walking, driving, bicycling, transit). If origin is 'my current location' or similar, it uses the user's current location from context."""
            actual_origin = origin
            if origin.lower() in ["my current location", "here"] and current_location:
                actual_origin = f"{current_location['lat']},{current_location['lon']}"

            route = await self.api_manager.places_api.get_directions(actual_origin, destination, mode)
            if route:
                return json.dumps(route.__dict__)
            return f"Could not find {mode} directions from {actual_origin} to {destination}."

        @langchain_tool
        async def find_flights(origin: str, destination: str, departure_date: str, return_date: Optional[str] = None, adults: int = 1) -> str:
            """Search for flight options between airports"""
            flights = await self.api_manager.search_flights(origin, destination, departure_date, return_date, adults)
            if flights:
                return json.dumps([f.__dict__ for f in flights])
            return "Flight search functionality is available. Please provide origin, destination, and dates."

        @langchain_tool
        async def find_hotels(destination: str, check_in: str, check_out: str, adults: int = 1) -> str:
            """Search for hotel accommodations in a destination"""
            hotels = await self.api_manager.search_hotels(destination, check_in, check_out, adults)
            if hotels:
                return json.dumps([h.__dict__ for h in hotels])
            return "Hotel search functionality is available. Please provide destination, dates, and preferences."

        @langchain_tool
        def calculate_budget(query: str) -> str:
            """Calculate estimated costs for different travel components"""
            return "I can help you estimate travel costs."

        @langchain_tool
        def plan_itinerary(query: str) -> str:
            """Create a day-by-day itinerary based on preferences and constraints"""
            return "I can create a personalized itinerary for you!"

        return [get_current_weather, search_nearby_places, get_cultural_historical_context, search_local_events, get_travel_directions, find_flights, find_hotels, calculate_budget, plan_itinerary]


    def _create_langgraph_agent(self):
        """Initialize the LangGraph agent"""
        if not LANGCHAIN_AVAILABLE:
            return None

        llm = ChatGoogleGenerativeAI(
            model=self.ai_config["google"]["model"],
            google_api_key=self.ai_config["google"]["api_key"]
        )
        logger.info("ChatGoogleGenerativeAI client initialized for LangGraph.")

        system_prompt = """
        You are a friendly, knowledgeable tourist guide. Your primary goal is to recommend attractions, restaurants, and activities based on the user's current location, preferences, and weather.
        **ALWAYS use the user's current location from the chat context for any location-based queries or tool calls.** Do not ask for the location if it is already provided in the context.
        
        **IMPORTANT: You MUST use the available tools to get information for the user's requests.**
        - For questions about attractions or places of interest, use the `search_nearby_places` tool.
        - For restaurant suggestions or food-related queries, use the `search_nearby_places` tool with `type="restaurant"`.
        - For weather information, use the `get_current_weather` tool.
        - For local events, use the `search_local_events` tool.
        - For directions or routes, use the `get_travel_directions` tool.
        - For cultural or historical context about a specific place, use the `get_cultural_historical_context` tool.

        Always include cultural insights, history, or fun facts.
        When providing recommendations, present them in a structured JSON format with the following sections: Attractions, Food, Events, Weather Tip, Suggested Route. **Ensure these sections are populated with relevant information gathered from tool calls.**
        If you suggest a route, include estimated distance and duration. If cultural context is available, weave it into the attraction descriptions.
        Ensure all JSON output is valid and properly escaped.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("placeholder", "{messages}")
        ])

        llm_with_tools = llm.bind(
            tools=[format_tool_to_openai_tool(t) for t in self.tools]
        )
        
        # New State for LangGraph
        class AgentState(Dict[str, Any]):
            messages: Annotated[List[BaseMessage], add_messages]
            current_location: Optional[Dict[str, float]] = None # Add current_location to the agent state
            
        # tool_executor = ToolExecutor(self.tools) # Removed ToolExecutor
        tool_node = ToolNode(self.tools)

        def call_llm_node(state: AgentState):
            messages = state["messages"]
            current_location = state.get("current_location")
            
            if current_location:
                # Make the SystemMessage very explicit about using the location for tool calls
                location_str = f"{current_location['lat']},{current_location['lon']}"
                location_message = SystemMessage(content=f"""
                The user's current precise current location is: {location_str}. 
                **ALWAYS** use this precise location (e.g., "{location_str}") for any tool calls that require a 'location' or 'origin' argument and the user's query implies 'near me' or doesn't specify a different location.
                
                Remember to populate the JSON sections (Attractions, Food, Events, Weather Tip, Suggested Route) with actual content gathered from tool calls, not just leave them empty.
                """)
                messages = [location_message] + messages
            
            response = llm_with_tools.invoke(messages)
            return {"messages": [response]}

        def call_tool_node(state: AgentState):
            # The ToolNode itself handles the execution based on the last message's tool_calls
            # We need to ensure that tools that require location can access it from the state.
            # This might require modifying ToolNode's behavior or passing it explicitly if tools are invoked manually.
            last_message = state["messages"][-1]
            current_location = state.get("current_location")
            
            if last_message.tool_calls:
                modified_tool_calls = []
                for tool_call in last_message.tool_calls:
                    # Inject current_location into tool arguments
                    modified_args = self._inject_location_into_tool_args(
                        tool_call["name"],
                        tool_call["args"],
                        current_location
                    )
                    modified_tool_calls.append({"name": tool_call["name"], "args": modified_args, "id": tool_call["id"]}) # Include the 'id'
                
                # Create a new message with modified tool calls for the ToolNode
                modified_message = AIMessage(content="", tool_calls=modified_tool_calls)
                state["messages"] = state["messages"][:-1] + [modified_message] # Replace original message

            return tool_node.invoke(state)

        def should_continue(state: AgentState):
            last_message = state["messages"][-1]
            if not last_message.tool_calls:
                return "end"
            return "continue"

        # Build the graph
        workflow = StateGraph(AgentState)
        workflow.add_node("llm", call_llm_node)
        workflow.add_node("tool", call_tool_node)
        
        workflow.add_edge("tool", "llm")
        workflow.set_entry_point("llm")
        workflow.add_conditional_edges("llm", should_continue, {"continue": "tool", "end": END})
        
        logger.info("LangGraph agent created successfully.")
        return workflow.compile()

    async def process_message(self, user_id: str, message: str, session_id: Optional[str] = None, context: Optional[ChatContext] = None) -> Dict[str, Any]:
        """Process user message and generate AI response"""
        try:
            if context is None:
                context = await self._get_or_create_context(user_id, session_id)

            user_message_obj = HumanMessage(content=message)

            # Use LangGraph to invoke the agent
            if self.agent_graph:
                inputs = {"messages": [user_message_obj], "current_location": context.current_location}
                result = await self.agent_graph.ainvoke(inputs, config={"recursion_limit": 50})
                ai_response_obj = result["messages"][-1]
                
                response_content = ai_response_obj.content
                
                # Format the AI's response into structured JSON
                formatted_response = await self._format_ai_response(response_content, context)
                
                response = {
                    "content": json.dumps(formatted_response), # Serialize to JSON string for frontend
                    "type": "travel_planning",
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": []
                }
            else:
                # Fallback to simple intent analysis if LangGraph is not available
                intent = await self._analyze_intent(message, context)
                if intent["type"] == "travel_planning":
                    response = await self._handle_travel_planning(message, context)
                else:
                    response = await self._generate_general_response(message, context)


            context.conversation_history.append({"role": "user", "content": message, "timestamp": datetime.utcnow().isoformat()})
            context.conversation_history.append({"role": "assistant", "content": response.get("content", "I am unable to generate a response at this time."), "timestamp": datetime.utcnow().isoformat()})
            
            await self._save_chat_session(user_id, session_id, context, user_message_obj, ai_response_obj)

            return {"success": True, "response": response, "context": context}
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {"success": False, "error": str(e), "response": {"content": "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.", "type": "error"}}


    async def _format_ai_response(self, raw_response: str, context: ChatContext) -> Dict[str, Any]:
        """Formats the AI's raw response into a structured JSON output."""
        # This is a complex task that would ideally involve the LLM itself
        # For now, let's try to extract and structure common elements.
        # In a more advanced scenario, we might use a tool call from the LLM
        # to explicitly generate this JSON structure.

        structured_output = {
            "Attractions": [],
            "Food": [],
            "Events": [],
            "Weather Tip": "",
            "Suggested Route": {}
        }

        # Try to parse any JSON embedded in the raw response first
        json_match = re.search(r'```json\n(.*?)```', raw_response, re.DOTALL)
        if json_match:
            try:
                parsed_json = json.loads(json_match.group(1))
                # If the LLM directly provides the structure, use it
                if all(key in parsed_json for key in structured_output.keys()):
                    return parsed_json
            except json.JSONDecodeError:
                pass # Fallback to regex-based extraction

        # Fallback to regex-based extraction and heuristics
        # This part would need significant refinement to be robust.

        # Example: Extracting attractions
        attractions_match = re.findall(r'Attractions:\n- (.*?)(?=\n- |\nFood:|\nEvents:|\nWeather Tip:|\nSuggested Route:|$)', raw_response, re.DOTALL)
        structured_output["Attractions"] = [a.strip() for a in attractions_match if a.strip()]

        # Example: Extracting food (restaurants)
        food_match = re.findall(r'Food:\n- (.*?)(?=\n- |\nEvents:|\nWeather Tip:|\nSuggested Route:|$)', raw_response, re.DOTALL)
        structured_output["Food"] = [f.strip() for f in food_match if f.strip()]

        # Example: Extracting events
        events_match = re.findall(r'Events:\n- (.*?)(?=\n- |\nWeather Tip:|\nSuggested Route:|$)', raw_response, re.DOTALL)
        structured_output["Events"] = [e.strip() for e in events_match if e.strip()]

        # Example: Extracting weather tip
        weather_tip_match = re.search(r'Weather Tip: (.*?)(?=\nAttractions:|\nFood:|\nEvents:|\nSuggested Route:|$)', raw_response, re.DOTALL)
        if weather_tip_match:
            structured_output["Weather Tip"] = weather_tip_match.group(1).strip()

        # Example: Extracting suggested route
        route_match = re.search(r'Suggested Route: (.*?)(?=\nAttractions:|\nFood:|\nEvents:|\nWeather Tip:|$)', raw_response, re.DOTALL)
        if route_match:
            route_info = route_match.group(1).strip()
            # Further parse route_info if needed to extract distance, duration, steps
            structured_output["Suggested Route"] = {"description": route_info}

        # If no specific sections were extracted, put the whole response into a general content field
        if not any(structured_output.values()) and "General Content" not in structured_output:
            structured_output["General Content"] = raw_response

        return structured_output


    # The following methods are for fallback and are not used by the new LangGraph agent
    async def _analyze_intent(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Analyze user intent and extract key entities for travel planning. This is the fallback if LangGraph is not enabled."""
        # If a real LLM is available, use it for more sophisticated intent analysis.
        if self.gemini_model:
            prompt = """You are an AI assistant. Analyze the following user message to determine their intent.
            Extract the 'type' of intent (e.g., 'travel_planning', 'general_query', 'weather_query', 'place_search', 'event_search', 'directions_query').
            If the intent is 'travel_planning', extract 'destination', 'start_date', 'duration', 'budget', 'preferences' (list of keywords).
            If the intent is 'weather_query', extract 'location'.
            If the intent is 'place_search', extract 'query', 'location', and 'type' (e.g., 'restaurant', 'attraction').
            If the intent is 'event_search', extract 'location', 'start_date', 'end_date', 'query', 'categories'.
            If the intent is 'directions_query', extract 'origin', 'destination', 'mode'.
            Return the output as a JSON object.

            Example Input: "Plan a 5-day trip to Paris with a budget of 2000 for luxury travel including food and art."
            Example Output: {"type": "travel_planning", "destination": "Paris", "duration": 5, "budget": 2000, "preferences": ["luxury", "food", "art"]}

            Example Input: "What's the weather like in London next week?"
            Example Output: {"type": "weather_query", "location": "London", "date_range": "next week"}

            Example Input: "Show me good restaurants in Tokyo."
            Example Output: {"type": "place_search", "query": "good restaurants", "location": "Tokyo", "type": "restaurant"}

            Example Input: "Are there any concerts in New York this weekend?"
            Example Output: {"type": "event_search", "location": "New York", "start_date": "this weekend", "categories": ["concerts"]}

            Example Input: "How do I get from the Eiffel Tower to the Louvre by walking?"
            Example Output: {"type": "directions_query", "origin": "Eiffel Tower", "destination": "Louvre", "mode": "walking"}

            User message: {message}
            """
            response = await self.gemini_model.generate_content(prompt.format(message=message))
            
            try:
                json_output = _extract_json(response.text)
                if json_output:
                    return json.loads(json_output)
            except json.JSONDecodeError:
                logger.warning(f"Could not parse intent JSON: {response.text}")
        return self._simple_intent_analysis(message)

    async def _handle_travel_planning(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Handle travel planning requests based on parsed intent. This is the fallback if LangGraph is not enabled."""
        intent = await self._analyze_intent(message, context)
        response_content = ""
        suggestions = []
        next_steps = []

        if intent["type"] == "weather_query" and intent.get("location"):
            weather_data = await self.api_manager.get_weather(intent["location"])
            if weather_data and weather_data.current:
                response_content = f"Current weather in {intent['location']}: {weather_data.current.get('description', 'Unknown')}, Temperature: {weather_data.current.get('temperature')}°C."
            else:
                response_content = f"Could not retrieve weather for {intent['location']}."
            suggestions = ["Plan a trip", "Search for attractions"]
        elif intent["type"] == "place_search" and intent.get("query") and intent.get("location"):
            places = await self.api_manager.search_places(query=intent["query"], location=intent["location"], type=intent.get("type"))
            if places:
                place_names = ", ".join([p.name for p in places[:3]])  # Limit to 3 for brevity
                response_content = f"Found some {intent.get('type', 'places')} for \"{intent['query']}\" in {intent['location']}: {place_names}."
            else:
                response_content = f"No {intent.get('type', 'places')} found for \"{intent['query']}\" in {intent['location']}."
            suggestions = ["Get details for a place", "Plan a route"]
        elif intent["type"] == "event_search" and intent.get("location"):
            events = await self.api_manager.search_events(location=intent["location"], start_date=intent.get("start_date"), end_date=intent.get("end_date"), query=intent.get("query"), categories=intent.get("categories"))
            if events:
                event_names = ", ".join([e.name for e in events[:3]])
                response_content = f"Found some events in {intent['location']}: {event_names}."
            else:
                response_content = f"No events found for {intent['location']}."
            suggestions = ["Find events near me", "Search attractions"]
        elif intent["type"] == "directions_query" and intent.get("origin") and intent.get("destination"):
            route = await self.api_manager.places_api.get_directions(intent["origin"], intent["destination"], intent.get("mode", "walking"))
            if route:
                response_content = f"Here's a {route.travel_mode} route from {route.origin.get('lat')},{route.origin.get('lng')} to {route.destination.get('lat')},{route.destination.get('lng')}. Distance: {route.distance}, Duration: {route.duration}."
            else:
                response_content = f"Could not find directions from {intent['origin']} to {intent['destination']}."
            suggestions = ["Find nearby attractions", "Plan a full itinerary"]
        elif intent["type"] == "travel_planning":
            response_content = "I'm excited to help you plan your trip! Let me know your destination, dates, and preferences, and I'll create an amazing itinerary for you."
            suggestions = await self._generate_travel_suggestions(context)
            next_steps = self._get_next_steps("travel_planning")
        else:
            response_content = "I'm here to help with travel planning. Could you please provide more details?"
            suggestions = ["Plan a new trip", "Get destination inspiration"]

        return {
            "content": response_content,
            "type": intent["type"],
            "suggestions": suggestions,
            "next_steps": next_steps
        }
    
    async def _generate_general_response(self, message: str, context: ChatContext) -> Dict[str, Any]:
        """Generate general conversational response using AI. This is the fallback if LangGraph is not enabled."""
        if self.gemini_model:
            prompt = """You are a helpful AI assistant. Respond to the user's message in a friendly and concise manner.
            User message: {message}
            """
            response = await self.gemini_model.generate_content(prompt.format(message=message))
            response_content = response.text
        else:
            response_content = "Hello! I'm here to help with your travel planning. How can I assist you today?"

        return {
            "content": response_content,
            "type": "general",
            "suggestions": ["Plan a trip", "Ask travel questions", "Explore destinations"],
            "next_steps": []
        }

    def _simple_intent_analysis(self, message: str) -> Dict[str, Any]:
        """Simple keyword-based intent analysis fallback (if no LLM or LangGraph)."""
        message_lower = message.lower()
        if any(keyword in message_lower for keyword in ["weather"]):
            return {"type": "weather_query", "location": "Unknown"}
        if any(keyword in message_lower for keyword in ["restaurant", "food", "eat"]):
            return {"type": "place_search", "query": message_lower, "type": "restaurant"}
        if any(keyword in message_lower for keyword in ["attraction", "see", "visit", "do"]):
            return {"type": "place_search", "query": message_lower, "type": "attraction"}
        if any(keyword in message_lower for keyword in ["event", "concert", "show"]):
            return {"type": "event_search", "query": message_lower}
        if any(keyword in message_lower for keyword in ["how to get", "directions", "route"]):
            return {"type": "directions_query", "origin": "Unknown", "destination": "Unknown"}
        travel_keywords = ["plan", "trip", "itinerary", "schedule", "visit", "go to"]
        if any(keyword in message_lower for keyword in travel_keywords):
            return {"type": "travel_planning"}
        return {"type": "general"}
    
    async def _generate_travel_suggestions(self, context: ChatContext) -> List[str]:
        all_suggestions = [
            "What are the top attractions near me?",
            "Suggest some local restaurants.",
            "Are there any interesting events happening today?",
            "What's the weather like for the next 3 days?",
            "Plan a 3-hour walking tour starting from my current location.",
            "Tell me a fun fact about this area."
        ]
        
        # Filter out suggestions for places already suggested/visited (simplified check for now)
        filtered_suggestions = []
        suggested_place_names = {place.get("name") for place in context.suggested_places}
        
        for suggestion in all_suggestions:
            # A very basic check - ideally this would be more intelligent
            if not any(name in suggestion for name in suggested_place_names):
                filtered_suggestions.append(suggestion)
                
        return filtered_suggestions or all_suggestions[:3] # Ensure some suggestions are always returned

    def _get_next_steps(self, intent_type: str) -> List[str]:
        if intent_type == "travel_planning":
            return ["Choose destination", "Set travel dates", "Define budget", "Select travel style"]
        return []

    # Context management
    async def _get_or_create_context(self, user_id: str, session_id: Optional[str] = None, current_location: Optional[Dict[str, float]] = None) -> ChatContext:
        # For now, we'll use a default location if not provided. This should be replaced with
        # logic for real GPS location fetching
        # In a real app, this would come from the frontend or a mobile API
        if current_location is None:
            current_location = {"lat": 48.8584, "lon": 2.2945}  # Default to Eiffel Tower, Paris for testing
        return ChatContext(user_id=user_id, trip_id=session_id, preferences=["culture", "food", "adventure"], travelers_count=2, current_location=current_location, suggested_places=[], conversation_history=[])
    
    async def _save_chat_session(
        self,
        user_id: str,
        session_id: Optional[str],
        context: ChatContext,
        user_message: HumanMessage,
        ai_response: AIMessage,
    ):
        try:
            # In a real application, you would save this to a database
            # For now, we'll just log it.
            logger.info(f"Saving chat session for user {user_id}, session {session_id}")

            # Save user message
            user_chat_message = ChatMessage(
                session_id=session_id,
                role="user",
                content=user_message.content,
                trip_metadata=context.__dict__,  # Store context as metadata for user message
            )

            # Save AI response
            ai_chat_message = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=ai_response.content,
                trip_metadata=context.__dict__,  # Store context as metadata for AI response
            )

            # This would typically be saved to a database, e.g., using an ORM
            # print(f"Saved user message: {user_chat_message}")
            # print(f"Saved AI response: {ai_chat_message}")
            pass
        except Exception as e:
            logger.error(f"Error saving chat session for user {user_id}, session {session_id}: {e}")
            raise # Re-raise the exception to propagate it

    async def get_chat_history(
        self, user_id: str, session_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        try:
            # In a real application, you would retrieve history from a database
            logger.info(
                f"Retrieving chat history for user {user_id}, session {session_id}"
            )
            return []
        except Exception as e:
            logger.error(f"Error retrieving chat history for user {user_id}, session {session_id}: {e}")
            raise # Re-raise the exception to propagate it

    async def create_new_session(
        self, user_id: str, trip_id: Optional[str] = None
    ) -> str:
        try:
            session_id = f"session_{user_id}_{datetime.utcnow().timestamp()}"
            logger.info(
                f"Created new chat session: {session_id} for user {user_id}"
            )
            return session_id
        except Exception as e:
            logger.error(f"Error creating new session for user {user_id}: {e}")
            raise # Re-raise the exception to propagate it


class ChatSessionManager:
    """Manages chat sessions and user interactions"""

    def __init__(self):
        self.ai_manager = AIChatManager()
        self.active_sessions: Dict[str, ChatContext] = {}

    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        try:
            session_id = await self.ai_manager.create_new_session(user_id, trip_id)
            # Initialize ChatContext with default or provided values, including new fields
            context = ChatContext(
                user_id=user_id,
                trip_id=trip_id,
                preferences=["culture", "food", "adventure"],
                travelers_count=1,
                current_location=None,  # Initially None, expects frontend to provide
                suggested_places=[],  # Initialize as empty list
                conversation_history=[],  # Initialize as empty list
            )
            self.active_sessions[session_id] = context
            logger.info(f"Session {session_id} started successfully for user {user_id}")
            return session_id
        except Exception as e:
            logger.error(f"Error in start_session for user {user_id}: {e}")
            raise # Re-raise the exception to propagate it

    async def send_message(self, user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        if session_id is None:
            session_id = await self.start_session(user_id)
        
        context = self.active_sessions.get(session_id)
        if context is None:
            # If session context is not found, create a new one with default values
            context = ChatContext(
                user_id=user_id,
                current_location=None, # Expects frontend to provide
                suggested_places=[],
                conversation_history=[] # Initialize as empty list
            )
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