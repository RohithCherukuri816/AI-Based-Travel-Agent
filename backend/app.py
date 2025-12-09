"""
AI Travel Planning Agent - FastAPI Backend with LangGraph
Multi-agent system for personalized travel itinerary generation
"""

import os
from typing import List, Dict, Any, Optional
import asyncio
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import new service layer
from schemas import TravelRequest, TravelResponse, TravelState
from services.factory import get_travel_provider
from services.planning_service import create_itinerary, analyze_budget
from services.travel_provider import TravelDataProvider

# Load environment variables
load_dotenv()

# Initialize Config & Provider
travel_provider: TravelDataProvider = get_travel_provider()

# Try to import LangGraph and LangChain components
try:
    from langgraph.graph import StateGraph
    # from langgraph.prebuilt import ToolNode # Not currently used?
    # from langchain_core.tools import tool # Not currently used?
    LANGGRAPH_AVAILABLE = True
except ImportError as e:
    print(f"Warning: LangGraph/LangChain not available: {e}")
    LANGGRAPH_AVAILABLE = False
    class StateGraph:
        def __init__(self, *args, **kwargs): pass
        def add_node(self, *args, **kwargs): pass
        def add_edge(self, *args, **kwargs): pass
        def set_entry_point(self, *args, **kwargs): pass
        def compile(self): return None
    class END: pass

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
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Agent executor functions (Wrappers for the provider) ---

async def call_analyze_user_preferences(state: TravelState): # Made async for consistency
    user_input = state.user_input
    # Provider interface is synchronous for this one in base class? 
    # Current implementation in Mock is sync, Real delegates to fallback (Mock) which is sync.
    # Let's wrapping it if needed or just call it.
    result = travel_provider.analyze_user_preferences(
        destination=user_input.get("destination", ""),
        preferences=user_input.get("preferences", []),
        budget=user_input.get("budget", 0),
        duration=user_input.get("duration", 1)
    )
    state.user_profile = result
    return state

async def call_find_flight_options(state: TravelState):
    user_input = state.user_input
    try:
        result = await travel_provider.get_flights(
            origin=user_input.get("origin", "New York"), # Default origin if missing
            destination=user_input.get("destination", ""),
            start_date=user_input.get("start_date", ""),
            budget=user_input.get("budget", 0),
            travelers=user_input.get("travelers", 1)
        )
        state.flight_options = result
    except Exception as e:
        print(f"Error fetching flights: {e}")
        state.errors.append(f"Flight search failed: {str(e)}")
        state.flight_options = []
    return state

async def call_find_hotel_options(state: TravelState):
    user_input = state.user_input
    profile = state.user_profile
    try:
        result = await travel_provider.get_hotels(
            destination=user_input.get("destination", ""),
            start_date=user_input.get("start_date", ""),
            duration=user_input.get("duration", 1),
            budget=user_input.get("budget", 0),
            travelers=user_input.get("travelers", 1),
            travel_style=profile.get("travel_style", "balanced")
        )
        state.hotel_options = result
    except Exception as e:
        print(f"Error fetching hotels: {e}")
        state.errors.append(f"Hotel search failed: {str(e)}")
        state.hotel_options = []
    return state

async def call_find_activities(state: TravelState):
    user_input = state.user_input
    try:
        result = await travel_provider.get_activities(
            destination=user_input.get("destination", ""),
            duration=user_input.get("duration", 1),
            preferences=user_input.get("preferences", []),
            budget=user_input.get("budget", 0)
        )
        state.activity_options = result
    except Exception as e:
         print(f"Error fetching activities: {e}")
         state.errors.append(f"Activity search failed: {str(e)}")
         state.activity_options = []
    return state

async def call_get_weather_info(state: TravelState):
    user_input = state.user_input
    try:
        result = await travel_provider.get_weather(
            destination=user_input.get("destination", ""),
            start_date=user_input.get("start_date", ""),
            duration=user_input.get("duration", 1)
        )
        state.weather_info = result
    except Exception as e:
        print(f"Error fetching weather: {e}")
        state.weather_info = {}
    return state

async def call_create_itinerary(state: TravelState):
    # This uses logic from PlanningService
    try:
        itinerary = create_itinerary(
            activities=state.activity_options,
            duration=state.user_input.get("duration", 1),
            weather_info=state.weather_info,
            safety_alerts=state.safety_alerts,
            start_date=state.user_input.get("start_date", "")
        )
        state.final_itinerary = itinerary
        
        # Calculate totals
        flight_cost = sum(f.get("price", 0) for f in state.flight_options) if state.flight_options else 0
        hotel_cost = sum(h.get("price", 0) for h in state.hotel_options) * state.user_input.get("duration", 1) if state.hotel_options else 0
        # Wait, hotel options are OPTIONS. We usually pick one? 
        # The previous code logic assumed the cheapest or first? 
        # Actually previous create_itinerary logic calculated DAILY cost of activities.
        # Flight/Hotel selection is usually done by user in real app, but here agent "proposes" options. 
        # For budget estimation we might take average or min?
        # Let's assume best option (index 0) if available.
        
        selected_flight_cost = state.flight_options[0].get("price", 0) * state.user_input.get("travelers", 1) if state.flight_options else 0
        selected_hotel_cost = state.hotel_options[0].get("price", 0) * state.user_input.get("duration", 1) * state.user_input.get("travelers", 1) if state.hotel_options else 0
        # Activity cost is sum of itinerary activities
        activity_cost = sum(day.get("estimated_cost", 0) for day in itinerary)
        
        # Analyze budget
        analysis = analyze_budget(
            flight_cost=selected_flight_cost,
            hotel_cost=selected_hotel_cost,
            activity_cost=activity_cost,
            total_budget=state.user_input.get("budget", 0),
            travelers=state.user_input.get("travelers", 1)
        )
        state.budget_analysis = analysis
        state.recommendations = analysis.get("recommendations", [])
        
    except Exception as e:
        print(f"Error creating itinerary: {e}")
        state.errors.append(f"Itinerary creation failed: {str(e)}")
        
    return state

# --- Workflow Definition ---

def create_travel_workflow():
    if not LANGGRAPH_AVAILABLE:
        return None
    
    # Simple sequential graph
    workflow = StateGraph(TravelState)
    
    # Add nodes
    workflow.add_node("analyze_needs", call_analyze_user_preferences)
    workflow.add_node("find_flights", call_find_flight_options)
    workflow.add_node("find_hotels", call_find_hotel_options)
    workflow.add_node("find_activities", call_find_activities)
    workflow.add_node("get_weather", call_get_weather_info)
    workflow.add_node("create_itinerary", call_create_itinerary)
    
    # Add edges (sequential)
    workflow.set_entry_point("analyze_needs")
    workflow.add_edge("analyze_needs", "find_flights")
    workflow.add_edge("find_flights", "find_hotels")
    workflow.add_edge("find_hotels", "find_activities")
    workflow.add_edge("find_activities", "get_weather")
    workflow.add_edge("get_weather", "create_itinerary")
    # workflow.add_edge("create_itinerary", END) # END is special
    
    return workflow.compile()

# Initialize workflow
travel_app = create_travel_workflow()

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "AI Travel Agent API is running", "provider": travel_provider.__class__.__name__}

@app.post("/api/plan", response_model=TravelResponse)
async def plan_trip(request: TravelRequest):
    print(f"📝 Received planning request for: {request.destination}")
    
    # Setup initial state
    initial_state = TravelState(
        user_input=request.model_dump(),
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
    
    # Execute workflow manually if LangGraph is not available or fails
    try:
        if travel_app:
            # invoke returns the final state
            final_state_dict = await travel_app.ainvoke(initial_state) 
            # Depending on langgraph version, it might return dict or object. 
            # Assuming dict for safety given previous code patterns, or casting.
            # If it returns the state object, we just use it.
            # But standard langgraph .invoke returns dict of state
            final_state = TravelState(**final_state_dict) if isinstance(final_state_dict, dict) else final_state_dict
        else:
            # Manual execution sequence
            print("🔄 Executing manual workflow...")
            state = initial_state
            state = await call_analyze_user_preferences(state)
            state = await call_find_flight_options(state)
            state = await call_find_hotel_options(state)
            state = await call_find_activities(state)
            state = await call_get_weather_info(state)
            state = await call_create_itinerary(state)
            final_state = state
            
        # Construct response
        total_cost = final_state.budget_analysis.get("total_cost", 0) if final_state.budget_analysis else 0
        summary = f"Trip to {request.destination} for {request.duration} days. Estimated total cost: ${total_cost:.2f}."
        if final_state.errors:
            summary += f" (Note: {len(final_state.errors)} errors occurred during planning)"
            
        return TravelResponse(
            itinerary=final_state.final_itinerary,
            total_cost=total_cost,
            summary=summary,
            recommendations=final_state.recommendations
        )
        
    except Exception as e:
        print(f"❌ Error in planning workflow: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Include other routers
if ANALYTICS_AVAILABLE:
    app.include_router(analytics_dashboard, prefix="/api/analytics", tags=["Analytics"])

if CHAT_AVAILABLE:
    app.include_router(chat_endpoint, prefix="/api", tags=["Chat"]) # Note: prefix might differ in original app, checking...

# Real-time specific endpoints (Legacy support or direct access)
@app.get("/api/realtime-status")
async def check_realtime_status():
    from real_api_config import get_real_time_status
    return await get_real_time_status()

# Real-time data endpoints supporting api.ts
from schemas import RealTimeRequest

@app.post("/api/realtime/weather")
async def get_realtime_weather(req: RealTimeRequest):
    return await travel_provider.get_weather(req.destination, req.start_date or "2024-01-01", req.duration or 3)

@app.post("/api/realtime/activities")
async def get_realtime_activities(req: RealTimeRequest):
    return await travel_provider.get_activities(req.destination, req.duration or 3, req.preferences or [], req.budget or 1000)

@app.post("/api/realtime/flights")
async def get_realtime_flights(req: RealTimeRequest):
    return await travel_provider.get_flights(req.origin or "New York", req.destination, req.start_date or "2024-01-01", req.budget or 5000, req.travelers or 1)

@app.post("/api/realtime/hotels")
async def get_realtime_hotels(req: RealTimeRequest):
    return await travel_provider.get_hotels(req.destination, req.start_date or "2024-01-01", req.duration or 3, req.budget or 5000, req.travelers or 1, "balanced")

@app.post("/api/comprehensive-travel-data")
async def get_comprehensive_data(req: RealTimeRequest):
    # Parallel fetch
    flights, hotels, activities, weather = await asyncio.gather(
        travel_provider.get_flights(req.origin or "New York", req.destination, req.start_date or "2024-01-01", req.budget or 5000, req.travelers or 1),
        travel_provider.get_hotels(req.destination, req.start_date or "2024-01-01", req.duration or 3, req.budget or 5000, req.travelers or 1, "balanced"),
        travel_provider.get_activities(req.destination, req.duration or 3, req.preferences or [], req.budget or 1000),
        travel_provider.get_weather(req.destination, req.start_date or "2024-01-01", req.duration or 3)
    )
    return {
        "flights": flights,
        "hotels": hotels,
        "activities": activities,
        "weather": weather
    }


# Additional endpoints (proxied to provider if needed, or keeping legacy structure)
@app.get("/api/destinations")
def get_popular_destinations():
    return [
        {"id": 1, "name": "Paris, France", "image": "paris.jpg", "description": "City of Light"},
        {"id": 2, "name": "Tokyo, Japan", "image": "tokyo.jpg", "description": "Modern meets Traditional"},
        {"id": 3, "name": "New York, USA", "image": "nyc.jpg", "description": "The Big Apple"},
        {"id": 4, "name": "Bali, Indonesia", "image": "bali.jpg", "description": "Tropical Paradise"}
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)