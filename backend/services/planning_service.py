from datetime import datetime, timedelta
from typing import List, Dict, Any

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
    
    # Remove duplicates
    unique_activities = []
    seen_activities = set()
    for activity in activities:
        activity_key = f"{activity.get('name', '')}-{activity.get('location', '')}"
        if activity_key not in seen_activities:
            unique_activities.append(activity)
            seen_activities.add(activity_key)
    
    activities = unique_activities
    
    start_dt = datetime.fromisoformat(start_date)
    used_activities = set()
    
    for day in range(1, duration + 1):
        day_weather = weather_info.get("forecast", [])
        weather_condition = day_weather[day-1] if day-1 < len(day_weather) else {
            "condition": "Sunny", 
            "precipitation": 0, 
            "high": 25, 
            "low": 15
        }
        
        # Get available activities not used yet
        available_activities = [act for act in activities if act.get('id', act.get('name', '')) not in used_activities]
        
        # Reset pool if empty
        if len(available_activities) < 3:
            available_activities = activities.copy()
            used_activities.clear()
        
        day_schedule = _plan_day(day, start_dt, weather_condition, available_activities, used_activities, safety_alerts, duration)
        itinerary.append(day_schedule)
    
    return itinerary

def _plan_day(day, start_dt, weather_condition, available_activities, used_activities, safety_alerts, total_duration):
    """Helper to plan a single day"""
    morning_activities = []
    afternoon_activities = []
    evening_activities = []
    activities_for_day = []

    # Categorize
    morning_candidates = [act for act in available_activities if 
                        act.get("bestTime", "").lower() in ["morning", "early morning"] or
                        "temple" in act.get("tags", []) or "museum" in act.get("category", "").lower()]
    
    afternoon_candidates = [act for act in available_activities if 
                          act.get("bestTime", "").lower() in ["afternoon", "day"] or
                          "shopping" in act.get("tags", []) or "sightseeing" in act.get("category", "").lower()]
    
    evening_candidates = [act for act in available_activities if 
                        act.get("bestTime", "").lower() in ["evening", "night"] or
                        "nightlife" in act.get("tags", []) or "bar" in act.get("tags", [])]

    # Select one for each slot
    # Morning
    if morning_candidates:
        act = morning_candidates[0]
        act_copy = act.copy()
        act_copy["bestTime"] = "Morning"
        morning_activities.append(act_copy)
        activities_for_day.append(act_copy)
        used_activities.add(act.get('id', act.get('name', '')))

    # Afternoon
    # Re-filter availables just in case of overlap (though lists were filtered before)
    # Simplified selection for brevity
    afternoon_pool = [act for act in available_activities if act.get('id', act.get('name', '')) not in used_activities]
    act = next((a for a in afternoon_candidates if a.get('id', a.get('name', '')) not in used_activities), None)
    if not act and afternoon_pool: act = afternoon_pool[0]
    
    if act:
        act_copy = act.copy()
        act_copy["bestTime"] = "Afternoon"
        afternoon_activities.append(act_copy)
        activities_for_day.append(act_copy)
        used_activities.add(act.get('id', act.get('name', '')))

    # Evening
    evening_pool = [act for act in available_activities if act.get('id', act.get('name', '')) not in used_activities]
    act = next((a for a in evening_candidates if a.get('id', a.get('name', '')) not in used_activities), None)
    if not act and evening_pool: act = evening_pool[0]

    if act:
        act_copy = act.copy()
        act_copy["bestTime"] = "Evening"
        evening_activities.append(act_copy)
        activities_for_day.append(act_copy)
        used_activities.add(act.get('id', act.get('name', '')))

    day_cost = sum(act.get("price", 0) for act in activities_for_day)
    
    # Tips logic 
    travel_tips = _generate_tips(day, total_duration, weather_condition, activities_for_day, safety_alerts)

    return {
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

def _generate_tips(day, duration, weather_condition, activities, safety_alerts):
    travel_tips = []
    
    # Weather
    if weather_condition.get("precipitation", 0) > 50:
        travel_tips.append("Pack an umbrella and waterproof jacket - rain is expected today.")
    elif weather_condition.get("high", 20) > 30:
        travel_tips.append("Stay hydrated and wear sunscreen - it's going to be a hot day!")
    elif weather_condition.get("high", 20) < 10:
        travel_tips.append("Bundle up warm - temperatures will be quite chilly today.")
    
    # Activities
    activity_categories = [act.get("category", "") for act in activities]
    if any("food" in cat.lower() for cat in activity_categories):
        travel_tips.append("Come hungry - you'll be experiencing amazing local cuisine today!")
    if any("temple" in act.get("tags", []) for act in activities):
        travel_tips.append("Dress modestly when visiting temples and religious sites.")
    
    # General
    if day == 1:
        travel_tips.append("Welcome to your adventure! Take it easy on your first day.")
    elif day == duration:
        travel_tips.append("Last day - make it memorable!")
    
    # Safety
    for alert in safety_alerts:
        if alert.get("severity") in ["High", "Medium"]:
            travel_tips.append(f"Safety Alert: {alert.get('message', 'Stay alert.')}")
            
    if not travel_tips:
        travel_tips = ["Enjoy your day!"]
        
    return travel_tips
