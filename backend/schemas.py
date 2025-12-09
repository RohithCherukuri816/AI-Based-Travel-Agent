from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TravelRequest(BaseModel):
    destination: str
    start_date: str
    duration: int
    budget: float
    preferences: List[str]
    travelers: int = 1
    travel_style: Optional[str] = "balanced"

class RealTimeRequest(BaseModel):
    destination: str
    origin: Optional[str] = "New York"
    start_date: Optional[str] = None
    duration: Optional[int] = 3
    budget: Optional[float] = 3000
    preferences: Optional[List[str]] = []
    travelers: Optional[int] = 1


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
