import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .travel_provider import TravelDataProvider

class MockTravelProvider(TravelDataProvider):
    """
    Implementation of TravelDataProvider using local JSON files.
    """

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.flights = []
        self.hotels = []
        self.activities = []
        self.weather = []
        self._load_data()

    def _load_data(self):
        """Load mock datasets"""
        try:
            with open(os.path.join(self.data_dir, "flights.json"), "r") as f:
                self.flights = json.load(f)
            with open(os.path.join(self.data_dir, "hotels.json"), "r") as f:
                self.hotels = json.load(f)
            with open(os.path.join(self.data_dir, "activities.json"), "r") as f:
                self.activities = json.load(f)
            with open(os.path.join(self.data_dir, "weather.json"), "r") as f:
                self.weather = json.load(f)
            print("✅ Mock data loaded successfully")
        except FileNotFoundError as e:
            print(f"⚠️ Warning: Mock data file not found: {e}")
            # Initialize with empty lists if files are missing, prevents crash
            self.flights, self.hotels, self.activities, self.weather = [], [], [], []

    def analyze_user_preferences(self, destination: str, preferences: List[str], budget: float, duration: int) -> Dict[str, Any]:
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

    async def get_flights(self, origin: str, destination: str, start_date: str, budget: float, travelers: int) -> List[Dict[str, Any]]:
        """Find suitable flight options based on destination and budget"""
        destination_keywords = destination.lower().split()
        suitable_flights = []
        
        for flight in self.flights:
            if any(keyword in flight["destination"].lower() or keyword in flight["airline"].lower() for keyword in destination_keywords):
                if flight["price"] * travelers <= budget * 0.6:
                    suitable_flights.append(flight)
        
        if not suitable_flights:
            # Fallback to popular destinations if no direct match
            for flight in self.flights:
                if any(keyword in flight["destination"].lower() or keyword in flight["airline"].lower() for keyword in ["paris", "london", "new york"]):
                    suitable_flights.append(flight)

        suitable_flights.sort(key=lambda x: (x["price"], -x["safetyRating"]))
        return suitable_flights[:3]

    async def get_hotels(self, destination: str, start_date: str, duration: int, budget: float, travelers: int, travel_style: str) -> List[Dict[str, Any]]:
        """Find suitable hotel options based on destination, budget, and travel style"""
        destination_keywords = destination.lower().split()
        suitable_hotels = []
        
        for hotel in self.hotels:
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
            for hotel in self.hotels:
                if any(keyword in hotel["location"].lower() for keyword in ["paris", "london", "new york"]):
                    suitable_hotels.append(hotel)

        suitable_hotels.sort(key=lambda x: (-x["rating"], -x["safetyRating"]))
        return suitable_hotels[:3]

    async def get_activities(self, destination: str, duration: int, preferences: List[str], budget: float) -> List[Dict[str, Any]]:
        """Find suitable activities based on destination, preferences, and budget"""
        destination_lower = destination.lower()
        destination_keywords = destination_lower.split()
        
        print(f"🔍 Searching mock activities for destination: {destination}")
        
        # First, find ALL activities for the exact destination
        all_destination_activities = []
        
        # Try exact city/country matching first
        for activity in self.activities:
            activity_location = activity["location"].lower()
            
            # Exact destination match
            if destination_lower in activity_location or any(keyword in activity_location for keyword in destination_keywords):
                all_destination_activities.append(activity)
        
        # If no activities found for the specific destination, create generic activities
        if not all_destination_activities:
            print(f"⚠️ No specific activities found for {destination}, generating generic activities...")
            all_destination_activities = self._generate_generic_activities(destination, duration * 3)
        
        # If still no activities, use a small subset from popular destinations as last resort
        if not all_destination_activities:
            popular_activities = [activity for activity in self.activities if "cultural" in activity.get("tags", [])][:6]
            all_destination_activities = []
            for activity in popular_activities:
                modified_activity = activity.copy()
                modified_activity["location"] = destination
                modified_activity["description"] = f"Explore {destination} and {activity['description'].lower()}"
                all_destination_activities.append(modified_activity)
        
        # Filter logic (simplified from original to keep it clean, but preserving core logic)
        target_activities = duration * 3
        filtered_activities = []
        
        for activity in all_destination_activities:
            preference_match = not preferences or any(
                pref.lower() in activity["tags"] or 
                pref.lower() in activity["category"].lower() or
                pref.lower() in activity["name"].lower() or
                pref.lower() in activity["description"].lower()
                for pref in preferences
            )
            budget_ok = activity["price"] <= budget * 0.3
            
            if preference_match and budget_ok:
                filtered_activities.append(activity)
        
        # Fill up if needed
        if len(filtered_activities) < target_activities:
            remaining = target_activities - len(filtered_activities)
            all_destination_activities.sort(key=lambda x: (-x["rating"], x["price"]))
            for activity in all_destination_activities:
                if activity not in filtered_activities and activity["price"] <= budget * 0.4:
                    filtered_activities.append(activity)
                    remaining -= 1
                    if remaining <= 0: break
        
        # Duplicate if severely lacking (fallback)
        if len(filtered_activities) < target_activities and filtered_activities:
             # Simple logic to just ensure we return enough items
             while len(filtered_activities) < target_activities:
                 filtered_activities.append(filtered_activities[0].copy())

        filtered_activities.sort(key=lambda x: (-x["rating"], x["price"]))
        return filtered_activities[:target_activities]

    def _generate_generic_activities(self, destination: str, count: int) -> List[Dict[str, Any]]:
        """Generate generic activities for destinations not in our database"""
        # (Copied from app.py but made method of class)
        generic_activities = [
            {
                "id": f"GEN001_{destination}",
                "name": f"City Walking Tour of {destination}",
                "location": destination,
                "category": "Culture & Sightseeing",
                "price": 25,
                "duration": "3 hours",
                "rating": 4.5,
                "tags": ["walking", "cultural", "sightseeing", "local"],
                "description": f"Explore the heart of {destination} with a guided walking tour",
                "bestTime": "Morning"
            },
            {
                "id": f"GEN002_{destination}",
                "name": f"Local Food Experience in {destination}",
                "location": destination,
                "category": "Food & Culture",
                "price": 45,
                "duration": "2 hours",
                "rating": 4.7,
                "tags": ["food", "local", "cultural", "authentic"],
                "description": f"Taste authentic local cuisine and learn about {destination}'s food culture",
                "bestTime": "Afternoon"
            },
            # Add a few more basics to ensure enough variety
             {
                "id": f"GEN003_{destination}",
                "name": f"Historical Sites of {destination}",
                "location": destination,
                "category": "History & Culture",
                "price": 15,
                "duration": "4 hours",
                "rating": 4.4,
                "tags": ["history", "cultural"],
                "description": f"Discover the rich history of {destination}",
                "bestTime": "Morning"
            },
             {
                "id": f"GEN004_{destination}",
                "name": f"Local Markets in {destination}",
                "location": destination,
                "category": "Shopping",
                "price": 0,
                "duration": "3 hours",
                "rating": 4.3,
                "tags": ["shopping", "local"],
                "description": f"Browse local markets in {destination}",
                "bestTime": "Afternoon"
            }
        ]
        
        result = []
        for i in range(count):
            activity = generic_activities[i % len(generic_activities)].copy()
            if i >= len(generic_activities):
                activity["id"] = f"GEN{i+1:03d}_{destination}"
                activity["name"] = f"Alternative {activity['name']}"
            result.append(activity)
        return result

    async def get_weather(self, destination: str, start_date: str, duration: int) -> Dict[str, Any]:
        """Get weather information for the destination and travel dates"""
        destination_keywords = destination.lower().split()
        
        for weather_data in self.weather:
            if any(keyword in weather_data["location"].lower() for keyword in destination_keywords):
                forecast = []
                start_dt = datetime.fromisoformat(start_date)
                for i in range(duration):
                    day_dt = start_dt + timedelta(days=i)
                    # Safe index access
                    forecast_idx = i % len(weather_data["forecast"])
                    forecast.append({
                        "date": day_dt.strftime("%Y-%m-%d"),
                        "high": weather_data["forecast"][forecast_idx]["high"],
                        "low": weather_data["forecast"][forecast_idx]["low"],
                        "condition": weather_data["forecast"][forecast_idx]["condition"],
                        "precipitation": weather_data["forecast"][forecast_idx]["precipitation"]
                    })
                
                return {
                    "current": weather_data["currentWeather"],
                    "forecast": forecast,
                    "events": weather_data["events"],
                    "safety_alerts": weather_data["safetyAlerts"]
                }
        
        # Fallback
        return {
            "current": {"temperature": 20, "condition": "Unknown", "humidity": 60, "windSpeed": 10},
            "forecast": [],
            "events": [],
            "safety_alerts": []
        }
