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

# Try to import LangGraph and LangChain components
try:
    from langgraph.graph import StateGraph, END
    from langgraph.prebuilt import ToolExecutor
    from langchain_core.tools import tool
    from langchain_core.messages import HumanMessage, AIMessage
    LANGGRAPH_AVAILABLE = True
except ImportError as e:
    print(f"Warning: LangGraph/LangChain not available: {e}")
    LANGGRAPH_AVAILABLE = False
    # Create dummy classes to prevent errors
    class StateGraph:
        def __init__(self, *args, **kwargs):
            pass
        def add_node(self, *args, **kwargs):
            pass
        def add_edge(self, *args, **kwargs):
            pass
        def set_entry_point(self, *args, **kwargs):
            pass
        def compile(self):
            return None
    
    class END:
        pass
    
    class ToolExecutor:
        pass
    
    def tool(func):
        return func
    
    class HumanMessage:
        def __init__(self, *args, **kwargs):
            pass
    
    class AIMessage:
        def __init__(self, *args, **kwargs):
            pass

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
    travel_style: Optional[str] = "balanced"  # luxury, budget, adventure, balanced

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
@tool
def analyze_user_preferences(destination: str, preferences: List[str], budget: float, duration: int) -> Dict[str, Any]:
    """Analyze user preferences and determine travel style"""
    travel_style = "balanced"
    if "luxury" in preferences or budget > 5000:
        travel_style = "luxury"
    elif "budget" in preferences or budget < 2000:
        travel_style = "budget"
    elif "adventure" in preferences:
        travel_style = "adventure"
    
    return {
        "travel_style": travel_style,
        "priority_activities": preferences,
        "budget_per_day": budget / duration,
        "comfort_level": "high" if travel_style == "luxury" else "medium" if travel_style == "balanced" else "basic"
    }

@tool
def find_flight_options(destination: str, start_date: str, budget: float, travelers: int) -> List[Dict[str, Any]]:
    """Find suitable flight options based on destination and budget"""
    # Filter flights by destination (simplified matching)
    destination_keywords = destination.lower().split()
    suitable_flights = []
    
    for flight in FLIGHTS:
        # Simple destination matching (in real app, use proper airport codes)
        if any(keyword in flight["destination"].lower() or keyword in flight["airline"].lower() for keyword in destination_keywords):
            if flight["price"] * travelers <= budget * 0.4:  # Flights should be max 40% of budget
                suitable_flights.append(flight)
    
    # Sort by price and safety rating
    suitable_flights.sort(key=lambda x: (x["price"], -x["safetyRating"]))
    return suitable_flights[:3]  # Return top 3 options

@tool
def find_hotel_options(destination: str, duration: int, budget: float, travelers: int, travel_style: str) -> List[Dict[str, Any]]:
    """Find suitable hotel options based on destination, budget, and travel style"""
    destination_keywords = destination.lower().split()
    suitable_hotels = []
    
    for hotel in HOTELS:
        if any(keyword in hotel["location"].lower() for keyword in destination_keywords):
            total_cost = hotel["price"] * duration * travelers
            if total_cost <= budget * 0.5:  # Hotels should be max 50% of budget
                # Filter by travel style
                if travel_style == "luxury" and hotel["price"] >= 300:
                    suitable_hotels.append(hotel)
                elif travel_style == "budget" and hotel["price"] <= 150:
                    suitable_hotels.append(hotel)
                elif travel_style == "balanced" or travel_style == "adventure":
                    suitable_hotels.append(hotel)
    
    # Sort by rating and safety
    suitable_hotels.sort(key=lambda x: (-x["rating"], -x["safetyRating"]))
    return suitable_hotels[:3]

@tool
def find_activities(destination: str, duration: int, preferences: List[str], budget: float) -> List[Dict[str, Any]]:
    """Find suitable activities based on destination, preferences, and budget"""
    destination_keywords = destination.lower().split()
    suitable_activities = []
    
    for activity in ACTIVITIES:
        if any(keyword in activity["location"].lower() for keyword in destination_keywords):
            # Check if activity matches preferences
            if any(pref.lower() in activity["tags"] or pref.lower() in activity["category"].lower() for pref in preferences):
                if activity["price"] <= budget * 0.1:  # Activities should be max 10% of budget per day
                    suitable_activities.append(activity)
    
    # Sort by rating and authenticity
    suitable_activities.sort(key=lambda x: (-x["rating"], -x["authenticLocal"]))
    return suitable_activities[:duration * 2]  # 2 activities per day

@tool
def get_weather_info(destination: str, start_date: str, duration: int) -> Dict[str, Any]:
    """Get weather information for the destination and travel dates"""
    destination_keywords = destination.lower().split()
    
    for weather_data in WEATHER:
        if any(keyword in weather_data["location"].lower() for keyword in destination_keywords):
            return {
                "current": weather_data["currentWeather"],
                "forecast": weather_data["forecast"][:duration],
                "events": weather_data["events"],
                "safety_alerts": weather_data["safetyAlerts"]
            }
    
    # Return default weather if destination not found
    return {
        "current": {"temperature": 20, "condition": "Unknown", "humidity": 60, "windSpeed": 10, "visibility": "Good"},
        "forecast": [],
        "events": [],
        "safety_alerts": []
    }

@tool
def analyze_budget(flight_cost: float, hotel_cost: float, activity_cost: float, total_budget: float, travelers: int) -> Dict[str, Any]:
    """Analyze budget allocation and provide recommendations"""
    total_cost = flight_cost + hotel_cost + activity_cost
    remaining_budget = total_budget - total_cost
    budget_per_person = total_cost / travelers
    
    analysis = {
        "total_cost": total_cost,
        "remaining_budget": remaining_budget,
        "budget_per_person": budget_per_person,
        "budget_breakdown": {
            "flights": {"cost": flight_cost, "percentage": (flight_cost / total_budget) * 100},
            "hotels": {"cost": hotel_cost, "percentage": (hotel_cost / total_budget) * 100},
            "activities": {"cost": activity_cost, "percentage": (activity_cost / total_budget) * 100}
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

@tool
def create_itinerary(activities: List[Dict], duration: int, weather_info: Dict, safety_alerts: List[Dict]) -> List[Dict[str, Any]]:
    """Create a day-by-day itinerary with optimal scheduling"""
    itinerary = []
    
    # Group activities by day
    activities_per_day = len(activities) // duration
    remaining_activities = len(activities) % duration
    
    for day in range(1, duration + 1):
        day_activities = activities[(day-1) * activities_per_day:day * activities_per_day]
        if day <= remaining_activities:
            day_activities.append(activities[-(day)])
        
        # Get weather for this day
        day_weather = weather_info.get("forecast", [])
        weather_condition = day_weather[day-1] if day-1 < len(day_weather) else {"condition": "Unknown", "precipitation": 0}
        
        # Schedule activities based on weather and crowd levels
        morning_activities = []
        afternoon_activities = []
        evening_activities = []
        
        for activity in day_activities:
            if weather_condition.get("precipitation", 0) > 50 and "outdoor" in activity.get("tags", []):
                # Move outdoor activities to better weather days if possible
                continue
            
            if activity.get("bestTime") == "Morning":
                morning_activities.append(activity)
            elif activity.get("bestTime") == "Evening":
                evening_activities.append(activity)
            else:
                afternoon_activities.append(activity)
        
        # Create day schedule
        day_schedule = {
            "day": day,
            "date": (datetime.now() + timedelta(days=day-1)).strftime("%Y-%m-%d"),
            "weather": weather_condition,
            "morning": morning_activities[:2],  # Max 2 morning activities
            "afternoon": afternoon_activities[:2],  # Max 2 afternoon activities
            "evening": evening_activities[:1],  # Max 1 evening activity
            "total_activities": len(morning_activities) + len(afternoon_activities) + len(evening_activities),
            "estimated_cost": sum(act.get("price", 0) for act in day_activities),
            "travel_tips": []
        }
        
        # Add travel tips based on weather and safety
        if weather_condition.get("precipitation", 0) > 50:
            day_schedule["travel_tips"].append("Bring umbrella and waterproof clothing")
        if weather_condition.get("temperature", 20) > 30:
            day_schedule["travel_tips"].append("Stay hydrated and avoid outdoor activities during peak heat")
        
        # Add safety tips
        for alert in safety_alerts:
            if alert.get("severity") in ["High", "Medium"]:
                day_schedule["travel_tips"].append(f"Safety Alert: {alert.get('message', '')}")
        
        itinerary.append(day_schedule)
    
    return itinerary

# LangGraph workflow
def create_travel_workflow():
    """Create the LangGraph workflow for travel planning"""
    if not LANGGRAPH_AVAILABLE:
        print("Warning: LangGraph not available, using simplified workflow")
        return None
    
    try:
        # Define the state graph
        workflow = StateGraph(TravelState)
        
        # Add nodes for each agent
        workflow.add_node("user_agent", analyze_user_preferences)
        workflow.add_node("flight_agent", find_flight_options)
        workflow.add_node("hotel_agent", find_hotel_options)
        workflow.add_node("activity_agent", find_activities)
        workflow.add_node("weather_agent", get_weather_info)
        workflow.add_node("budget_agent", analyze_budget)
        workflow.add_node("planner_agent", create_itinerary)
        
        # Define the workflow
        workflow.set_entry_point("user_agent")
        workflow.add_edge("user_agent", "flight_agent")
        workflow.add_edge("flight_agent", "hotel_agent")
        workflow.add_edge("hotel_agent", "activity_agent")
        workflow.add_edge("activity_agent", "weather_agent")
        workflow.add_edge("weather_agent", "budget_agent")
        workflow.add_edge("budget_agent", "planner_agent")
        workflow.add_edge("planner_agent", END)
        
        return workflow.compile()
    except Exception as e:
        print(f"Warning: Failed to create LangGraph workflow: {e}")
        return None

# Initialize the workflow
travel_workflow = create_travel_workflow()

@app.post("/api/plan", response_model=TravelResponse)
async def plan_travel(request: TravelRequest):
    """Main endpoint for travel planning"""
    try:
        if travel_workflow is None:
            # Fallback to simplified planning when LangGraph is not available
            return await simplified_travel_planning(request)
        
        # Initialize state
        initial_state = TravelState(
            user_input={
                "destination": request.destination,
                "start_date": request.start_date,
                "duration": request.duration,
                "budget": request.budget,
                "preferences": request.preferences,
                "travelers": request.travelers,
                "travel_style": request.travel_style
            },
            user_profile={},
            flight_options=[],
            hotel_options=[],
            activity_options=[],
            weather_info={},
            safety_alerts=[],
            budget_analysis={},
            final_itinerary=[],
            recommendations=[],
            errors=[]
        )
        
        # Execute the workflow
        result = travel_workflow.invoke(initial_state)
        
        # Extract results
        itinerary = result.final_itinerary
        total_cost = result.budget_analysis.get("total_cost", 0)
        
        # Generate summary
        summary = f"Your {request.duration}-day trip to {request.destination} is planned! "
        summary += f"Total cost: ${total_cost:.2f}. "
        summary += f"Style: {result.user_profile.get('travel_style', 'balanced').title()}. "
        summary += f"Budget status: {result.budget_analysis.get('budget_status', 'unknown').replace('_', ' ').title()}."
        
        # Generate recommendations
        recommendations = []
        if result.budget_analysis.get("budget_status") == "over_budget":
            recommendations.append("Consider extending your trip duration to spread costs")
            recommendations.append("Look for package deals combining flights and hotels")
        if result.weather_info.get("current", {}).get("temperature", 20) > 30:
            recommendations.append("Pack light clothing and stay hydrated")
        if any(alert.get("severity") == "High" for alert in result.safety_alerts):
            recommendations.append("Check local safety advisories before departure")
        
        return TravelResponse(
            itinerary=itinerary,
            total_cost=total_cost,
            summary=summary,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Travel planning failed: {str(e)}")

async def simplified_travel_planning(request: TravelRequest) -> TravelResponse:
    """Simplified travel planning when LangGraph is not available"""
    try:
        # Use the individual tools directly
        user_profile = analyze_user_preferences(
            request.destination, 
            request.preferences, 
            request.budget, 
            request.duration
        )
        
        flight_options = find_flight_options(
            request.destination, 
            request.start_date, 
            request.budget, 
            request.travelers
        )
        
        hotel_options = find_hotel_options(
            request.destination, 
            request.duration, 
            request.budget, 
            request.travelers, 
            user_profile.get("travel_style", "balanced")
        )
        
        activity_options = find_activities(
            request.destination, 
            request.duration, 
            request.preferences, 
            request.budget
        )
        
        weather_info = get_weather_info(
            request.destination, 
            request.start_date, 
            request.duration
        )
        
        # Calculate costs
        flight_cost = sum(flight["price"] for flight in flight_options[:1]) * request.travelers
        hotel_cost = sum(hotel["price"] for hotel in hotel_options[:1]) * request.duration * request.travelers
        activity_cost = sum(activity["price"] for activity in activity_options)
        
        budget_analysis = analyze_budget(
            flight_cost, 
            hotel_cost, 
            activity_cost, 
            request.budget, 
            request.travelers
        )
        
        # Create simple itinerary
        itinerary = create_itinerary(
            activity_options, 
            request.duration, 
            weather_info, 
            weather_info.get("safety_alerts", [])
        )
        
        # Generate summary
        summary = f"Your {request.duration}-day trip to {request.destination} is planned! "
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
        # Return a basic response if everything fails
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
