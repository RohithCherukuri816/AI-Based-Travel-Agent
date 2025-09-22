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
from uuid import UUID # Added for database operations
from pydantic import BaseModel # Import BaseModel
import uuid # Import the uuid module

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
from models import ChatSession, ChatMessage, User, Trip, Booking, Review
from database import SessionLocal, get_db, init_db # Import database utilities

# Conditionally import LangGraph prebuilt tools
from langgraph.prebuilt import ToolNode # Corrected import

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIModel(str, Enum):
    """Available AI models"""
    GEMINI_PRO = "gemini-pro"


class ChatContext(BaseModel):
    """Chat context and user preferences"""
    session_id: Optional[str] = None # Added session_id
    user_id: str
    trip_id: Optional[str] = None
    current_destination: Optional[str] = None
    travel_style: Optional[str] = None
    budget_tier: Optional[str] = None # Changed from budget_range to budget_tier (string)
    preferences: List[str] = [] # Initialize as empty list
    travelers_count: int = 1
    trip_duration: Optional[int] = None
    language: str = "en"
    current_location: Optional[Dict[str, float]] = None # New field for user's current GPS location
    suggested_places: List[Dict[str, Any]] = [] # To track suggested places and prevent duplicates
    conversation_history: List[Dict[str, Any]] = [] # To store the conversation history
    
    # New fields for detailed requirement gathering
    destination_type: List[str] = [] # Changed to List[str]
    purpose: List[str] = [] # Changed to List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    accommodation_type: List[str] = [] # Changed to List[str]
    transport_mode: List[str] = [] # Changed to List[str]
    special_needs: List[str] = [] # dietary restrictions, accessibility needs

    def __post_init__(self):
        if self.preferences is None:
            self.preferences = []
        if self.conversation_history is None:
            self.conversation_history = []
        if self.suggested_places is None:
            self.suggested_places = []
        if self.special_needs is None:
            self.special_needs = []


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
        init_db() # Initialize the database when AIChatManager is instantiated
        # Tools are initialized in __init__ and are available via self.tools
        # However, for direct invocation, we need a helper method
        self.tools_by_name = {tool.name: tool for tool in self.tools}

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
        async def calculate_budget(user_id: str, destination: str, num_travelers: int, duration: int, budget_tier: str, accommodation_type: str, transport_mode: str) -> str:
            """Calculate an estimated budget for a trip based on destination, number of travelers, duration (in days), budget tier (Budget, Standard, Luxury), accommodation type, and transport mode.
            The calculation is simulated as per requirements.
            """
            # Ensure budget_tier is one of the allowed values, default to "Standard" if not valid
            valid_budget_tiers = ["Budget", "Standard", "Luxury"]
            if budget_tier not in valid_budget_tiers:
                logger.warning(f"Invalid budget_tier provided: {budget_tier}. Defaulting to 'Standard'.")
                budget_tier = "Standard"

            base_costs = {
                "flight": 300, # Per person, one-way base
                "accommodation_per_night": 80, # Per person
                "meals_per_day": 50, # Per person
                "activities_per_day": 70, # Per person
                "insurance": 30, # Per person
                "taxes_fees_per_day": 20 # Per person
            }
            
            tier_multipliers = {
                "budget": {"flight": 0.7, "accommodation_per_night": 0.6, "meals_per_day": 0.5, "activities_per_day": 0.6, "insurance": 1.0, "taxes_fees_per_day": 1.0},
                "standard": {"flight": 1.0, "accommodation_per_night": 1.0, "meals_per_day": 1.0, "activities_per_day": 1.0, "insurance": 1.0, "taxes_fees_per_day": 1.0},
                "luxury": {"flight": 1.5, "accommodation_per_night": 2.0, "meals_per_day": 2.0, "activities_per_day": 1.5, "insurance": 1.2, "taxes_fees_per_day": 1.2},
            }
            
            selected_multiplier = tier_multipliers.get(budget_tier.lower(), tier_multipliers["standard"])
            
            total_flight_cost = base_costs["flight"] * num_travelers * 2 * selected_multiplier["flight"] # Round trip
            total_accommodation_cost = base_costs["accommodation_per_night"] * num_travelers * duration * selected_multiplier["accommodation_per_night"]
            total_meals_cost = base_costs["meals_per_day"] * num_travelers * duration * selected_multiplier["meals_per_day"]
            total_activities_cost = base_costs["activities_per_day"] * num_travelers * duration * selected_multiplier["activities_per_day"]
            total_insurance_cost = base_costs["insurance"] * num_travelers * selected_multiplier["insurance"]
            total_taxes_fees_cost = base_costs["taxes_fees_per_day"] * num_travelers * duration * selected_multiplier["taxes_fees_per_day"]
            
            total_estimated_cost = sum([
                total_flight_cost,
                total_accommodation_cost,
                total_meals_cost,
                total_activities_cost,
                total_insurance_cost,
                total_taxes_fees_cost
            ])
            
            cost_breakdown = {
                "destination": destination,
                "num_travelers": num_travelers,
                "duration": duration,
                "budget_tier": budget_tier,
                "breakdown": {
                    "transport_mode": transport_mode,
                    "flights": round(total_flight_cost, 2),
                    "accommodation_type": accommodation_type,
                    "accommodation": round(total_accommodation_cost, 2),
                    "meals": round(total_meals_cost, 2),
                    "activities": round(total_activities_cost, 2),
                    "insurance": round(total_insurance_cost, 2),
                    "taxes_fees": round(total_taxes_fees_cost, 2)
                },
                "total_estimated_cost": round(total_estimated_cost, 2)
            }
            
            return json.dumps(cost_breakdown, indent=2)

        @langchain_tool
        async def simulate_booking(user_id: str, trip_id: str, booking_details: str) -> str:
            """Simulate booking for a trip and generate a booking ID and confirmation.
            The booking_details should be a JSON string representing the finalized itinerary or selected booking components.
            """
            # In a real application, this would integrate with actual booking APIs.
            # For this simulation, we'll generate a dummy booking ID and confirmation.
            
            try:
                parsed_booking_details = json.loads(booking_details)
            except json.JSONDecodeError:
                return f"Invalid JSON for booking_details: {booking_details}"
                
            with SessionLocal() as db:
                try:
                    new_booking = await self._save_booking_in_db(db, user_id, trip_id, parsed_booking_details)
                    booking_id = str(new_booking.id)
                    confirmation_message = f"Your booking for Trip ID {trip_id} has been confirmed! Your booking ID is {booking_id}.\nDetails: {json.dumps(parsed_booking_details, indent=2)}"
                    
                    booking_confirmation = {
                        "booking_id": booking_id,
                        "trip_id": trip_id,
                        "user_id": user_id,
                        "status": "confirmed",
                        "timestamp": datetime.utcnow().isoformat(),
                        "details": parsed_booking_details
                    }
                    return json.dumps(booking_confirmation, indent=2)
                except Exception as e:
                    logger.error(f"Error saving booking to DB: {e}")
                    return f"Failed to simulate booking due to a database error: {e}"

        @langchain_tool
        async def plan_itinerary(user_id: str, destination: str, start_date: str, end_date: str, preferences: List[str], num_travelers: int, budget: Optional[str] = None) -> str:
            """Create a day-by-day itinerary based on preferences and constraints, including sightseeing, activities, and rest periods. 
            Suggest backup options for weather-sensitive activities. Provide both a JSON and human-readable version.
            """
            # The itinerary generation logic is simulated as per requirements.
            
            itinerary_draft = {
                "destination": destination,
                "start_date": start_date,
                "end_date": end_date,
                "preferences": preferences,
                "num_travelers": num_travelers,
                "budget": budget,
                "days": []
            }
            
            # Determine duration
            start_dt_obj = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt_obj = datetime.strptime(end_date, "%Y-%m-%d")
            duration = (end_dt_obj - start_dt_obj).days + 1

            # Save the trip to the database
            with SessionLocal() as db:
                trip_data = {
                    "title": f"Trip to {destination}",
                    "destination": destination,
                    "start_date": start_date,
                    "end_date": end_date,
                    "duration": duration,
                    "budget": 0.0, # Budget will be calculated later or passed explicitly
                    "travel_style": ", ".join(preferences), # Simple concatenation for now
                    "travelers_count": num_travelers,
                    "metadata": {"preferences": preferences, "initial_budget_tier": budget} # Store full preferences
                }
                new_trip = await self._create_trip_in_db(db, user_id, trip_data)
                trip_id = str(new_trip.id)
                
                # Update the ChatSession with the new trip_id
                chat_session = db.query(ChatSession).filter_by(user_id=UUID(user_id)).order_by(ChatSession.created_at.desc()).first() # Get the latest session
                if chat_session:
                    chat_session.trip_id = UUID(trip_id)
                    db.commit()
                    db.refresh(chat_session)
                    logger.info(f"Updated chat session {chat_session.id} with trip ID {trip_id}.")
                
                # Simulate itinerary generation for the duration
                for i in range(duration):
                    current_date = start_dt_obj + timedelta(days=i)
                    day_data = {
                        "day": i + 1,
                        "date": current_date.isoformat(),
                        "activities": [
                            {"time": "Morning", "description": f"Explore {destination} area.", "type": "sightseeing", "backup_option": "Indoor activity if bad weather."},
                            {"time": "Afternoon", "description": "Lunch at a local eatery.", "type": "food"},
                            {"time": "Evening", "description": "Leisure or cultural experience.", "type": "leisure"}
                        ],
                        "notes": f"Day {i+1} activities in {destination}"
                    }
                    await self._save_itinerary_day_in_db(db, trip_id, day_data)
                    itinerary_draft["days"].append(day_data)
            
            json_output = json.dumps(itinerary_draft, indent=2)
            
            human_readable_output = f"""
            **Here is your drafted itinerary for {destination} from {start_date} to {end_date}:**

            """
            for day_plan in itinerary_draft["days"]:
                human_readable_output += f"**Day {day_plan['day']} ({day_plan['date']}):**\n"
                for activity in day_plan["activities"]:
                    human_readable_output += f"- {activity['time']}: {activity['description']}\n"
                    if "backup_option" in activity:
                        human_readable_output += f"  (Backup: {activity['backup_option']})\n"
                human_readable_output += "\n"
                
            return f"""JSON Itinerary: {json_output}
            Human Readable Itinerary: {human_readable_output}
            """
        
        @langchain_tool
        async def submit_feedback(user_id: str, trip_id: str, rating: int, comments: Optional[str] = None) -> str:
            """Submit post-trip feedback for a trip, including a rating (1-5) and optional comments.
            """
            with SessionLocal() as db:
                try:
                    new_review = await self._save_review_in_db(db, user_id, trip_id, rating, content=comments)
                    return f"Thank you for your feedback! Your review for trip {trip_id} (Rating: {rating}) has been saved. Review ID: {new_review.id}"
                except Exception as e:
                    logger.error(f"Error submitting feedback to DB: {e}")
                    return f"Failed to submit feedback due to a database error: {e}"

        return [get_current_weather, search_nearby_places, get_cultural_historical_context, search_local_events, get_travel_directions, find_flights, find_hotels, calculate_budget, plan_itinerary, simulate_booking, submit_feedback]

    async def run_tool(self, tool_name: str, tool_args: Dict[str, Any], context: ChatContext) -> Any:
        """
        Helper to run a tool by its name and arguments, injecting context if needed.
        This mimics how the ToolNode would execute a tool.
        """
        tool = self.tools_by_name.get(tool_name)
        if not tool:
            raise ValueError(f"Tool {tool_name} not found.")

        # Inject current_location, user_id, and trip_id into tool arguments if missing
        modified_args = self._inject_location_into_tool_args(
            tool_name,
            tool_args,
            context.current_location
        )
        if "user_id" not in modified_args and context.user_id:
            modified_args["user_id"] = context.user_id
        if "trip_id" not in modified_args and context.trip_id:
            modified_args["trip_id"] = context.trip_id

        # Handle special case for 'budget_tier' in calculate_budget tool
        if tool_name == "calculate_budget" and "budget_tier" in modified_args:
            # Ensure budget_tier is one of the allowed values
            allowed_tiers = ["Budget", "Standard", "Luxury"]
            if modified_args["budget_tier"] not in allowed_tiers:
                logger.warning(f"Invalid budget_tier '{modified_args['budget_tier']}'. Defaulting to 'Standard'.")
                modified_args["budget_tier"] = "Standard"

        logger.info(f"Invoking tool: {tool_name} with args: {modified_args}")
        result = await tool.ainvoke(modified_args)
        logger.info(f"Tool {tool_name} returned: {result}")
        return result

    def _create_langgraph_agent(self) -> StateGraph:
        """Create a LangGraph agent with tools."""
        # Define the LLM (Large Language Model) to be used.
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)
        logger.info("ChatGoogleGenerativeAI client initialized for LangGraph.")

        system_prompt = """
        You are an AI-powered travel agent named 'TravelBot'. Your goal is to help users plan their dream trips step by step, replicating the full workflow of a real travel agency.
        
        **Workflow Steps:**
        
        1.  **Requirement Gathering (User Preferences):**
            - Start by greeting the user warmly and introducing yourself as their AI travel agent. 
            - **CRITICAL & HIGH PRIORITY:** If the user provides a comprehensive set of travel preferences in a single message (e.g., from a form submission, which will contain `destination`, `start_date`, `end_date`, `num_travelers`, and `budget` related info), you **MUST IMMEDIATELY AND WITHOUT CONVERSATIONAL INTERVENTION proceed to generate a draft itinerary AND a cost breakdown by calling your tools (`plan_itinerary` and `calculate_budget`).** Your response in this scenario **MUST ONLY CONSIST OF TOOL CALLS.** Do NOT ask for individual details if they are already provided. Do not generate conversational responses if you can call a tool.
            - If information for `plan_itinerary` (destination, start_date, end_date, preferences (derived from destination_type, purpose, accommodation_type, transport_mode), num_travelers) or `calculate_budget` (destination, num_travelers, duration (derived from dates), budget_tier, accommodation_type, transport_mode) is missing, then ask structured questions one by one to gather the *missing* detailed user preferences for their trip. This includes:
                - **Destination (City/Country):** Where do they want to go?
                - **Destination Type:** (e.g., beach, mountains, cultural, adventure, relaxation)
                - **Purpose of Trip:** (e.g., honeymoon, family vacation, business, leisure, solo adventure)
                - **Travel Dates/Duration:** When do they plan to travel? How long will the trip be (number of days)?
                - **Number of Travelers:** How many adults, children, and infants?
                - **Budget Range:** What is their approximate budget (e.g., low, medium, high, or a specific amount)?
                - **Accommodation Type:** (e.g., hotel, resort, hostel, Airbnb, guesthouse)
                - **Preferred Transport Mode:** (e.g., flight, train, car, bus, cruise)
                - **Special Needs/Interests:** Any dietary restrictions, accessibility needs, specific activities, or interests (e.g., historical sites, art, nightlife, nature)?
            - If you ask a question, ask one question at a time and wait for the user's response. Acknowledge their input and then ask the next relevant question.
            - Prioritize gathering all essential information before moving to the next stage.
            - Dynamically update the ChatContext with gathered information.
            
        2.  **Tool Usage and Direct Output (Tool Calls ONLY when Planning):**
            - Once you have enough information to call `plan_itinerary` (requires `destination`, `start_date`, `end_date`, `preferences` (a list of keywords based on destination_type, purpose, accommodation_type, transport_mode), `num_travelers`) AND `calculate_budget` (requires `destination`, `num_travelers`, `duration` (derived from `start_date` and `end_date`), `budget_tier` (must be 'Budget', 'Standard', or 'Luxury'), `accommodation_type`, `transport_mode`), **YOU MUST CALL THESE TOOLS IMMEDIATELY AND DIRECTLY. YOUR RESPONSE MUST BE ONLY THE TOOL CALLS.**
            - **DO NOT engage in conversational turns or ask clarifying questions if all required parameters for `plan_itinerary` AND `calculate_budget` are present in the user's message or the current context.**
            - **Example of immediate tool calls for a full plan (assuming all information is in the message or context):**
              - User provides preferences for a trip to Paris from 2025-09-24 to 2025-10-04 for 2 travelers, Standard budget, Hotel, Flying, Cultural & Food preferences.
              - Your expected action (two sequential tool calls, no other text):
                `call:plan_itinerary(destination="Paris", start_date="2025-09-24", end_date="2025-10-04", preferences=["Cultural", "Food", "Hotel", "Flight"], num_travelers=2)`
                `call:calculate_budget(destination="Paris", num_travelers=2, duration=11, budget_tier="Standard", accommodation_type="Hotel", transport_mode="Flight")`
            - If `plan_itinerary` or `calculate_budget` is called, the system will format their outputs for the user. Your role is to ensure these tools are called promptly and correctly with all extracted parameters.
            - Use `get_current_weather` for weather conditions if a location and date is provided.
            - Use `search_nearby_places` for attractions, restaurants, and activities if a location and query is provided.
            - Use `get_cultural_historical_context` for background information if a place is provided.
            - Use `search_local_events` for events in the destination if a location and date is provided.
            - Use `get_travel_directions` for route planning if an origin and destination are provided.
            - Use `find_flights` and `find_hotels` to explore travel and accommodation options if requested and parameters are available.
            - Present a few diverse options to the user and ask for their preferences if *after* initial planning, more research is needed or specific options are requested.
            
        3.  **Draft Itinerary Creation:**
            - After gathering preferences and researching options, use the `plan_itinerary` tool to create a day-wise itinerary.
            - Ensure the itinerary includes sightseeing, activities, and rest periods, suggesting backup options for weather-sensitive activities.
            - Provide both a human-readable summary and the full JSON output (if requested or for system use).
            
        4.  **Costing & Package Generation:**
            - Use the `calculate_budget` tool to provide a detailed cost breakdown based on transport, accommodation, meals, activities, insurance, and taxes.
            - Offer different tiers: Budget, Standard, Luxury, and ask the user to choose.
            
        5.  **Customization & Feedback:**
            - Allow the user to modify preferences (e.g., upgrade hotel, remove an activity, adjust dates).
            - Dynamically re-generate the plan using your tools and LLM capabilities based on their feedback.
            
        6.  **Booking & Confirmation:**
            - Once the user finalizes the plan, use the `simulate_booking` tool to generate a mock booking ID and confirmation. Inform the user of the confirmation.
            
        7.  **During Trip Support (Real-time Guide):**
            - If the user provides their current GPS location (from `context.current_location`):
                - Act as a real-time guide, providing suggestions and information about their immediate location (top attractions, events).
                - Use `get_current_weather` for live weather updates.
                - Use `search_nearby_places` to suggest nearby points of interest.
                - Use `get_travel_directions` for re-routing and navigation assistance.
                - **ALWAYS** use the provided `context.current_location` for location-based tool calls if the user's query implies "near me" or doesn't specify a different location.
            
        8.  **Post-Trip Follow-Up:**
            - After the trip dates have passed, engage the user for feedback (rating and comments) to improve future recommendations.
            
        **General Instructions:**
        - Maintain a friendly, helpful, and professional tone throughout the interaction.
        - Always strive to fulfill the user's request using the most appropriate tools. **Prioritize tool calls over conversational responses if all required arguments are available.**
        - If a tool call is needed, provide the required arguments clearly and accurately based on the user's input. Pay close attention to extracting `duration` from `start_date` and `end_date` for `calculate_budget`, and ensure `budget_tier` is one of 'Budget', 'Standard', or 'Luxury'.
        - When presenting options or information, ensure it is clear, concise, and easy for the user to understand.
        - If you need more information to use a tool, ask specific clarifying questions.
        - Ensure all JSON output is valid and properly escaped.
        - You have access to simulated tools for `plan_itinerary` and `calculate_budget`. Even if other external APIs are not configured, you should still use these simulated tools to generate a response.
        
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
            user_id: str # Add user_id to the agent state
            trip_id: Optional[str] = None # Add trip_id to the agent state
            
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
            user_id = state.get("user_id") # Get user_id from state
            trip_id = state.get("trip_id") # Get trip_id from state
            
            if last_message.tool_calls:
                modified_tool_calls = []
                for tool_call in last_message.tool_calls:
                    # Inject current_location, user_id, and trip_id into tool arguments
                    modified_args = self._inject_location_into_tool_args(
                        tool_call["name"],
                        tool_call["args"],
                        current_location
                    )
                    if "user_id" not in modified_args: modified_args["user_id"] = user_id
                    if "trip_id" not in modified_args: modified_args["trip_id"] = trip_id
                    
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

            # --- Custom Logic to Detect and Directly Invoke Planning Tools ---
            # Check if the message is a comprehensive set of preferences from the form
            if "**destination**" in message and "**start date**" in message and "**end date**" in message and "**num travelers**" in message:
                logger.info("Detected comprehensive travel preferences. Directly invoking planning tools.")
                
                extracted_preferences = self._extract_preferences_from_message(message)
                
                # Update context with extracted preferences
                context.current_destination = extracted_preferences.get("destination")
                context.start_date = extracted_preferences.get("start_date")
                context.end_date = extracted_preferences.get("end_date")
                context.travelers_count = int(extracted_preferences.get("num_travelers", 1)) # Corrected field name
                context.budget_tier = extracted_preferences.get("budget") # This is the tier name for now
                context.destination_type = extracted_preferences.get("destination_type", [])
                context.purpose = extracted_preferences.get("purpose", [])
                context.accommodation_type = extracted_preferences.get("accommodation_type", [])
                context.transport_mode = extracted_preferences.get("transport_mode", [])
                context.special_needs = extracted_preferences.get("special_needs", [])
                
                # Derive duration
                start_dt = datetime.strptime(context.start_date, "%Y-%m-%d")
                end_dt = datetime.strptime(context.end_date, "%Y-%m-%d")
                duration = (end_dt - start_dt).days + 1

                # Prepare preferences list for plan_itinerary
                preferences_list = []
                if context.destination_type: preferences_list.extend(context.destination_type)
                if context.purpose: preferences_list.extend(context.purpose)
                if context.accommodation_type: preferences_list.extend(context.accommodation_type)
                if context.transport_mode: preferences_list.extend(context.transport_mode)
                if context.special_needs: preferences_list.extend(context.special_needs)
                
                # Directly invoke plan_itinerary
                itinerary_response = await self.run_tool(
                    tool_name="plan_itinerary",
                    tool_args={
                        "user_id": user_id,
                        "destination": context.current_destination,
                        "start_date": context.start_date,
                        "end_date": context.end_date,
                        "preferences": preferences_list,
                        "num_travelers": context.travelers_count,
                        "budget": context.budget_tier # Pass budget tier string
                    },
                    context=context
                )
                
                # Directly invoke calculate_budget
                cost_response = await self.run_tool(
                    tool_name="calculate_budget",
                    tool_args={
                        "user_id": user_id,
                        "destination": context.current_destination,
                        "num_travelers": context.travelers_count,
                        "duration": duration,
                        "budget_tier": context.budget_tier,
                        "accommodation_type": ", ".join(context.accommodation_type) if isinstance(context.accommodation_type, list) else context.accommodation_type,
                        "transport_mode": ", ".join(context.transport_mode) if isinstance(context.transport_mode, list) else context.transport_mode,
                    },
                    context=context
                )
                
                # Combine and format responses
                combined_raw_response = f"```json\n{{\"Itinerary\": {itinerary_response}, \"Cost Breakdown\": {cost_response}}}\n```"
                formatted_response = await self._format_ai_response(combined_raw_response, context)
                
                response = {
                    "content": json.dumps(formatted_response), # Serialize to JSON string for frontend
                    "type": "travel_planning",
                    "suggestions": await self._generate_travel_suggestions(context),
                    "next_steps": []
                }
                
            else:
                # --- Original LangGraph invocation for other queries ---
                if self.agent_graph:
                    inputs = {"messages": [user_message_obj], "current_location": context.current_location, "user_id": user_id, "trip_id": context.trip_id}
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

            # Ensure ai_response_obj is defined for _save_chat_session if direct tool invocation path is taken
            if 'ai_response_obj' not in locals():
                # Create a dummy AIMessage if tools were directly invoked
                ai_response_obj = AIMessage(content=response.get("content", "Structured response generated by tools."))

            context.conversation_history.append({"role": "user", "content": message, "timestamp": datetime.utcnow().isoformat()})
            context.conversation_history.append({"role": "assistant", "content": response.get("content", "I am unable to generate a response at this time."), "timestamp": datetime.utcnow().isoformat()})
            
            await self._save_chat_session(user_id, context.session_id, context, user_message_obj, ai_response_obj)

            return {"success": True, "response": response, "context": context}
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {"success": False, "error": str(e), "response": {"content": "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.", "type": "error"}}

    def _extract_preferences_from_message(self, message: str) -> Dict[str, Any]:
        """Helper to extract structured preferences from the incoming message string."""
        preferences = {}
        # Regex to find key-value pairs like **key**: value
        # It handles multiline values by non-greedily matching until the next **key** or end of string
        matches = re.findall(r'\*\*(.*?)\*\*:\s*(.*?)(?=\n\*\*|$)', message, re.DOTALL)
        for key, value in matches:
            formatted_key = key.strip().replace(' ', '_').lower()
            # Special handling for list-like values
            if formatted_key in ["destination_type", "purpose", "accommodation_type", "transport_mode", "special_needs"]:
                preferences[formatted_key] = [item.strip() for item in value.split(',') if item.strip()]
            else:
                preferences[formatted_key] = value.strip()
        return preferences

    async def _format_ai_response(self, raw_response: str, context: ChatContext) -> Dict[str, Any]:
        """Formats the AI's raw response into a structured JSON output, handling various tool outputs."""
        structured_output = {
            "Attractions": [],
            "Food": [],
            "Events": [],
            "Weather Tip": "",
            "Suggested Route": {},
            "Itinerary": {},
            "Cost Breakdown": {},
            "Booking Confirmation": {}
        }

        # Try to parse any JSON embedded in the raw response
        json_match = re.search(r'```json\n(.*?)\n```', raw_response, re.DOTALL)
        if json_match:
            try:
                parsed_json = json.loads(json_match.group(1))
                
                itinerary_data = parsed_json.get("Itinerary")
                cost_breakdown_data = parsed_json.get("Cost Breakdown")

                general_content_parts = []

                if itinerary_data and "days" in itinerary_data and "destination" in itinerary_data:
                    structured_output["Itinerary"] = itinerary_data
                    general_content_parts.append(self._format_itinerary_to_human_readable(itinerary_data))
                
                if cost_breakdown_data and "total_estimated_cost" in cost_breakdown_data and "breakdown" in cost_breakdown_data:
                    structured_output["Cost Breakdown"] = cost_breakdown_data
                    general_content_parts.append(self._format_cost_breakdown_to_human_readable(cost_breakdown_data))

                if general_content_parts:
                    structured_output["General Content"] = "\n\n".join(general_content_parts)
                elif "General Content" in parsed_json: # Fallback if LLM provides directly
                    structured_output["General Content"] = parsed_json["General Content"]
                elif "content" in parsed_json: # Another fallback for generic content
                    structured_output["General Content"] = parsed_json["content"]
                
                # If the parsed_json itself contains top-level keys like Attractions, Food etc., incorporate them
                for key in ["Attractions", "Food", "Events", "Weather Tip", "Suggested Route", "Booking Confirmation"]:
                    if key in parsed_json:
                        structured_output[key] = parsed_json[key]
                        
                return structured_output
            except json.JSONDecodeError:
                pass # Fallback to regex-based extraction

        # Fallback to regex-based extraction and heuristics for general recommendations
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
        if not any(v for k, v in structured_output.items() if k not in ["Itinerary", "Cost Breakdown", "Booking Confirmation"]) and "General Content" not in structured_output:
            structured_output["General Content"] = raw_response

        return structured_output

    def _format_itinerary_to_human_readable(self, itinerary_json: Dict[str, Any]) -> str:
        """Formats an itinerary JSON into a human-readable string."""
        human_readable_output = f"""
        **Here is your drafted itinerary for {itinerary_json.get("destination", "Unknown")} from {itinerary_json.get("start_date", "Unknown")} to {itinerary_json.get("end_date", "Unknown")}:**

        """
        for day_plan in itinerary_json.get("days", []):
            human_readable_output += f"**Day {day_plan.get('day', 'N/A')} ({day_plan.get('date', 'N/A')}):**\n"
            for activity in day_plan.get("activities", []) :
                human_readable_output += f"- {activity.get('time', 'N/A')}: {activity.get('description', 'N/A')}\n"
                if "backup_option" in activity:
                    human_readable_output += f"  (Backup: {activity['backup_option']})\n"
            human_readable_output += "\n"
        return human_readable_output

    def _format_cost_breakdown_to_human_readable(self, cost_breakdown_json: Dict[str, Any]) -> str:
        """Formats a cost breakdown JSON into a human-readable string."""
        breakdown = cost_breakdown_json.get("breakdown", {})
        total_cost = cost_breakdown_json.get("total_estimated_cost", 0.0)
        destination = cost_breakdown_json.get("destination", "Unknown")
        budget_tier = cost_breakdown_json.get("budget_tier", "Standard")
        
        human_readable_output = f"""
        **Estimated Cost for your {budget_tier} trip to {destination}:**

        - Flights: ${breakdown.get("flights", 0.0):.2f}
        - Accommodation ({breakdown.get("accommodation_type", "Standard")}): ${breakdown.get("accommodation", 0.0):.2f}
        - Meals: ${breakdown.get("meals", 0.0):.2f}
        - Activities: ${breakdown.get("activities", 0.0):.2f}
        - Insurance: ${breakdown.get("insurance", 0.0):.2f}
        - Taxes & Fees: ${breakdown.get("taxes_fees", 0.0):.2f}

        **Total Estimated Cost: ${total_cost:.2f}**
        """
        return human_readable_output

    def _format_booking_confirmation_to_human_readable(self, booking_json: Dict[str, Any]) -> str:
        """Formats a booking confirmation JSON into a human-readable string."""
        booking_id = booking_json.get("booking_id", "N/A")
        trip_id = booking_json.get("trip_id", "N/A")
        status = booking_json.get("status", "N/A")
        details = booking_json.get("details", {})
        
        human_readable_output = f"""
        **Booking Confirmation**

        - Booking ID: {booking_id}
        - Trip ID: {trip_id}
        - Status: {status.capitalize()}
        - Booking Type: {details.get("booking_type", "N/A")}
        - Provider: {details.get("provider", "N/A")}
        - Travel Date: {details.get("travel_date", "N/A")}
        - Price: ${details.get("price", 0.0):.2f} {details.get("currency", "USD")}

        Your booking has been successfully processed!
        """
        return human_readable_output

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
        
        user_uuid = None
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            logger.error(f"Invalid user_id format: {user_id}. Using a placeholder UUID.")
            user_uuid = UUID('00000000-0000-0000-0000-000000000001') # Placeholder for testing

        db_session = SessionLocal()
        try:
            if session_id:
                chat_session = db_session.query(ChatSession).filter_by(id=UUID(session_id), user_id=user_uuid).first()
                if chat_session:
                    # Load existing context
                    context_data = chat_session.context if chat_session.context else {} # Ensure context_data is a dict
                    context = ChatContext(
                        user_id=user_id,
                        trip_id=str(chat_session.trip_id) if chat_session.trip_id else None,
                        current_destination=context_data.get("current_destination"),
                        travel_style=context_data.get("travel_style"),
                        budget_tier=context_data.get("budget_tier"),
                        preferences=context_data.get("preferences", []),
                        travelers_count=context_data.get("travelers_count", 1),
                        trip_duration=context_data.get("trip_duration"),
                        language=context_data.get("language", "en"),
                        current_location=context_data.get("current_location"),
                        suggested_places=context_data.get("suggested_places", []),
                        conversation_history=context_data.get("conversation_history", []),
                        destination_type=context_data.get("destination_type", []),
                        purpose=context_data.get("purpose", []),
                        start_date=context_data.get("start_date"),
                        end_date=context_data.get("end_date"),
                        accommodation_type=context_data.get("accommodation_type", []),
                        transport_mode=context_data.get("transport_mode", []),
                        special_needs=context_data.get("special_needs", []),
                    )
                    # Also load chat messages to rebuild history
                    messages = db_session.query(ChatMessage).filter_by(session_id=chat_session.id).order_by(ChatMessage.created_at).all()
                    context.conversation_history = [{
                        "role": msg.role,
                        "content": msg.content,
                        "timestamp": msg.created_at.isoformat()
                    } for msg in messages]
                    logger.info(f"Loaded existing chat session {session_id} for user {user_id}.")
                    return context

            # If no session_id or session not found, create a new context and session with a *new* unique ID
            current_location = {"lat": 48.8584, "lon": 2.2945}  # Default to Eiffel Tower, Paris for testing
            new_session_id_for_context = str(uuid.uuid4()) # Always generate a fresh UUID for a new context
            
            new_context = ChatContext(
                user_id=user_id,
                session_id=new_session_id_for_context,
                conversation_history=[],
                current_location=current_location # Set initial location
            )
            
            # Create a new session in DB for this user
            await self._create_chat_session_in_db(db_session, user_id, new_context.session_id, new_context)
            logger.info(f"Created new chat session {new_context.session_id} for user {user_id}.")
            return new_context
        finally:
            db_session.close()
    
    async def _save_chat_session(
        self,
        user_id: str,
        session_id: Optional[str],
        context: ChatContext,
        user_message: HumanMessage,
        ai_response: AIMessage,
    ):
        if not session_id:
            logger.error(f"Attempted to save chat messages without a valid session_id for user {user_id}. Aborting save.")
            raise ValueError("Cannot save chat session without a valid session ID.")

        try:
            with SessionLocal() as db:
                # Find or create ChatSession
                chat_session = db.query(ChatSession).filter_by(id=UUID(session_id)).first()
                if not chat_session:
                    # This case should ideally not be hit if sessions are always created via `_get_or_create_context` or `create_new_session`
                    logger.warning(f"Attempted to save message for non-existent session {session_id}. Creating new session.")
                    # Remove this line, as _get_or_create_context should handle session creation
                    # chat_session = await self._create_chat_session_in_db(db, user_id, session_id, context)
                    # If for some reason chat_session is still None, it means there's a logic error earlier
                    raise ValueError(f"Chat session {session_id} not found after attempting to get or create.")
                else:
                    # Update context if session exists
                    chat_session.context = context.model_dump()
                    chat_session.updated_at = datetime.utcnow()
                    db.commit()
                    db.refresh(chat_session)

            # Save user message
            user_chat_message = ChatMessage(
                session_id=chat_session.id,
                role="user",
                content=user_message.content,
                trip_metadata=context.model_dump(),
            )
            db.add(user_chat_message)
            db.commit() # Commit after adding user message
            db.refresh(user_chat_message)

            # Save AI response
            ai_chat_message = ChatMessage(
                session_id=chat_session.id,
                role="assistant",
                content=ai_response.content,
                trip_metadata=context.model_dump(),
            )
            db.add(ai_chat_message)
            db.commit() # Commit after adding AI message
            db.refresh(ai_chat_message)

        except Exception as e:
            logger.error(f"Error saving chat session for user {user_id}, session {session_id}: {e}")
            raise

    async def _create_chat_session_in_db(self, db, user_id: str, session_id: str, context: ChatContext):
        from uuid import UUID
        from models import User

        user_uuid = None
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            logger.error(f"Invalid user_id format: {user_id}. Using a placeholder UUID for session creation.")
            user_uuid = UUID('00000000-0000-0000-0000-000000000001') # Placeholder for testing
        
        # Ensure user exists (for testing, create if not)
        existing_user = db.query(User).filter_by(id=user_uuid).first()
        if not existing_user:
            logger.warning(f"User {user_id} not found. Creating a dummy user for session {session_id}.")
            dummy_user = User(id=user_uuid, email=f"{user_id}@example.com", username=user_id, hashed_password="dummy_hash")
            db.add(dummy_user)
            db.commit()
            db.refresh(dummy_user)

        chat_session = ChatSession(
            id=UUID(session_id),  # Ensure session_id is a UUID
            user_id=user_uuid,
            trip_id=UUID(context.trip_id) if context.trip_id else None,
            session_title="New Chat Session", # Placeholder title
            ai_model=AIModel.GEMINI_PRO.value,
            context=context.__dict__,
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
        return chat_session
    
    async def _create_trip_in_db(self, db, user_id: str, trip_data: Dict[str, Any]) -> Trip:
        from uuid import UUID
        from models import User, Trip, TripStatus
        from datetime import datetime
        
        user_uuid = None
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            logger.error(f"Invalid user_id format: {user_id}. Using a placeholder UUID for trip creation.")
            user_uuid = UUID('00000000-0000-0000-0000-000000000001') # Placeholder for testing
            
        existing_user = db.query(User).filter_by(id=user_uuid).first()
        if not existing_user:
            logger.warning(f"User {user_id} not found. Creating a dummy user for trip.")
            dummy_user = User(id=user_uuid, email=f"{user_id}@example.com", username=user_id, hashed_password="dummy_hash")
            db.add(dummy_user)
            db.commit()
            db.refresh(dummy_user)
            
        new_trip = Trip(
            owner_id=user_uuid,
            title=trip_data.get("title", "New Trip"),
            description=trip_data.get("description"),
            destination=trip_data.get("destination", "Unknown"),
            start_date=datetime.fromisoformat(trip_data["start_date"]) if "start_date" in trip_data else datetime.utcnow(),
            end_date=datetime.fromisoformat(trip_data["end_date"]) if "end_date" in trip_data else (datetime.utcnow() + timedelta(days=1)),
            duration=trip_data.get("duration", 1),
            budget=trip_data.get("budget", 0.0),
            status=TripStatus.PLANNING,
            travel_style=trip_data.get("travel_style"),
            travelers_count=trip_data.get("travelers_count", 1),
            trip_metadata=trip_data.get("metadata", {})
        )
        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)
        logger.info(f"Created new trip {new_trip.id} for user {user_id}.")
        return new_trip

    async def _get_trip_from_db(self, db, trip_id: str) -> Optional[Trip]:
        from uuid import UUID
        from models import Trip
        try:
            trip_uuid = UUID(trip_id)
            trip = db.query(Trip).filter_by(id=trip_uuid).first()
            return trip
        except ValueError:
            logger.error(f"Invalid trip_id format: {trip_id}.")
            return None
            
    async def _save_itinerary_day_in_db(self, db, trip_id: str, day_data: Dict[str, Any]):
        from uuid import UUID
        from models import ItineraryDay
        from datetime import datetime

        try:
            trip_uuid = UUID(trip_id)
        except ValueError:
            logger.error(f"Invalid trip_id format: {trip_id}. Cannot save itinerary day.")
            return None
            
        itinerary_day = ItineraryDay(
            trip_id=trip_uuid,
            day_number=day_data["day"],
            date=datetime.fromisoformat(day_data["date"]),
            activities=day_data.get("activities"),
            weather_forecast=day_data.get("weather_forecast"),
            notes=day_data.get("notes"),
            estimated_cost=day_data.get("estimated_cost", 0.0)
        )
        db.add(itinerary_day)
        db.commit()
        db.refresh(itinerary_day)
        logger.info(f"Saved itinerary day {day_data['day']} for trip {trip_id}.")
        return itinerary_day

    async def _save_booking_in_db(self, db, user_id: str, trip_id: str, booking_details: Dict[str, Any]) -> Booking:
        from uuid import UUID
        from models import Booking
        from datetime import datetime
        
        user_uuid = None
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            logger.error(f"Invalid user_id format: {user_id}. Cannot save booking.")
            raise
            
        trip_uuid = None
        try:
            trip_uuid = UUID(trip_id)
        except ValueError:
            logger.error(f"Invalid trip_id format: {trip_id}. Cannot save booking.")
            raise
        
        new_booking = Booking(
            trip_id=trip_uuid,
            user_id=user_uuid,
            booking_type=booking_details.get("booking_type", "other"),
            provider=booking_details.get("provider", "AI-Travel-Agent"),
            booking_reference=booking_details.get("booking_reference", str(UUID.uuid4())),
            confirmation_number=booking_details.get("confirmation_number", str(UUID.uuid4())[:8]),
            status=booking_details.get("status", "confirmed"),
            booking_date=datetime.fromisoformat(booking_details["booking_date"]) if "booking_date" in booking_details else datetime.utcnow(),
            travel_date=datetime.fromisoformat(booking_details["travel_date"]) if "travel_date" in booking_details else datetime.utcnow(),
            price=booking_details.get("price", 0.0),
            currency=booking_details.get("currency", "USD"),
            details=booking_details.get("details", {}),
            cancellation_policy=booking_details.get("cancellation_policy")
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        logger.info(f"Saved new booking {new_booking.id} for trip {trip_id}.")
        return new_booking

    async def _save_review_in_db(self, db, user_id: str, trip_id: str, rating: int, title: Optional[str] = None, content: Optional[str] = None) -> Review:
        from uuid import UUID
        from models import Review, Trip # Import Trip to get destination
        from datetime import datetime
        
        user_uuid = None
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            logger.error(f"Invalid user_id format: {user_id}. Cannot save review.")
            raise
            
        trip_uuid = None
        try:
            trip_uuid = UUID(trip_id)
        except ValueError:
            logger.error(f"Invalid trip_id format: {trip_id}. Cannot save review.")
            raise
            
        # Fetch trip to get destination
        trip = db.query(Trip).filter_by(id=trip_uuid).first()
        destination = trip.destination if trip else "Unknown"
        
        new_review = Review(
            trip_id=trip_uuid,
            user_id=user_uuid,
            destination=destination,
            rating=rating,
            title=title,
            content=content,
            created_at=datetime.utcnow()
        )
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        logger.info(f"Saved new review {new_review.id} for trip {trip_id} by user {user_id}.")
        return new_review

    async def get_chat_history(
        self, user_id: str, session_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        try:
            with SessionLocal() as db:
                # Retrieve chat session
                chat_session = db.query(ChatSession).filter_by(id=UUID(session_id)).first() if session_id else None
                if not chat_session:
                    logger.info(f"No chat session found for session ID: {session_id}")
            return []
                
                # Retrieve messages for the session
            messages = db.query(ChatMessage).filter_by(session_id=chat_session.id).order_by(ChatMessage.created_at).all()
            history = [{
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat()
                } for msg in messages]
            logger.info(f"Retrieved {len(history)} messages for session {session_id}")
            return history
        except Exception as e:
            logger.error(f"Error retrieving chat history for user {user_id}, session {session_id}: {e}")
            raise # Re-raise the exception to propagate it

    async def create_new_session(
        self, user_id: str, trip_id: Optional[str] = None
    ) -> str:
        try:
            from uuid import UUID
            # Always generate a new unique UUID for the session
            session_id = str(uuid.uuid4()) 
            
            # Create an initial ChatContext
            initial_context = ChatContext(
                user_id=user_id,
                trip_id=trip_id,
                preferences=["culture", "food", "adventure"],
                travelers_count=1,
                current_location={"lat": 48.8584, "lon": 2.2945}, # Default to Eiffel Tower, Paris for testing
                suggested_places=[],
                conversation_history=[]
            )
            
            with SessionLocal() as db:
                # Create and save the new ChatSession in the database
                new_chat_session = await self._create_chat_session_in_db(db, user_id, session_id, initial_context)
                
            logger.info(f"Created and saved new chat session: {session_id} for user {user_id}")
            return session_id
        except Exception as e:
            logger.error(f"Error creating new session for user {user_id}: {e}")
            raise

    async def delete_chat_session(self, session_id: str):
        try:
            from uuid import UUID
            with SessionLocal() as db:
                session_uuid = UUID(session_id)

                # Delete all chat messages associated with the session
                db.query(ChatMessage).filter_by(session_id=session_uuid).delete()
                logger.info(f"Deleted all messages for session {session_id}.")

                # Delete the chat session itself
                chat_session = db.query(ChatSession).filter_by(id=session_uuid).first()
                if chat_session:
                    db.delete(chat_session)
                    db.commit()
                    logger.info(f"Chat session {session_id} permanently deleted from DB.")
                else:
                    logger.warning(f"Attempted to delete non-existent session {session_id}.")
        except Exception as e:
            logger.error(f"Error deleting chat session {session_id}: {e}")
            raise


class ChatSessionManager:
    """Manages chat sessions and user interactions"""

    def __init__(self):
        self.ai_manager = AIChatManager()
        # We will now load active sessions from the DB or create on demand
        self.active_sessions: Dict[str, ChatContext] = {}

    async def start_session(self, user_id: str, trip_id: Optional[str] = None) -> str:
        try:
            # Create a new session in the AIChatManager which now handles DB persistence
            session_id = await self.ai_manager.create_new_session(user_id, trip_id)
            # Fetch the context for the newly created session from the DB to populate active_sessions
            context = await self.ai_manager._get_or_create_context(user_id, session_id) 
            self.active_sessions[session_id] = context
            logger.info(f"Session {session_id} started successfully for user {user_id}")
            return session_id
        except Exception as e:
            logger.error(f"Error in start_session for user {user_id}: {e}")
            raise

    async def send_message(self, user_id: str, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        if session_id is None:
            session_id = await self.start_session(user_id)
        
        # Always get the latest context from the AI manager (which fetches from DB)
        context = await self.ai_manager._get_or_create_context(user_id, session_id) # Ensure context is always fresh
        self.active_sessions[session_id] = context # Update in-memory cache
        
        response = await self.ai_manager.process_message(user_id, message, session_id, context)
        
        if response["success"]:
            self.active_sessions[session_id] = response["context"]
        
        return response

    async def end_session(self, session_id: str):
        try:
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            # The permanent deletion from DB is now handled by AIChatManager.delete_chat_session
            logger.info(f"Session {session_id} removed from active sessions.")
        except Exception as e:
            logger.error(f"Error ending session {session_id}: {e}")
            raise

    def get_session_context(self, session_id: str) -> Optional[ChatContext]:
        # This will now always hit the AI manager, which can fetch from DB
        # For simplicity, we'll directly return from active_sessions, assuming it's kept up-to-date by send_message
        # In a more complex app, this might also fetch from DB if not in active_sessions
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
    # This now uses the AI manager's method which fetches from DB
    return await manager.ai_manager.get_chat_history(user_id, session_id)

if __name__ == "__main__":
    async def test_chat():
        print("🧠 Testing AI Chat System...")
        
        # Ensure database is initialized before testing
        init_db()
        
        # Test basic message processing
        test_user_id = "test_user_123"
        response = await chat_endpoint(test_user_id, "I want to plan a trip to Paris")
        print(f"Response: {response}")
        
        # Test session management
        session_id = await start_chat_session(test_user_id)
        print(f"Session ID: {session_id}")
        
        # Test follow-up message
        response2 = await chat_endpoint(test_user_id, "What should I do there?", session_id)
        print(f"Follow-up Response: {response2}")
        
        # Test getting chat history
        history = await get_chat_history(test_user_id, session_id)
        print(f"Chat History: {history}")
        
        # Test ending session
        await get_chat_manager().end_session(session_id)
        print(f"Session {session_id} ended.")
    
    asyncio.run(test_chat())