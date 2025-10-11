"""
AI Travel Planning Agent - FastAPI Backend with LangGraph
Multi-agent system for personalized travel itinerary generation
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import random

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Try to import LangGraph and LangChain components
try:
    from langgraph.graph import StateGraph, END
    from langgraph.prebuilt import ToolNode
    from langchain_core.tools import tool
    from langchain_core.messages import HumanMessage, AIMessage
    LANGGRAPH_AVAILABLE = True
except ImportError as e:
    print(f"Warning: LangGraph/LangChain not available: {e}")
    LANGGRAPH_AVAILABLE = False
    # Create dummy classes to prevent errors
    class StateGraph:
        def __init__(self, *args, **kwargs): pass
        def add_node(self, *args, **kwargs): pass
        def add_edge(self, *args, **kwargs): pass
        def set_entry_point(self, *args, **kwargs): pass
        def compile(self): return None
    class END: pass
    class ToolNode: pass
    def tool(func): return func
    class HumanMessage:
        def __init__(self, *args, **kwargs): pass
    class AIMessage:
        def __init__(self, *args, **kwargs): pass

# Import analytics and chat modules
try:
    from analytics_dashboard import get_dashboard_data, get_real_time_metrics, analytics_dashboard
    ANALYTICS_AVAILABLE = True
except ImportError as e:
    print(f"Analytics module not available: {e}")
    ANALYTICS_AVAILABLE = False

try:
    from ai_chat import chat_endpoint, start_chat_session, get_chat_history, get_chat_manager
    CHAT_AVAILABLE = True
except ImportError as e:
    print(f"Chat module not available: {e}")
    CHAT_AVAILABLE = False

# Initialize FastAPI app
app = FastAPI(
    title="AI Travel Planning Agent",
    description="Multi-agent system for personalized travel itinerary generation",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mock datasets
def load_mock_data():
    """Load mock datasets for flights, hotels, activities, and weather"""
    try:
        with open("data/flights.json", "r") as f:
            flights = json.load(f)
        with open("data/hotels.json", "r") as f:
            hotels = json.load(f)
        with open("data/activities.json", "r") as f:
            activities = json.load(f)
        with open("data/weather.json", "r") as f:
            weather = json.load(f)
        return flights, hotels, activities, weather
    except FileNotFoundError as e:
        print(f"Warning: Mock data file not found: {e}")
        return [], [], [], []

# Pydantic models for API
class TravelRequest(BaseModel):
    destination: str
    start_date: str
    duration: int
    budget: float
    preferences: List[str]
    travelers: int = 1
    travel_style: Optional[str] = "balanced"

class TravelResponse(BaseModel):
    itinerary: List[Dict[str, Any]]
    total_cost: float
    summary: str
    recommendations: List[str]

# State management for LangGraph
class TravelState(BaseModel):
    user_input: Dict[str, Any]
    user_profile: Dict[str, Any]
    flight_options: List[Dict[str, Any]]
    hotel_options: List[Dict[str, Any]]
    activity_options: List[Dict[str, Any]]
    weather_info: Dict[str, Any]
    safety_alerts: List[Dict[str, Any]]
    budget_analysis: Dict[str, Any]
    final_itinerary: List[Dict[str, Any]]
    recommendations: List[str]
    errors: List[str]

# Load mock data
FLIGHTS, HOTELS, ACTIVITIES, WEATHER = load_mock_data()

# Agent Tools
def analyze_user_preferences(destination: str, preferences: List[str], budget: float, duration: int) -> Dict[str, Any]:
    """Analyze user preferences and determine travel style"""
    travel_style = "balanced"
    if "luxury" in preferences or budget > 5000:
        travel_style = "luxury"
    elif "budget" in preferences or budget < 2000:
        travel_style = "budget"
    elif "adventure" in preferences:
        travel_style = "adventure"
    
    budget_per_day = budget / duration if duration > 0 else 0
    
    return {
        "travel_style": travel_style,
        "priority_activities": preferences,
        "budget_per_day": budget_per_day,
        "comfort_level": "high" if travel_style == "luxury" else "medium" if travel_style == "balanced" else "basic"
    }

def find_flight_options(destination: str, start_date: str, budget: float, travelers: int) -> List[Dict[str, Any]]:
    """Find suitable flight options based on destination and budget"""
    destination_keywords = destination.lower().split()
    suitable_flights = []
    
    for flight in FLIGHTS:
        if any(keyword in flight["destination"].lower() or keyword in flight["airline"].lower() for keyword in destination_keywords):
            if flight["price"] * travelers <= budget * 0.6:
                suitable_flights.append(flight)
    
    if not suitable_flights:
        for flight in FLIGHTS:
            if any(keyword in flight["destination"].lower() or keyword in flight["airline"].lower() for keyword in ["paris", "london", "new york"]):
                suitable_flights.append(flight)

    suitable_flights.sort(key=lambda x: (x["price"], -x["safetyRating"]))
    return suitable_flights[:3]

def find_hotel_options(destination: str, duration: int, budget: float, travelers: int, travel_style: str) -> List[Dict[str, Any]]:
    """Find suitable hotel options based on destination, budget, and travel style"""
    destination_keywords = destination.lower().split()
    suitable_hotels = []
    
    for hotel in HOTELS:
        if any(keyword in hotel["location"].lower() for keyword in destination_keywords):
            total_cost = hotel["price"] * duration * travelers
            if total_cost <= budget: # Relaxed budget check
                if travel_style == "luxury" and hotel["price"] >= 300:
                    suitable_hotels.append(hotel)
                elif travel_style == "budget" and hotel["price"] <= 150:
                    suitable_hotels.append(hotel)
                elif travel_style == "balanced" or travel_style == "adventure":
                    suitable_hotels.append(hotel)
    
    if not suitable_hotels:
        for hotel in HOTELS:
            if any(keyword in hotel["location"].lower() for keyword in ["paris", "london", "new york"]):
                suitable_hotels.append(hotel)

    suitable_hotels.sort(key=lambda x: (-x["rating"], -x["safetyRating"]))
    return suitable_hotels[:3]

async def find_activities_real_time(destination: str, duration: int, preferences: List[str], budget: float) -> List[Dict[str, Any]]:
    """Find activities using real-time APIs when available"""
    try:
        from real_api_config import real_api_manager
        real_activities = await real_api_manager.get_real_activities(destination, preferences)
        
        if real_activities and len(real_activities) >= duration:
            print(f"✅ Using {len(real_activities)} real-time activities from Google Places API")
            return real_activities
        else:
            print("⚠️ Real-time API returned insufficient data, falling back to enhanced mock data")
            return find_activities(destination, duration, preferences, budget)
    except Exception as e:
        print(f"⚠️ Real-time API error: {e}, using mock data")
        return find_activities(destination, duration, preferences, budget)

def find_activities(destination: str, duration: int, preferences: List[str], budget: float) -> List[Dict[str, Any]]:
    """Find suitable activities based on destination, preferences, and budget"""
    destination_lower = destination.lower()
    destination_keywords = destination_lower.split()
    
    print(f"🔍 Searching activities for destination: {destination}")
    
    # First, find ALL activities for the exact destination
    all_destination_activities = []
    
    # Try exact city/country matching first
    for activity in ACTIVITIES:
        activity_location = activity["location"].lower()
        
        # Exact destination match
        if destination_lower in activity_location or any(keyword in activity_location for keyword in destination_keywords):
            all_destination_activities.append(activity)
            print(f"✅ Found activity: {activity['name']} in {activity['location']}")
    
    print(f"📊 Found {len(all_destination_activities)} activities for {destination}")
    
    # If no activities found for the specific destination, create generic activities
    if not all_destination_activities:
        print(f"⚠️ No specific activities found for {destination}, generating generic activities...")
        all_destination_activities = generate_generic_activities(destination, duration * 3)
    
    # If still no activities, use a small subset from popular destinations as last resort
    if not all_destination_activities:
        print(f"⚠️ Generating fallback activities for {destination}...")
        popular_activities = [activity for activity in ACTIVITIES if "cultural" in activity.get("tags", [])][:6]
        # Modify the location to match the requested destination
        all_destination_activities = []
        for activity in popular_activities:
            modified_activity = activity.copy()
            modified_activity["location"] = destination
            modified_activity["description"] = f"Explore {destination} and {activity['description'].lower()}"
            all_destination_activities.append(modified_activity)
    
    print(f"📋 Total activities available: {len(all_destination_activities)}")

    # We need at least 3 activities per day (morning, afternoon, evening)
    target_activities = duration * 3
    
    # Filter based on preferences with more lenient budget check
    filtered_activities = []
    for activity in all_destination_activities:
        # More lenient preference matching
        preference_match = not preferences or any(
            pref.lower() in activity["tags"] or 
            pref.lower() in activity["category"].lower() or
            pref.lower() in activity["name"].lower() or
            pref.lower() in activity["description"].lower()
            for pref in preferences
        )
        
        # More lenient budget check - allow up to 30% of budget per activity
        budget_ok = activity["price"] <= budget * 0.3
        
        if preference_match and budget_ok:
            filtered_activities.append(activity)
    
    # If we still don't have enough, add more activities regardless of preferences
    if len(filtered_activities) < target_activities:
        remaining_needed = target_activities - len(filtered_activities)
        all_destination_activities.sort(key=lambda x: (-x["rating"], x["price"]))
        
        # Add activities that aren't already in filtered_activities
        for activity in all_destination_activities:
            if activity not in filtered_activities and activity["price"] <= budget * 0.4:
                filtered_activities.append(activity)
                remaining_needed -= 1
                if remaining_needed <= 0:
                    break
    
    # If we still don't have enough, duplicate some activities with different times
    if len(filtered_activities) < target_activities and filtered_activities:
        original_count = len(filtered_activities)
        while len(filtered_activities) < target_activities:
            for i in range(original_count):
                if len(filtered_activities) >= target_activities:
                    break
                # Create a copy with different bestTime
                activity_copy = filtered_activities[i].copy()
                times = ["Morning", "Afternoon", "Evening"]
                activity_copy["bestTime"] = times[len(filtered_activities) % 3]
                filtered_activities.append(activity_copy)

    # Sort the final list by rating and price
    filtered_activities.sort(key=lambda x: (-x["rating"], x["price"]))
    
    return filtered_activities[:target_activities]

def generate_generic_activities(destination: str, count: int) -> List[Dict[str, Any]]:
    """Generate generic activities for destinations not in our database"""
    
    generic_activities = [
        {
            "id": f"GEN001_{destination}",
            "name": f"City Walking Tour of {destination}",
            "location": destination,
            "category": "Culture & Sightseeing",
            "price": 25,
            "duration": "3 hours",
            "rating": 4.5,
            "authenticLocal": True,
            "safetyRating": 9.0,
            "tags": ["walking", "cultural", "sightseeing", "local"],
            "description": f"Explore the heart of {destination} with a guided walking tour covering major landmarks and local culture",
            "bestTime": "Morning",
            "crowdLevel": "Medium",
            "seasonal": False
        },
        {
            "id": f"GEN002_{destination}",
            "name": f"Local Food Experience in {destination}",
            "location": destination,
            "category": "Food & Culture",
            "price": 45,
            "duration": "2 hours",
            "rating": 4.7,
            "authenticLocal": True,
            "safetyRating": 9.2,
            "tags": ["food", "local", "cultural", "authentic"],
            "description": f"Taste authentic local cuisine and learn about {destination}'s food culture with local food experts",
            "bestTime": "Afternoon",
            "crowdLevel": "Small Group",
            "seasonal": False
        },
        {
            "id": f"GEN003_{destination}",
            "name": f"Historical Sites of {destination}",
            "location": destination,
            "category": "History & Culture",
            "price": 15,
            "duration": "4 hours",
            "rating": 4.4,
            "authenticLocal": True,
            "safetyRating": 9.1,
            "tags": ["history", "cultural", "educational", "heritage"],
            "description": f"Discover the rich history and heritage of {destination} through its most important historical sites",
            "bestTime": "Morning",
            "crowdLevel": "Medium",
            "seasonal": False
        },
        {
            "id": f"GEN004_{destination}",
            "name": f"Local Markets & Shopping in {destination}",
            "location": destination,
            "category": "Shopping & Culture",
            "price": 0,
            "duration": "3 hours",
            "rating": 4.3,
            "authenticLocal": True,
            "safetyRating": 8.9,
            "tags": ["shopping", "local", "markets", "cultural"],
            "description": f"Browse local markets and shops in {destination}, perfect for souvenirs and experiencing local life",
            "bestTime": "Afternoon",
            "crowdLevel": "High",
            "seasonal": False
        },
        {
            "id": f"GEN005_{destination}",
            "name": f"Evening Entertainment in {destination}",
            "location": destination,
            "category": "Entertainment & Nightlife",
            "price": 35,
            "duration": "3 hours",
            "rating": 4.2,
            "authenticLocal": True,
            "safetyRating": 8.7,
            "tags": ["entertainment", "nightlife", "local", "evening"],
            "description": f"Experience {destination}'s evening entertainment scene with local music, dance, or cultural performances",
            "bestTime": "Evening",
            "crowdLevel": "Medium",
            "seasonal": False
        },
        {
            "id": f"GEN006_{destination}",
            "name": f"Nature & Parks in {destination}",
            "location": destination,
            "category": "Nature & Relaxation",
            "price": 0,
            "duration": "2 hours",
            "rating": 4.6,
            "authenticLocal": True,
            "safetyRating": 9.3,
            "tags": ["nature", "parks", "relaxation", "free"],
            "description": f"Relax and enjoy the natural beauty of {destination} in its parks and green spaces",
            "bestTime": "Morning",
            "crowdLevel": "Low",
            "seasonal": False
        },
        {
            "id": f"GEN007_{destination}",
            "name": f"Art & Culture Scene in {destination}",
            "location": destination,
            "category": "Art & Culture",
            "price": 20,
            "duration": "3 hours",
            "rating": 4.5,
            "authenticLocal": True,
            "safetyRating": 9.0,
            "tags": ["art", "culture", "museums", "galleries"],
            "description": f"Immerse yourself in {destination}'s art and cultural scene through galleries, museums, and cultural centers",
            "bestTime": "Afternoon",
            "crowdLevel": "Low",
            "seasonal": False
        },
        {
            "id": f"GEN008_{destination}",
            "name": f"Local Transportation Experience in {destination}",
            "location": destination,
            "category": "Local Experience",
            "price": 10,
            "duration": "2 hours",
            "rating": 4.1,
            "authenticLocal": True,
            "safetyRating": 8.8,
            "tags": ["transport", "local", "experience", "authentic"],
            "description": f"Experience {destination} like a local using public transportation and discovering hidden neighborhoods",
            "bestTime": "Afternoon",
            "crowdLevel": "Medium",
            "seasonal": False
        },
        {
            "id": f"GEN009_{destination}",
            "name": f"Sunset Views & Photography in {destination}",
            "location": destination,
            "category": "Photography & Views",
            "price": 0,
            "duration": "2 hours",
            "rating": 4.8,
            "authenticLocal": True,
            "safetyRating": 9.2,
            "tags": ["photography", "views", "sunset", "free"],
            "description": f"Capture beautiful sunset views and photograph the best scenic spots in {destination}",
            "bestTime": "Evening",
            "crowdLevel": "Low",
            "seasonal": False
        }
    ]
    
    # Return the requested number of activities, cycling through if needed
    result = []
    for i in range(count):
        activity = generic_activities[i % len(generic_activities)].copy()
        if i >= len(generic_activities):
            # Modify slightly for variety
            activity["id"] = f"GEN{i+1:03d}_{destination}"
            activity["name"] = f"Alternative {activity['name']}"
        result.append(activity)
    
    return result

def get_weather_info(destination: str, start_date: str, duration: int) -> Dict[str, Any]:
    """Get weather information for the destination and travel dates"""
    destination_keywords = destination.lower().split()
    
    for weather_data in WEATHER:
        if any(keyword in weather_data["location"].lower() for keyword in destination_keywords):
            forecast = []
            start_dt = datetime.fromisoformat(start_date)
            for i in range(duration):
                day_dt = start_dt + timedelta(days=i)
                forecast.append({
                    "date": day_dt.strftime("%Y-%m-%d"),
                    "high": weather_data["forecast"][i % len(weather_data["forecast"])]["high"],
                    "low": weather_data["forecast"][i % len(weather_data["forecast"])]["low"],
                    "condition": weather_data["forecast"][i % len(weather_data["forecast"])]["condition"],
                    "precipitation": weather_data["forecast"][i % len(weather_data["forecast"])]["precipitation"]
                })
            
            return {
                "current": weather_data["currentWeather"],
                "forecast": forecast,
                "events": weather_data["events"],
                "safety_alerts": weather_data["safetyAlerts"]
            }
    
    return {
        "current": {"temperature": 20, "condition": "Unknown", "humidity": 60, "windSpeed": 10, "visibility": "Good"},
        "forecast": [],
        "events": [],
        "safety_alerts": []
    }

def analyze_budget(flight_cost: float, hotel_cost: float, activity_cost: float, total_budget: float, travelers: int) -> Dict[str, Any]:
    """Analyze budget allocation and provide recommendations"""
    total_cost = flight_cost + hotel_cost + activity_cost
    remaining_budget = total_budget - total_cost
    
    budget_per_person = total_cost / travelers if travelers > 0 else 0.0
    
    analysis = {
        "total_cost": total_cost,
        "remaining_budget": remaining_budget,
        "budget_per_person": budget_per_person,
        "budget_breakdown": {
            "flights": {"cost": flight_cost, "percentage": (flight_cost / total_budget) * 100 if total_budget > 0 else 0},
            "hotels": {"cost": hotel_cost, "percentage": (hotel_cost / total_budget) * 100 if total_budget > 0 else 0},
            "activities": {"cost": activity_cost, "percentage": (activity_cost / total_budget) * 100 if total_budget > 0 else 0}
        },
        "budget_status": "within_budget" if total_cost <= total_budget else "over_budget",
        "recommendations": []
    }
    
    if total_cost > total_budget:
        analysis["recommendations"].append("Consider budget accommodations or fewer activities")
        analysis["recommendations"].append("Look for flight deals or alternative dates")
    elif remaining_budget > total_budget * 0.3:
        analysis["recommendations"].append("You have significant budget remaining - consider upgrading flights or hotels")
    
    return analysis

def create_itinerary(activities: List[Dict], duration: int, weather_info: Dict, safety_alerts: List[Dict], start_date: str) -> List[Dict[str, Any]]:
    """Create a day-by-day itinerary with optimal scheduling"""
    itinerary = []
    
    # Sort activities by rating to prioritize better options
    activities.sort(key=lambda x: (-x.get("rating", 0), x.get("price", 0)))
    
    # Remove duplicates based on activity name and location
    unique_activities = []
    seen_activities = set()
    for activity in activities:
        activity_key = f"{activity.get('name', '')}-{activity.get('location', '')}"
        if activity_key not in seen_activities:
            unique_activities.append(activity)
            seen_activities.add(activity_key)
    
    activities = unique_activities
    
    # Ensure we have enough unique activities
    min_activities_needed = duration * 3  # 3 per day (morning, afternoon, evening)
    if len(activities) < min_activities_needed:
        print(f"Warning: Only {len(activities)} unique activities available for {duration} days. Some days may have fewer activities.")
    
    start_dt = datetime.fromisoformat(start_date)
    
    # Create a more intelligent distribution system
    used_activities = set()
    
    for day in range(1, duration + 1):
        day_weather = weather_info.get("forecast", [])
        weather_condition = day_weather[day-1] if day-1 < len(day_weather) else {
            "condition": "Sunny", 
            "precipitation": 0, 
            "high": 25, 
            "low": 15
        }
        
        # Get available activities for this day (not used yet)
        available_activities = [act for act in activities if act.get('id', act.get('name', '')) not in used_activities]
        
        # If we've used all activities, reset the pool but prioritize different categories
        if len(available_activities) < 3:
            available_activities = activities.copy()
            used_activities.clear()
        
        # Assign activities to time slots for this day
        morning_activities = []
        afternoon_activities = []
        evening_activities = []
        
        # Categorize activities by best time and type
        morning_candidates = [act for act in available_activities if 
                            act.get("bestTime", "").lower() in ["morning", "early morning"] or
                            "temple" in act.get("tags", []) or "museum" in act.get("category", "").lower()]
        
        afternoon_candidates = [act for act in available_activities if 
                              act.get("bestTime", "").lower() in ["afternoon", "day"] or
                              "shopping" in act.get("tags", []) or "sightseeing" in act.get("category", "").lower()]
        
        evening_candidates = [act for act in available_activities if 
                            act.get("bestTime", "").lower() in ["evening", "night"] or
                            "nightlife" in act.get("tags", []) or "bar" in act.get("tags", [])]
        
        # Assign one activity per time slot, ensuring variety
        activities_for_day = []
        
        # Morning activity
        if morning_candidates:
            morning_activity = morning_candidates[0].copy()
            morning_activity["bestTime"] = "Morning"
            morning_activities.append(morning_activity)
            activities_for_day.append(morning_activity)
            used_activities.add(morning_activity.get('id', morning_activity.get('name', '')))
        
        # Afternoon activity
        afternoon_pool = [act for act in available_activities if act.get('id', act.get('name', '')) not in used_activities]
        if afternoon_candidates:
            afternoon_activity = next((act for act in afternoon_candidates if act.get('id', act.get('name', '')) not in used_activities), None)
            if not afternoon_activity and afternoon_pool:
                afternoon_activity = afternoon_pool[0]
        elif afternoon_pool:
            afternoon_activity = afternoon_pool[0]
        else:
            afternoon_activity = None
            
        if afternoon_activity:
            afternoon_activity = afternoon_activity.copy()
            afternoon_activity["bestTime"] = "Afternoon"
            afternoon_activities.append(afternoon_activity)
            activities_for_day.append(afternoon_activity)
            used_activities.add(afternoon_activity.get('id', afternoon_activity.get('name', '')))
        
        # Evening activity
        evening_pool = [act for act in available_activities if act.get('id', act.get('name', '')) not in used_activities]
        if evening_candidates:
            evening_activity = next((act for act in evening_candidates if act.get('id', act.get('name', '')) not in used_activities), None)
            if not evening_activity and evening_pool:
                evening_activity = evening_pool[0]
        elif evening_pool:
            evening_activity = evening_pool[0]
        else:
            evening_activity = None
            
        if evening_activity:
            evening_activity = evening_activity.copy()
            evening_activity["bestTime"] = "Evening"
            evening_activities.append(evening_activity)
            activities_for_day.append(evening_activity)
            used_activities.add(evening_activity.get('id', evening_activity.get('name', '')))
        
        # Calculate day cost
        day_cost = sum(act.get("price", 0) for act in activities_for_day)
        
        # Generate diverse travel tips
        travel_tips = []
        
        # Weather-based tips
        if weather_condition.get("precipitation", 0) > 50:
            travel_tips.append("Pack an umbrella and waterproof jacket - rain is expected today.")
        elif weather_condition.get("high", 20) > 30:
            travel_tips.append("Stay hydrated and wear sunscreen - it's going to be a hot day!")
        elif weather_condition.get("high", 20) < 10:
            travel_tips.append("Bundle up warm - temperatures will be quite chilly today.")
        
        # Activity-specific tips
        activity_categories = [act.get("category", "") for act in activities_for_day]
        if any("food" in cat.lower() for cat in activity_categories):
            travel_tips.append("Come hungry - you'll be experiencing amazing local cuisine today!")
        if any("temple" in act.get("tags", []) for act in activities_for_day):
            travel_tips.append("Dress modestly when visiting temples and religious sites.")
        if any("nightlife" in act.get("tags", []) for act in activities_for_day):
            travel_tips.append("The night is young - prepare for an exciting evening out!")
        
        # General tips based on day of trip
        if day == 1:
            travel_tips.append("Welcome to your adventure! Take it easy on your first day to adjust.")
        elif day == duration:
            travel_tips.append("Last day - make it memorable and don't forget to pick up souvenirs!")
        
        # Safety alerts
        for alert in safety_alerts:
            if alert.get("severity") in ["High", "Medium"]:
                travel_tips.append(f"Safety Alert: {alert.get('message', 'Stay alert and follow local guidelines.')}")
        
        # Ensure we have at least some tips
        if not travel_tips:
            travel_tips = [
                f"Day {day} of your amazing journey - enjoy every moment!",
                "Try to interact with locals and learn about their culture.",
                "Don't forget to capture memories with photos and videos."
            ]
        
        day_schedule = {
            "day": day,
            "date": (start_dt + timedelta(days=day-1)).strftime("%Y-%m-%d"),
            "weather": weather_condition,
            "morning": morning_activities,
            "afternoon": afternoon_activities,
            "evening": evening_activities,
            "total_activities": len(activities_for_day),
            "estimated_cost": day_cost,
            "travel_tips": travel_tips
        }
        
        itinerary.append(day_schedule)
    
    return itinerary

# LangGraph workflow - disabled due to compatibility issues
def create_travel_workflow():
    """Create the LangGraph workflow for travel planning"""
    print("Using simplified workflow instead of LangGraph")
    return None

# Agent Executor Functions (Wrappers for the @tool functions to interact with TravelState)
def call_analyze_user_preferences(state: TravelState) -> TravelState:
    user_input = state.user_input
    result = analyze_user_preferences(
        destination=user_input["destination"],
        preferences=user_input["preferences"],
        budget=user_input["budget"],
        duration=user_input["duration"]
    )
    state.user_profile = result
    return state

def call_find_flight_options(state: TravelState) -> TravelState:
    user_input = state.user_input
    result = find_flight_options(
        destination=user_input["destination"],
        start_date=user_input["start_date"],
        budget=user_input["budget"],
        travelers=user_input["travelers"]
    )
    state.flight_options = result
    return state

def call_find_hotel_options(state: TravelState) -> TravelState:
    user_input = state.user_input
    result = find_hotel_options(
        destination=user_input["destination"],
        duration=user_input["duration"],
        budget=user_input["budget"],
        travelers=user_input["travelers"],
        travel_style=state.user_profile.get("travel_style", "balanced")
    )
    state.hotel_options = result
    return state

def call_find_activities(state: TravelState) -> TravelState:
    user_input = state.user_input
    result = find_activities(
        destination=user_input["destination"],
        duration=user_input["duration"],
        preferences=user_input["preferences"],
        budget=user_input["budget"]
    )
    state.activity_options = result
    return state

def call_get_weather_info(state: TravelState) -> TravelState:
    user_input = state.user_input
    result = get_weather_info(
        destination=user_input["destination"],
        start_date=user_input["start_date"],
        duration=user_input["duration"]
    )
    state.weather_info = result
    state.safety_alerts = result.get("safety_alerts", [])
    return state

def call_analyze_budget(state: TravelState) -> TravelState:
    # Calculate costs from selected options or first available
    flight_cost = state.flight_options[0]["price"] * state.user_input["travelers"] if state.flight_options else 0
    hotel_cost = state.hotel_options[0]["price"] * state.user_input["duration"] * state.user_input["travelers"] if state.hotel_options else 0
    activity_cost = sum(activity["price"] for activity in state.activity_options) if state.activity_options else 0

    result = analyze_budget(
        flight_cost=flight_cost,
        hotel_cost=hotel_cost,
        activity_cost=activity_cost,
        total_budget=state.user_input["budget"],
        travelers=state.user_input["travelers"]
    )
    state.budget_analysis = result
    return state

def call_create_itinerary(state: TravelState) -> TravelState:
    result = create_itinerary(
        activities=state.activity_options,
        duration=state.user_input["duration"],
        weather_info=state.weather_info,
        safety_alerts=state.safety_alerts,
        start_date=state.user_input["start_date"]
    )
    state.final_itinerary = result
    # Add recommendations from budget analysis to overall recommendations
    state.recommendations.extend(state.budget_analysis.get("recommendations", []))
    # Add weather-based recommendations
    for day_itinerary in result:
        if day_itinerary.get("travel_tips"):
            state.recommendations.extend(day_itinerary["travel_tips"])
    return state

travel_workflow = create_travel_workflow()

@app.post("/api/plan", response_model=TravelResponse)
async def plan_travel(request: Dict[str, Any]):
    """Main endpoint for travel planning"""
    try:
        if isinstance(request, dict):
            destination = request.get("destination")
            start_date = request.get("startDate") or request.get("start_date")
            duration = int(request.get("duration")) if request.get("duration") is not None else 0
            budget = (
                float(request.get("budgetMax"))
                if request.get("budgetMax") is not None
                else float(request.get("budgetMin", 0))
            )
            preferences = request.get("preferences") or []
            travelers = int(request.get("travelers", 1))
            travel_style = request.get("travelStyle") or request.get("travel_style") or "balanced"

            req = TravelRequest(
                destination=destination,
                start_date=start_date,
                duration=duration,
                budget=budget,
                preferences=preferences,
                travelers=travelers,
                travel_style=travel_style,
            )
        else:
            req = request

        # Always use simplified travel planning
        return await simplified_travel_planning(req)
        
    except Exception as e:
        print(f"Error in simplified_travel_planning: {e}")
        raise HTTPException(status_code=500, detail=f"Travel planning failed: {str(e)}")

async def simplified_travel_planning(request: TravelRequest) -> TravelResponse:
    """Simplified travel planning when LangGraph is not available"""
    try:
        safe_duration = request.duration if request.duration > 0 else 1
        safe_travelers = request.travelers if request.travelers > 0 else 1
        safe_budget = request.budget if request.budget > 0 else 1

        user_profile = analyze_user_preferences(
            request.destination, 
            request.preferences, 
            safe_budget, 
            safe_duration
        )
        
        flight_options = find_flight_options(
            request.destination, 
            request.start_date, 
            safe_budget, 
            safe_travelers
        )
        
        hotel_options = find_hotel_options(
            request.destination, 
            safe_duration, 
            safe_budget, 
            safe_travelers, 
            user_profile.get("travel_style", "balanced")
        )
        
        # Try real-time activities first, fall back to mock data
        try:
            activity_options = await find_activities_real_time(
                request.destination, 
                safe_duration, 
                request.preferences, 
                safe_budget
            )
        except:
            activity_options = find_activities(
                request.destination, 
                safe_duration, 
                request.preferences, 
                safe_budget
            )
        
        # Try real-time weather first, fall back to mock data
        try:
            from real_api_config import real_api_manager
            weather_info = await real_api_manager.get_real_weather(
                request.destination, 
                request.start_date, 
                safe_duration
            )
            if not weather_info:  # If real API returns empty, use mock
                weather_info = get_weather_info(
                    request.destination, 
                    request.start_date, 
                    safe_duration
                )
            else:
                print("✅ Using real-time weather data")
        except Exception as e:
            print(f"⚠️ Real weather API error: {e}, using mock data")
            weather_info = get_weather_info(
                request.destination, 
                request.start_date, 
                safe_duration
            )
        
        # --- CORRECTED COST CALCULATION ---
        flight_cost = flight_options[0]["price"] * safe_travelers if flight_options else 0
        hotel_cost = hotel_options[0]["price"] * safe_duration if hotel_options else 0
        activity_cost = sum(activity["price"] for activity in activity_options)
        # --- END CORRECTED COST CALCULATION ---

        budget_analysis = analyze_budget(
            flight_cost, 
            hotel_cost, 
            activity_cost, 
            safe_budget, 
            safe_travelers
        )
        
        itinerary = create_itinerary(
            activity_options, 
            safe_duration, 
            weather_info, 
            weather_info.get("safety_alerts", []),
            request.start_date
        )
        
        summary = f"Your {safe_duration}-day trip to {request.destination} is planned! "
        summary += f"Total cost: ${budget_analysis['total_cost']:.2f}. "
        summary += f"Style: {user_profile.get('travel_style', 'balanced').title()}. "
        summary += f"Budget status: {budget_analysis.get('budget_status', 'unknown').replace('_', ' ').title()}."
        
        return TravelResponse(
            itinerary=itinerary,
            total_cost=budget_analysis["total_cost"],
            summary=summary,
            recommendations=budget_analysis.get("recommendations", [])
        )
        
    except Exception as e:
        print(f"Error in simplified_travel_planning: {e}")
        return TravelResponse(
            itinerary=[],
            total_cost=0,
            summary=f"Trip planning to {request.destination} is temporarily unavailable. Please try again later.",
            recommendations=["Please try again later or contact support if the issue persists."]
        )


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/places/search")
async def search_places(q: str):
    """Simple destination suggestions from mock HOTELS/ACTIVITIES data"""
    query = (q or "").strip().lower()
    if not query:
        return []
    seen = set()
    results = []
    for hotel in HOTELS:
        name = hotel.get("location", "")
        if name and query in name.lower() and name not in seen:
            results.append({"name": name})
            seen.add(name)
            if len(results) >= 10:
                break
    if len(results) < 10:
        for act in ACTIVITIES:
            name = act.get("location", "")
            if name and query in name.lower() and name not in seen:
                results.append({"name": name})
                seen.add(name)
                if len(results) >= 10:
                    break
    return results

@app.get("/api/destinations")
async def get_destinations():
    """Get available destinations from mock data"""
    destinations = set()
    for hotel in HOTELS:
        destinations.add(hotel["location"])
    return {"destinations": list(destinations)}

# Analytics endpoints
@app.get("/api/analytics/health")
async def analytics_health():
    """Analytics service health check"""
    if not ANALYTICS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Analytics service not available")
    return {"status": "healthy", "service": "analytics", "timestamp": datetime.now().isoformat()}

@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard(time_range: str = "month"):
    """Get analytics dashboard data"""
    if not ANALYTICS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Analytics service not available")
    try:
        data = await get_dashboard_data(time_range)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@app.get("/api/analytics/realtime")
async def get_analytics_realtime():
    """Get real-time analytics metrics"""
    if not ANALYTICS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Analytics service not available")
    try:
        data = await get_real_time_metrics()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real-time analytics error: {str(e)}")

@app.get("/api/analytics/real-time")
async def get_analytics_realtime_alias():
    return await get_analytics_realtime()

# Chat endpoints
@app.get("/api/chat/health")
async def chat_health():
    """Chat service health check"""
    if not CHAT_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chat service not available")
    return {"status": "healthy", "service": "chat", "timestamp": datetime.now().isoformat()}

@app.post("/api/chat/message")
async def send_chat_message(request: Dict[str, Any]):
    """Send a message to the AI chat"""
    if not CHAT_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chat service not available")
    
    try:
        user_id = request.get("user_id", "anonymous")
        message = request.get("message", "")
        session_id = request.get("session_id")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        response = await chat_endpoint(user_id, message, session_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.post("/api/chat/session")
async def create_chat_session(request: Dict[str, Any]):
    """Create a new chat session"""
    if not CHAT_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chat service not available")
    
    try:
        user_id = request.get("user_id", "anonymous")
        trip_id = request.get("trip_id")
        
        session_id = await start_chat_session(user_id, trip_id)
        return {"session_id": session_id, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session creation error: {str(e)}")

@app.get("/api/chat/history/{user_id}")
async def get_user_chat_history(user_id: str, session_id: Optional[str] = None):
    """Get chat history for a user"""
    if not CHAT_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chat service not available")
    
    try:
        history = await get_chat_history(user_id, session_id)
        return {"user_id": user_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History retrieval error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)