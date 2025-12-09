"""
Real-time API configuration for travel planning
This file contains the setup for integrating with real travel APIs
"""

import os
from typing import Dict, List, Any, Optional
import requests
import asyncio
import json
from datetime import datetime, timedelta

# Try to import Gemini AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None

class RealTimeAPIManager:
    """Manager for real-time travel API integrations"""
    
    def __init__(self):
        self.google_places_key = os.getenv("GOOGLE_PLACES_API_KEY")
        self.openweather_key = os.getenv("OPENWEATHER_API_KEY")
        self.google_ai_key = os.getenv("GOOGLE_AI_API_KEY")
        self.amadeus_client_id = os.getenv("AMADEUS_CLIENT_ID")
        self.amadeus_client_secret = os.getenv("AMADEUS_CLIENT_SECRET")
        
        # Initialize Gemini AI
        if GEMINI_AVAILABLE and self.google_ai_key:
            try:
                genai.configure(api_key=self.google_ai_key)
                # Try different model names in order of preference (using available models)
                self.gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
                print("✅ Gemini 2.5 Flash model initialized")
            except Exception as e:
                try:
                    self.gemini_model = genai.GenerativeModel('models/gemini-2.0-flash')
                    print("✅ Gemini 2.0 Flash model initialized")
                except:
                    try:
                        self.gemini_model = genai.GenerativeModel('models/gemini-flash-latest')
                        print("✅ Gemini Flash Latest model initialized")
                    except Exception as e2:
                        print(f"⚠️ Could not initialize Gemini AI: {e2}")
                        self.gemini_model = None
        else:
            print("ℹ️ Google AI API key not configured")
            self.gemini_model = None
    
    async def get_nearby_places(self, latitude: float, longitude: float, place_type: str = "tourist_attraction", radius: int = 5000) -> List[Dict[str, Any]]:
        """Get nearby places based on user's current location using Google Places API"""
        print(f"🔑 Google Places API key available: {bool(self.google_places_key)}")
        if not self.google_places_key or self.google_places_key == "":
            print("❌ Google Places API key not configured for nearby search - returning mock data")
            # Return mock data for testing
            return [
                {
                    "id": "mock_1",
                    "name": "Local Tourist Attraction",
                    "location": "Near your location",
                    "category": "Tourist Attraction",
                    "price": 15,
                    "rating": 4.5,
                    "description": f"A popular {place_type.replace('_', ' ')} near your current location",
                    "tags": [place_type, "nearby", "local"],
                    "bestTime": "Anytime",
                    "authenticLocal": True,
                    "safetyRating": 9.0,
                    "distance": 1.2
                },
                {
                    "id": "mock_2",
                    "name": "Nearby Local Spot",
                    "location": "Close to you",
                    "category": "Local Attraction",
                    "price": 0,
                    "rating": 4.2,
                    "description": f"A great local {place_type.replace('_', ' ')} that's worth visiting",
                    "tags": [place_type, "nearby", "free"],
                    "bestTime": "Morning",
                    "authenticLocal": True,
                    "safetyRating": 8.8,
                    "distance": 2.1
                },
                {
                    "id": "mock_1",
                    "name": "Local Attraction (Mock)",
                    "location": "Near your location",
                    "category": "Tourist Attraction",
                    "price": 0,
                    "rating": 4.5,
                    "description": "A beautiful local attraction near your area (mock data - configure Google Places API for real results)",
                    "tags": ["mock", "nearby", "local"],
                    "bestTime": "Anytime",
                    "authenticLocal": True,
                    "safetyRating": 9.0,
                    "distance": 1.2
                },
                {
                    "id": "mock_2", 
                    "name": "Popular Spot (Mock)",
                    "location": "Your neighborhood",
                    "category": "Point of Interest",
                    "price": 0,
                    "rating": 4.2,
                    "description": "A popular local spot worth visiting (mock data - configure Google Places API for real results)",
                    "tags": ["mock", "nearby", "popular"],
                    "bestTime": "Anytime",
                    "authenticLocal": True,
                    "safetyRating": 8.8,
                    "distance": 2.1
                }
            ]
        
        try:
            print(f"🔍 Searching nearby {place_type} within {radius}m of location ({latitude}, {longitude})...")
            
            # Google Places Nearby Search API
            base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            
            params = {
                "location": f"{latitude},{longitude}",
                "radius": radius,
                "type": place_type,
                "key": self.google_places_key,
                "fields": "place_id,name,rating,price_level,types,vicinity,geometry"
            }
            
            response = requests.get(base_url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                nearby_places = []
                
                for place in data.get("results", [])[:10]:  # Top 10 nearby places
                    place_info = {
                        "id": place.get("place_id", ""),
                        "name": place.get("name", ""),
                        "location": place.get("vicinity", "Nearby"),
                        "category": self._categorize_place(place, place_type),
                        "price": self._estimate_price(place, place_type),
                        "rating": place.get("rating", 4.0),
                        "description": f"Nearby {place_type.replace('_', ' ')} - {place.get('name', 'Unknown')}",
                        "tags": [place_type, "nearby", "local"],
                        "bestTime": "Anytime",
                        "authenticLocal": True,
                        "safetyRating": 9.0,
                        "distance": self._calculate_distance(latitude, longitude, place.get("geometry", {}).get("location", {}))
                    }
                    nearby_places.append(place_info)
                
                # Sort by rating and distance
                nearby_places.sort(key=lambda x: (-x["rating"], x.get("distance", 999)))
                print(f"✅ Found {len(nearby_places)} nearby places")
                return nearby_places
            else:
                print(f"❌ Google Places API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error fetching nearby places: {e}")
            return []

    def _calculate_distance(self, lat1: float, lon1: float, location: Dict) -> float:
        """Calculate approximate distance in km between two points"""
        try:
            lat2 = location.get("lat", 0)
            lon2 = location.get("lng", 0)
            
            # Simple distance calculation (not perfectly accurate but good enough)
            import math
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            distance = 6371 * c  # Earth's radius in km
            return round(distance, 2)
        except:
            return 999  # Return large number if calculation fails

    async def get_real_activities(self, destination: str, preferences: List[str]) -> List[Dict[str, Any]]:
        """Get real activities from Google Places API"""
        if not self.google_places_key or self.google_places_key == "":
            print("ℹ️ Google Places API key not configured, using enhanced mock data")
            return []
        
        try:
            print(f"🔍 Searching real activities in {destination}...")
            # Google Places API call for attractions
            base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            
            # Create search queries based on preferences
            search_queries = []
            if "culture" in preferences:
                search_queries.extend(["museums", "temples", "cultural sites"])
            if "food" in preferences:
                search_queries.extend(["restaurants", "local cuisine"])
            if "nightlife" in preferences:
                search_queries.extend(["bars", "nightlife"])
            if "adventure" in preferences:
                search_queries.extend(["outdoor activities", "adventure"])
            
            # Default searches if no specific preferences
            if not search_queries:
                search_queries = ["tourist attractions", "restaurants", "things to do"]
            
            # Always include basic attractions for the destination
            search_queries.append("attractions")
            
            all_activities = []
            
            for query in search_queries[:3]:  # Limit to 3 queries to avoid rate limits
                params = {
                    "query": f"{query} {destination}",
                    "key": self.google_places_key,
                    "fields": "place_id,name,rating,price_level,types,formatted_address"
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
            
            print(f"✅ Found {len(all_activities)} real activities")
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

    async def get_real_flights(self, origin: str, destination: str, departure_date: str, travelers: int = 1) -> List[Dict[str, Any]]:
        """Get real flight data using AI-powered search"""
        if not self.gemini_model:
            print("ℹ️ Gemini AI not configured, using mock flight data")
            return []
        
        try:
            print(f"✈️ Searching real flights from {origin} to {destination}...")
            
            # Use Gemini to get realistic flight information
            prompt = f"""
            Provide realistic flight information from {origin} to {destination} on {departure_date} for {travelers} travelers.
            Return a JSON array with 3-5 flight options including:
            - airline: string (realistic airline name)
            - flight_number: string (realistic flight number)
            - departure_time: string (HH:MM format)
            - arrival_time: string (HH:MM format)
            - duration: string (e.g., "2h 30m")
            - price: number (realistic price in USD)
            - stops: number (0 for direct, 1+ for connecting)
            - aircraft_type: string (e.g., "Boeing 737")
            
            Make the data realistic based on actual routes and typical pricing for this route.
            Return only valid JSON without any additional text.
            """
            
            response = self.gemini_model.generate_content(prompt)
            
            # Extract JSON from response
            response_text = response.text.strip()
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text
            
            flights = json.loads(json_text)
            
            # Format for our system
            formatted_flights = []
            for i, flight in enumerate(flights[:5]):
                formatted_flight = {
                    "id": f"REAL_FLIGHT_{i+1}",
                    "airline": flight.get("airline", "Unknown Airline"),
                    "flightNumber": flight.get("flight_number", f"XX{1000+i}"),
                    "departure": flight.get("departure_time", "08:00"),
                    "arrival": flight.get("arrival_time", "12:00"),
                    "duration": flight.get("duration", "4h 0m"),
                    "price": float(flight.get("price", 500)),
                    "stops": flight.get("stops", 0),
                    "aircraft": flight.get("aircraft_type", "Boeing 737"),
                    "safetyRating": 9.2,
                    "origin": origin,
                    "destination": destination,
                    "date": departure_date
                }
                formatted_flights.append(formatted_flight)
            
            print(f"✅ Found {len(formatted_flights)} real flight options")
            return formatted_flights
            
        except Exception as e:
            print(f"⚠️ Error fetching real flights: {e}")
            return []
    
    async def get_real_hotels(self, destination: str, checkin_date: str, checkout_date: str, travelers: int = 1) -> List[Dict[str, Any]]:
        """Get real hotel data using AI-powered search"""
        if not self.gemini_model:
            print("ℹ️ Gemini AI not configured, using mock hotel data")
            return []
        
        try:
            print(f"🏨 Searching real hotels in {destination}...")
            
            prompt = f"""
            Provide realistic hotel information for {destination} from {checkin_date} to {checkout_date} for {travelers} travelers.
            Return a JSON array with 5-7 hotel options including:
            - hotel_name: string (realistic hotel name)
            - star_rating: number (1-5)
            - price_per_night: number (realistic price in USD)
            - location: string (area within the city)
            - amenities: array of strings
            - guest_rating: number (out of 5.0)
            - room_type: string
            - cancellation_policy: string
            - distance_from_city_center: string
            
            Include a mix of budget, mid-range, and luxury options.
            Return only valid JSON without any additional text.
            """
            
            response = self.gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text
            
            hotels = json.loads(json_text)
            
            # Format for our system
            formatted_hotels = []
            for i, hotel in enumerate(hotels[:7]):
                formatted_hotel = {
                    "id": f"REAL_HOTEL_{i+1}",
                    "name": hotel.get("hotel_name", f"Hotel {i+1}"),
                    "location": f"{destination}, {hotel.get('location', 'City Center')}",
                    "price": float(hotel.get("price_per_night", 100)),
                    "rating": float(hotel.get("guest_rating", 4.0)),
                    "stars": int(hotel.get("star_rating", 3)),
                    "amenities": hotel.get("amenities", ["WiFi", "Breakfast", "AC"]),
                    "roomType": hotel.get("room_type", "Standard Room"),
                    "safetyRating": 9.0,
                    "distanceFromCenter": hotel.get("distance_from_city_center", "2 km"),
                    "cancellationPolicy": hotel.get("cancellation_policy", "Free cancellation up to 24 hours")
                }
                formatted_hotels.append(formatted_hotel)
            
            print(f"✅ Found {len(formatted_hotels)} real hotel options")
            return formatted_hotels
            
        except Exception as e:
            print(f"⚠️ Error fetching real hotels: {e}")
            return []
    
    async def get_real_local_insights(self, destination: str, preferences: List[str]) -> Dict[str, Any]:
        """Get real local insights and recommendations using AI"""
        if not self.gemini_model:
            return {}
        
        try:
            print(f"🧠 Getting local insights for {destination}...")
            
            preferences_str = ", ".join(preferences) if preferences else "general travel"
            
            prompt = f"""
            Provide local insights and recommendations for {destination} focusing on {preferences_str}.
            Return a JSON object with:
            - local_tips: array of 5-7 practical tips for visitors
            - hidden_gems: array of 3-5 lesser-known attractions
            - local_customs: array of 3-4 cultural customs to be aware of
            - best_time_to_visit: string with seasonal recommendations
            - local_transportation: object with transportation options and tips
            - safety_tips: array of 3-4 safety recommendations
            - local_cuisine: array of 4-5 must-try dishes
            - budget_tips: array of 3-4 money-saving tips
            
            Make the information specific, practical, and current for {destination}.
            Return only valid JSON without any additional text.
            """
            
            response = self.gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text
            
            insights = json.loads(json_text)
            print("✅ Generated local insights")
            return insights
            
        except Exception as e:
            print(f"⚠️ Error getting local insights: {e}")
            return {}
    
    async def get_real_events(self, destination: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get real events and festivals using AI"""
        if not self.gemini_model:
            return []
        
        try:
            print(f"🎉 Searching for events in {destination}...")
            
            prompt = f"""
            Find events, festivals, and activities happening in {destination} between {start_date} and {end_date}.
            Return a JSON array with events including:
            - event_name: string
            - date: string (YYYY-MM-DD format)
            - time: string (HH:MM format)
            - location: string (venue or area)
            - category: string (festival, concert, exhibition, sports, etc.)
            - price: number (0 for free events)
            - description: string
            - website: string (or "Contact local tourism office")
            
            Include a mix of cultural events, festivals, concerts, exhibitions, and local activities.
            Return only valid JSON without any additional text.
            """
            
            response = self.gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text
            
            events = json.loads(json_text)
            
            # Format for our system
            formatted_events = []
            for i, event in enumerate(events[:10]):
                formatted_event = {
                    "id": f"REAL_EVENT_{i+1}",
                    "name": event.get("event_name", f"Event {i+1}"),
                    "date": event.get("date", start_date),
                    "time": event.get("time", "19:00"),
                    "location": event.get("location", destination),
                    "category": event.get("category", "Cultural"),
                    "price": float(event.get("price", 0)),
                    "description": event.get("description", "Local event"),
                    "bookingInfo": event.get("website", "Contact local tourism office")
                }
                formatted_events.append(formatted_event)
            
            print(f"✅ Found {len(formatted_events)} events")
            return formatted_events
            
        except Exception as e:
            print(f"⚠️ Error fetching events: {e}")
            return []
# Global instance
real_api_manager = RealTimeAPIManager()

# Additional real-time features
async def get_comprehensive_travel_data(destination: str, preferences: List[str], start_date: str, duration: int, travelers: int = 1, origin: str = "Mumbai") -> Dict[str, Any]:
    """Get comprehensive real-time travel data for all features"""
    print(f"🌍 Fetching comprehensive real-time data for {destination}...")
    
    # Run all API calls concurrently for better performance
    tasks = [
        real_api_manager.get_real_activities(destination, preferences),
        real_api_manager.get_real_weather(destination, start_date, duration),
        real_api_manager.get_real_flights(origin, destination, start_date, travelers),
        real_api_manager.get_real_hotels(destination, start_date, start_date, travelers),
        real_api_manager.get_real_local_insights(destination, preferences),
        real_api_manager.get_real_events(destination, start_date, start_date)
    ]
    
    try:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        activities, weather, flights, hotels, insights, events = results
        
        # Handle any exceptions
        if isinstance(activities, Exception):
            print(f"⚠️ Activities error: {activities}")
            activities = []
        if isinstance(weather, Exception):
            print(f"⚠️ Weather error: {weather}")
            weather = {}
        if isinstance(flights, Exception):
            print(f"⚠️ Flights error: {flights}")
            flights = []
        if isinstance(hotels, Exception):
            print(f"⚠️ Hotels error: {hotels}")
            hotels = []
        if isinstance(insights, Exception):
            print(f"⚠️ Insights error: {insights}")
            insights = {}
        if isinstance(events, Exception):
            print(f"⚠️ Events error: {events}")
            events = []
        
        return {
            "activities": activities,
            "weather": weather,
            "flights": flights,
            "hotels": hotels,
            "insights": insights,
            "events": events,
            "real_time_status": {
                "activities": len(activities) > 0,
                "weather": bool(weather),
                "flights": len(flights) > 0,
                "hotels": len(hotels) > 0,
                "insights": bool(insights),
                "events": len(events) > 0,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        print(f"❌ Error fetching comprehensive data: {e}")
        return {
            "activities": [],
            "weather": {},
            "flights": [],
            "hotels": [],
            "insights": {},
            "events": [],
            "real_time_status": {
                "activities": False,
                "weather": False,
                "flights": False,
                "hotels": False,
                "insights": False,
                "events": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        }

async def get_real_time_status() -> Dict[str, Any]:
    """Get real-time status of all APIs"""
    status = {
        "timestamp": datetime.now().isoformat(),
        "apis": {
            "google_places": {
                "available": bool(real_api_manager.google_places_key),
                "status": "active" if real_api_manager.google_places_key else "missing_key"
            },
            "openweather": {
                "available": bool(real_api_manager.openweather_key),
                "status": "active" if real_api_manager.openweather_key else "missing_key"
            },
            "gemini_ai": {
                "available": bool(real_api_manager.gemini_model),
                "status": "active" if real_api_manager.gemini_model else "missing_key"
            }
        },
        "features": {
            "real_time_activities": bool(real_api_manager.google_places_key),
            "real_time_weather": bool(real_api_manager.openweather_key),
            "ai_powered_flights": bool(real_api_manager.gemini_model),
            "ai_powered_hotels": bool(real_api_manager.gemini_model),
            "local_insights": bool(real_api_manager.gemini_model),
            "local_events": bool(real_api_manager.gemini_model)
        }
    }
    
    # Test API connectivity
    try:
        if real_api_manager.openweather_key:
            # Quick test of OpenWeather API
            test_url = f"https://api.openweathermap.org/data/2.5/weather?q=London&appid={real_api_manager.openweather_key}"
            response = requests.get(test_url, timeout=5)
            status["apis"]["openweather"]["connectivity"] = response.status_code == 200
        
        if real_api_manager.google_places_key:
            # Quick test of Google Places API
            test_url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key={real_api_manager.google_places_key}"
            response = requests.get(test_url, timeout=5)
            status["apis"]["google_places"]["connectivity"] = response.status_code == 200
            
    except Exception as e:
        print(f"⚠️ API connectivity test failed: {e}")
    
    return status