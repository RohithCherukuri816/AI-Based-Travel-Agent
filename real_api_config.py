"""
Real-time API configuration for travel planning
This file contains the setup for integrating with real travel APIs
"""

import os
from typing import Dict, List, Any
import requests
import asyncio
from datetime import datetime, timedelta

class RealTimeAPIManager:
    """Manager for real-time travel API integrations"""
    
    def __init__(self):
        self.google_places_key = os.getenv("GOOGLE_PLACES_API_KEY")
        self.openweather_key = os.getenv("OPENWEATHER_API_KEY")
        self.amadeus_client_id = os.getenv("AMADEUS_CLIENT_ID")
        self.amadeus_client_secret = os.getenv("AMADEUS_CLIENT_SECRET")
        
    async def get_real_activities(self, destination: str, preferences: List[str]) -> List[Dict[str, Any]]:
        """Get real activities from Google Places API"""
        if not self.google_places_key or self.google_places_key == "":
            print("ℹ️ Google Places API key not configured, using enhanced mock data")
            return []
        
        try:
            # Google Places API call for attractions
            base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            
            # Create search queries based on preferences
            search_queries = []
            if "culture" in preferences:
                search_queries.extend(["museums", "temples", "cultural sites"])
            if "food" in preferences:
                search_queries.extend(["restaurants", "food tours", "local cuisine"])
            if "nightlife" in preferences:
                search_queries.extend(["bars", "nightlife", "entertainment"])
            if "adventure" in preferences:
                search_queries.extend(["outdoor activities", "adventure sports"])
            
            # Default searches if no specific preferences
            if not search_queries:
                search_queries = ["tourist attractions", "restaurants", "things to do"]
            
            all_activities = []
            
            for query in search_queries[:3]:  # Limit to 3 queries to avoid rate limits
                params = {
                    "query": f"{query} in {destination}",
                    "key": self.google_places_key,
                    "type": "tourist_attraction"
                }
                
                response = requests.get(base_url, params=params, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    
                    for place in data.get("results", [])[:5]:  # Top 5 results per query
                        activity = {
                            "id": place.get("place_id", ""),
                            "name": place.get("name", ""),
                            "location": destination,
                            "category": self._categorize_place(place, query),
                            "price": self._estimate_price(place, query),
                            "rating": place.get("rating", 4.0),
                            "description": self._generate_description(place, query),
                            "tags": self._generate_tags(place, query),
                            "bestTime": self._suggest_best_time(place, query),
                            "authenticLocal": True,
                            "safetyRating": 9.0
                        }
                        all_activities.append(activity)
                
                # Small delay to respect rate limits
                await asyncio.sleep(0.1)
            
            return all_activities[:21]  # Return up to 21 activities (7 days * 3 per day)
            
        except Exception as e:
            print(f"Error fetching real activities: {e}")
            return []
    
    async def get_real_weather(self, destination: str, start_date: str, duration: int) -> Dict[str, Any]:
        """Get real weather data from OpenWeather API"""
        if not self.openweather_key or self.openweather_key == "":
            print("ℹ️ OpenWeather API key not configured, using mock data")
            return {}
        
        print(f"🌤️ Fetching real weather data for {destination}...")
        
        try:
            # First, get coordinates for the destination
            geocoding_url = "http://api.openweathermap.org/geo/1.0/direct"
            
            # Clean destination name for better API results
            clean_destination = destination.split(',')[0].strip()  # Remove country part if present
            
            geo_params = {
                "q": clean_destination,
                "limit": 1,
                "appid": self.openweather_key
            }
            
            print(f"🌍 Getting coordinates for: {clean_destination}")
            
            geo_response = requests.get(geocoding_url, params=geo_params, timeout=10)
            if geo_response.status_code != 200:
                return {}
            
            geo_data = geo_response.json()
            if not geo_data:
                return {}
            
            lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]
            
            # Get current weather
            current_url = "https://api.openweathermap.org/data/2.5/weather"
            current_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.openweather_key,
                "units": "metric"
            }
            
            current_response = requests.get(current_url, params=current_params, timeout=10)
            current_data = current_response.json() if current_response.status_code == 200 else {}
            
            # Get forecast
            forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
            forecast_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.openweather_key,
                "units": "metric"
            }
            
            forecast_response = requests.get(forecast_url, params=forecast_params, timeout=10)
            forecast_data = forecast_response.json() if forecast_response.status_code == 200 else {}
            
            # Process forecast data
            forecast = []
            start_dt = datetime.fromisoformat(start_date)
            
            for i in range(duration):
                day_dt = start_dt + timedelta(days=i)
                # Find forecast for this day (simplified - using daily averages)
                day_forecast = {
                    "date": day_dt.strftime("%Y-%m-%d"),
                    "high": current_data.get("main", {}).get("temp_max", 20) + (i % 3 - 1) * 2,  # Simulate variation
                    "low": current_data.get("main", {}).get("temp_min", 15) + (i % 3 - 1) * 2,
                    "condition": current_data.get("weather", [{}])[0].get("main", "Clear"),
                    "precipitation": 10 + (i % 4) * 15  # Simulate precipitation chance
                }
                forecast.append(day_forecast)
            
            return {
                "current": {
                    "temperature": current_data.get("main", {}).get("temp", 20),
                    "condition": current_data.get("weather", [{}])[0].get("main", "Clear"),
                    "humidity": current_data.get("main", {}).get("humidity", 60),
                    "windSpeed": current_data.get("wind", {}).get("speed", 5),
                    "visibility": "Good"
                },
                "forecast": forecast,
                "events": [],
                "safety_alerts": []
            }
            
        except Exception as e:
            print(f"Error fetching real weather: {e}")
            return {}
    
    def _categorize_place(self, place: Dict, query: str) -> str:
        """Categorize a place based on its type and query"""
        types = place.get("types", [])
        
        if "museum" in types or "museum" in query:
            return "Art & Culture"
        elif "restaurant" in types or "food" in query:
            return "Food & Culture"
        elif "night_club" in types or "bar" in types or "nightlife" in query:
            return "Nightlife & Entertainment"
        elif "tourist_attraction" in types:
            return "Attractions & Sightseeing"
        elif "place_of_worship" in types:
            return "Religion & Culture"
        else:
            return "Culture & Experience"
    
    def _estimate_price(self, place: Dict, query: str) -> float:
        """Estimate price based on place type and rating"""
        price_level = place.get("price_level", 2)  # 0-4 scale
        rating = place.get("rating", 4.0)
        
        # Base price estimation
        base_prices = {0: 0, 1: 15, 2: 35, 3: 65, 4: 120}
        base_price = base_prices.get(price_level, 35)
        
        # Adjust based on rating
        rating_multiplier = 0.8 + (rating - 3.0) * 0.1  # 0.8 to 1.2 multiplier
        
        return max(0, int(base_price * rating_multiplier))
    
    def _generate_description(self, place: Dict, query: str) -> str:
        """Generate a description for the place"""
        name = place.get("name", "")
        rating = place.get("rating", 4.0)
        
        descriptions = {
            "museum": f"Explore {name} and discover fascinating exhibits and cultural treasures",
            "restaurant": f"Enjoy authentic local cuisine at {name} with excellent reviews",
            "temple": f"Visit the sacred {name} and experience local spiritual culture",
            "nightlife": f"Experience vibrant nightlife at {name} with great atmosphere",
            "attraction": f"Discover {name}, a must-see attraction with {rating:.1f} star rating"
        }
        
        for key, desc in descriptions.items():
            if key in query.lower():
                return desc
        
        return f"Experience {name}, a highly-rated local destination perfect for your trip"
    
    def _generate_tags(self, place: Dict, query: str) -> List[str]:
        """Generate tags based on place type and query"""
        types = place.get("types", [])
        tags = ["local", "authentic"]
        
        if "museum" in types or "museum" in query:
            tags.extend(["cultural", "art", "indoor"])
        elif "restaurant" in types or "food" in query:
            tags.extend(["food", "cuisine", "dining"])
        elif "night_club" in types or "nightlife" in query:
            tags.extend(["nightlife", "entertainment", "evening"])
        elif "place_of_worship" in types:
            tags.extend(["religious", "spiritual", "cultural"])
        elif "tourist_attraction" in types:
            tags.extend(["sightseeing", "popular", "must-see"])
        
        return tags
    
    def _suggest_best_time(self, place: Dict, query: str) -> str:
        """Suggest best time to visit based on place type"""
        types = place.get("types", [])
        
        if "night_club" in types or "nightlife" in query:
            return "Evening"
        elif "museum" in types or "place_of_worship" in types:
            return "Morning"
        elif "restaurant" in types:
            return "Afternoon" if "lunch" in query else "Evening"
        else:
            return "Afternoon"

# Global instance
real_api_manager = RealTimeAPIManager()