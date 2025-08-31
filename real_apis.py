"""
AI Travel Planning Agent - Real API Integrations
Live data from external travel and weather services
"""

import asyncio
import aiohttp
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

from config import get_api_config, settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class APIProvider(str, Enum):
    """Available API providers"""
    OPENWEATHER = "openweather"
    GOOGLE_PLACES = "google_places"
    AMADEUS = "amadeus"
    BOOKING = "booking"
    SKYSCANNER = "skyscanner"
    HOTELS_COM = "hotels_com"


@dataclass
class WeatherData:
    """Weather information structure"""
    location: str
    current: Dict[str, Any]
    forecast: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]
    last_updated: datetime


@dataclass
class PlaceData:
    """Place information structure"""
    id: str
    name: str
    type: str
    location: Dict[str, float]
    rating: Optional[float]
    price_level: Optional[int]
    photos: List[str]
    reviews: List[Dict[str, Any]]
    opening_hours: Optional[Dict[str, Any]]


@dataclass
class FlightData:
    """Flight information structure"""
    id: str
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    duration: str
    price: float
    currency: str
    class_type: str
    stops: int
    aircraft: Optional[str]
    booking_link: Optional[str]


@dataclass
class HotelData:
    """Hotel information structure"""
    id: str
    name: str
    chain: Optional[str]
    location: Dict[str, float]
    address: str
    rating: float
    price: float
    currency: str
    amenities: List[str]
    photos: List[str]
    reviews: List[Dict[str, Any]]
    availability: Dict[str, Any]
    booking_link: Optional[str]


class BaseAPI:
    """Base class for API integrations"""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.session = None
        self.rate_limit = 100  # requests per minute
        self.last_request = datetime.utcnow()
        self.request_count = 0
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={"User-Agent": "AI-Travel-Agent/2.0.0"}
            )
        return self.session
    
    async def _rate_limit_check(self):
        """Check and enforce rate limiting"""
        now = datetime.utcnow()
        if (now - self.last_request).seconds < 60:
            if self.request_count >= self.rate_limit:
                wait_time = 60 - (now - self.last_request).seconds
                logger.warning(f"Rate limit reached, waiting {wait_time} seconds")
                await asyncio.sleep(wait_time)
                self.request_count = 0
                self.last_request = datetime.utcnow()
        else:
            self.request_count = 0
            self.last_request = now
        
        self.request_count += 1
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        try:
            await self._rate_limit_check()
            
            session = await self._get_session()
            
            if headers is None:
                headers = {}
            
            if method.upper() == "GET":
                async with session.get(
                    f"{self.base_url}{endpoint}",
                    params=params,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"API request failed: {response.status}")
                        return {"error": f"HTTP {response.status}"}
            
            elif method.upper() == "POST":
                async with session.post(
                    f"{self.base_url}{endpoint}",
                    json=params,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"API request failed: {response.status}")
                        return {"error": f"HTTP {response.status}"}
            
        except Exception as e:
            logger.error(f"API request error: {e}")
            return {"error": str(e)}
    
    async def close(self):
        """Close the HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()


class WeatherAPI(BaseAPI):
    """OpenWeather API integration"""
    
    def __init__(self):
        api_config = get_api_config()["openweather"]
        super().__init__(api_config["api_key"], api_config["base_url"])
    
    async def get_weather(self, location: str, days: int = 7) -> WeatherData:
        """Get current weather and forecast for a location"""
        try:
            # Get coordinates first
            coords = await self._get_coordinates(location)
            if "error" in coords:
                return WeatherData(
                    location=location,
                    current={},
                    forecast=[],
                    alerts=[],
                    last_updated=datetime.utcnow()
                )
            
            lat, lon = coords["lat"], coords["lon"]
            
            # Get current weather
            current_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }
            
            current_response = await self._make_request("GET", "/weather", current_params)
            
            # Get forecast
            forecast_params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric",
                "cnt": days
            }
            
            forecast_response = await self._make_request("GET", "/forecast", forecast_params)
            
            # Parse responses
            current_weather = self._parse_current_weather(current_response)
            forecast_weather = self._parse_forecast(forecast_response)
            
            return WeatherData(
                location=location,
                current=current_weather,
                forecast=forecast_weather,
                alerts=[],
                last_updated=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return WeatherData(
                location=location,
                current={},
                forecast=[],
                alerts=[],
                last_updated=datetime.utcnow()
            )
    
    async def _get_coordinates(self, location: str) -> Dict[str, float]:
        """Get coordinates for a location"""
        params = {
            "q": location,
            "appid": self.api_key,
            "limit": 1
        }
        
        response = await self._make_request("GET", "/geo/1.0/direct", params)
        
        if isinstance(response, list) and len(response) > 0:
            return {
                "lat": response[0]["lat"],
                "lon": response[0]["lon"]
            }
        return {"error": "Location not found"}
    
    def _parse_current_weather(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse current weather data"""
        if "error" in data:
            return {}
        
        return {
            "temperature": data.get("main", {}).get("temp"),
            "feels_like": data.get("main", {}).get("feels_like"),
            "humidity": data.get("main", {}).get("humidity"),
            "pressure": data.get("main", {}).get("pressure"),
            "description": data.get("weather", [{}])[0].get("description"),
            "icon": data.get("weather", [{}])[0].get("icon"),
            "wind_speed": data.get("wind", {}).get("speed"),
            "wind_direction": data.get("wind", {}).get("deg"),
            "visibility": data.get("visibility"),
            "sunrise": data.get("sys", {}).get("sunrise"),
            "sunset": data.get("sys", {}).get("sunset")
        }
    
    def _parse_forecast(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse forecast data"""
        if "error" in data or "list" not in data:
            return []
        
        forecast = []
        for item in data["list"]:
            forecast.append({
                "datetime": item.get("dt"),
                "temperature": item.get("main", {}).get("temp"),
                "feels_like": item.get("main", {}).get("feels_like"),
                "humidity": item.get("main", {}).get("humidity"),
                "description": item.get("weather", [{}])[0].get("description"),
                "icon": item.get("weather", [{}])[0].get("icon"),
                "wind_speed": item.get("wind", {}).get("speed"),
                "precipitation": item.get("pop", 0) * 100
            })
        
        return forecast


class PlacesAPI(BaseAPI):
    """Google Places API integration"""
    
    def __init__(self):
        api_config = get_api_config()["google_places"]
        super().__init__(api_config["api_key"], api_config["base_url"])
    
    async def search_places(
        self, 
        query: str, 
        location: Optional[str] = None,
        radius: int = 50000,
        type: Optional[str] = None
    ) -> List[PlaceData]:
        """Search for places using Google Places API"""
        try:
            # Get coordinates for location if provided
            coords = None
            if location:
                coords = await self._get_coordinates(location)
                if "error" in coords:
                    coords = None
            
            # Build search parameters
            params = {
                "query": query,
                "key": self.api_key,
                "language": "en"
            }
            
            if coords:
                params["location"] = f"{coords['lat']},{coords['lng']}"
                params["radius"] = radius
            
            if type:
                params["type"] = type
            
            # Make search request
            response = await self._make_request("GET", "/textsearch/json", params)
            
            if "error" in response:
                return []
            
            # Parse results
            places = []
            for place in response.get("results", []):
                place_data = PlaceData(
                    id=place.get("place_id"),
                    name=place.get("name"),
                    type=place.get("types", [""])[0],
                    location={
                        "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                        "lng": place.get("geometry", {}).get("location", {}).get("lng")
                    },
                    rating=place.get("rating"),
                    price_level=place.get("price_level"),
                    photos=[],
                    reviews=[],
                    opening_hours=None
                )
                
                # Get additional details
                details = await self._get_place_details(place.get("place_id"))
                if details:
                    place_data.photos = details.get("photos", [])
                    place_data.reviews = details.get("reviews", [])
                    place_data.opening_hours = details.get("opening_hours")
                
                places.append(place_data)
            
            return places
            
        except Exception as e:
            logger.error(f"Places API error: {e}")
            return []
    
    async def _get_coordinates(self, location: str) -> Dict[str, float]:
        """Get coordinates for a location using Geocoding API"""
        params = {
            "address": location,
            "key": self.api_key
        }
        
        response = await self._make_request("GET", "/geocode/json", params)
        
        if "results" in response and len(response["results"]) > 0:
            location_data = response["results"][0]["geometry"]["location"]
            return {
                "lat": location_data["lat"],
                "lng": location_data["lng"]
            }
        return {"error": "Location not found"}
    
    async def _get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a place"""
        try:
            params = {
                "place_id": place_id,
                "key": self.api_key,
                "fields": "photos,reviews,opening_hours"
            }
            
            response = await self._make_request("GET", "/details/json", params)
            
            if "error" in response:
                return None
            
            return response.get("result", {})
            
        except Exception as e:
            logger.error(f"Place details error: {e}")
            return None


class FlightAPI(BaseAPI):
    """Flight search API integration (Amadeus)"""
    
    def __init__(self):
        api_config = get_api_config()["amadeus"]
        super().__init__(api_config["client_id"], api_config["base_url"])
        self.client_secret = api_config["client_secret"]
        self.access_token = None
        self.token_expiry = None
    
    async def _authenticate(self):
        """Authenticate with Amadeus API"""
        try:
            if (self.access_token and self.token_expiry and 
                datetime.utcnow() < self.token_expiry):
                return
            
            auth_url = "https://test.api.amadeus.com/v1/security/oauth2/token"
            auth_data = {
                "grant_type": "client_credentials",
                "client_id": self.api_key,
                "client_secret": self.client_secret
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(auth_url, data=auth_data) as response:
                    if response.status == 200:
                        auth_response = await response.json()
                        self.access_token = auth_response["access_token"]
                        self.token_expiry = datetime.utcnow() + timedelta(
                            seconds=auth_response["expires_in"]
                        )
                    else:
                        logger.error("Amadeus authentication failed")
                        
        except Exception as e:
            logger.error(f"Authentication error: {e}")
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "ECONOMY"
    ) -> List[FlightData]:
        """Search for flight options"""
        try:
            await self._authenticate()
            
            if not self.access_token:
                return []
            
            # Build search parameters
            params = {
                "originLocationCode": origin,
                "destinationLocationCode": destination,
                "departureDate": departure_date,
                "adults": adults,
                "max": 50,
                "currencyCode": "USD"
            }
            
            if return_date:
                params["returnDate"] = return_date
            
            if cabin_class != "ECONOMY":
                params["travelClass"] = cabin_class
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            response = await self._make_request(
                "GET", "/shopping/flight-offers", params, headers
            )
            
            if "error" in response:
                return []
            
            # Parse flight results
            flights = []
            for offer in response.get("data", []):
                flight = FlightData(
                    id=offer.get("id"),
                    airline=offer.get("validatingAirlineCodes", [""])[0],
                    flight_number=offer.get("itineraries", [{}])[0].get("segments", [{}])[0].get("carrierCode", ""),
                    origin=origin,
                    destination=destination,
                    departure_time=datetime.fromisoformat(
                        offer.get("itineraries", [{}])[0].get("segments", [{}])[0].get("departure", {}).get("at", "")
                    ),
                    arrival_time=datetime.fromisoformat(
                        offer.get("itineraries", [{}])[0].get("segments", [{}])[0].get("arrival", {}).get("at", "")
                    ),
                    duration=offer.get("itineraries", [{}])[0].get("duration", ""),
                    price=float(offer.get("price", {}).get("total", 0)),
                    currency=offer.get("price", {}).get("currency", "USD"),
                    class_type=cabin_class,
                    stops=len(offer.get("itineraries", [{}])[0].get("segments", [])) - 1,
                    aircraft=None,
                    booking_link=None
                )
                flights.append(flight)
            
            return flights
            
        except Exception as e:
            logger.error(f"Flight search error: {e}")
            return []
    
    async def get_airport_info(self, airport_code: str) -> Optional[Dict[str, Any]]:
        """Get information about an airport"""
        try:
            await self._authenticate()
            
            if not self.access_token:
                return None
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            response = await self._make_request(
                "GET", f"/reference-data/locations/{airport_code}", {}, headers
            )
            
            if "error" in response:
                return None
            
            return response
            
        except Exception as e:
            logger.error(f"Airport info error: {e}")
            return None


class HotelAPI(BaseAPI):
    """Hotel search API integration (Booking.com)"""
    
    def __init__(self):
        api_config = get_api_config()["booking"]
        super().__init__(api_config["api_key"], api_config["base_url"])
    
    async def search_hotels(
        self,
        destination: str,
        check_in: str,
        check_out: str,
        adults: int = 1,
        children: int = 0,
        rooms: int = 1,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[HotelData]:
        """Search for hotel options"""
        try:
            # Build search parameters
            params = {
                "dest_id": destination,
                "checkin_date": check_in,
                "checkout_date": check_out,
                "adults": adults,
                "children": children,
                "room_qty": rooms,
                "currency": "USD",
                "units": "metric"
            }
            
            if min_rating:
                params["min_rating"] = min_rating
            
            if max_price:
                params["max_price"] = max_price
            
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
            }
            
            response = await self._make_request("GET", "/hotels/search", params, headers)
            
            if "error" in response:
                return []
            
            # Parse hotel results
            hotels = []
            for result in response.get("result", []):
                hotel = HotelData(
                    id=result.get("hotel_id"),
                    name=result.get("hotel_name"),
                    chain=result.get("chain"),
                    location={
                        "lat": result.get("latitude"),
                        "lng": result.get("longitude")
                    },
                    address=result.get("address"),
                    rating=float(result.get("review_score", 0)),
                    price=float(result.get("min_total_price", 0)),
                    currency=result.get("currency", "USD"),
                    amenities=result.get("hotel_amenities", []),
                    photos=[],
                    reviews=[],
                    availability={
                        "available": result.get("available", True),
                        "rooms_available": result.get("rooms_available", 0)
                    },
                    booking_link=result.get("url")
                )
                
                hotels.append(hotel)
            
            return hotels
            
        except Exception as e:
            logger.error(f"Hotel search error: {e}")
            return []
    
    async def get_hotel_details(self, hotel_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a hotel"""
        try:
            params = {"hotel_id": hotel_id}
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
            }
            
            response = await self._make_request("GET", "/hotels/get-details", params, headers)
            
            if "error" in response:
                return None
            
            return response
            
        except Exception as e:
            logger.error(f"Hotel details error: {e}")
            return None


class ActivityAPI(BaseAPI):
    """Activity and experience booking API integration"""
    
    def __init__(self):
        # This would integrate with platforms like Viator, GetYourGuide, etc.
        super().__init__("", "")
    
    async def search_activities(
        self,
        destination: str,
        date: str,
        participants: int = 1,
        category: Optional[str] = None,
        max_price: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Search for activities and experiences"""
        # Placeholder implementation
        return []


class TransportAPI(BaseAPI):
    """Local transportation API integration"""
    
    def __init__(self):
        # This would integrate with Uber, Lyft, local transit APIs, etc.
        super().__init__("", "")
    
    async def get_transport_options(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float],
        departure_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get transportation options between two points"""
        # Placeholder implementation
        return []


# API Manager for centralized access
class APIManager:
    """Centralized API management and caching"""
    
    def __init__(self):
        self.weather_api = WeatherAPI()
        self.places_api = PlacesAPI()
        self.flight_api = FlightAPI()
        self.hotel_api = HotelAPI()
        self.activity_api = ActivityAPI()
        self.transport_api = TransportAPI()
        
        # Simple in-memory cache (in production, use Redis)
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
    
    async def get_weather(self, location: str, days: int = 7) -> WeatherData:
        """Get weather with caching"""
        cache_key = f"weather_{location}_{days}"
        
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if (datetime.utcnow() - cached_data["timestamp"]).seconds < self.cache_ttl:
                return cached_data["data"]
        
        weather_data = await self.weather_api.get_weather(location, days)
        
        self.cache[cache_key] = {
            "data": weather_data,
            "timestamp": datetime.utcnow()
        }
        
        return weather_data
    
    async def search_places(
        self, 
        query: str, 
        location: Optional[str] = None,
        radius: int = 50000,
        type: Optional[str] = None
    ) -> List[PlaceData]:
        """Search places with caching"""
        cache_key = f"places_{query}_{location}_{radius}_{type}"
        
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if (datetime.utcnow() - cached_data["timestamp"]).seconds < self.cache_ttl:
                return cached_data["data"]
        
        places = await self.places_api.search_places(query, location, radius, type)
        
        self.cache[cache_key] = {
            "data": places,
            "timestamp": datetime.utcnow()
        }
        
        return places
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "ECONOMY"
    ) -> List[FlightData]:
        """Search flights (no caching due to real-time nature)"""
        return await self.flight_api.search_flights(
            origin, destination, departure_date, return_date, adults, cabin_class
        )
    
    async def search_hotels(
        self,
        destination: str,
        check_in: str,
        check_out: str,
        adults: int = 1,
        children: int = 0,
        rooms: int = 1,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[HotelData]:
        """Search hotels (no caching due to real-time nature)"""
        return await self.hotel_api.search_hotels(
            destination, check_in, check_out, adults, children, rooms, min_rating, max_price
        )
    
    async def close(self):
        """Close all API connections"""
        await self.weather_api.close()
        await self.places_api.close()
        await self.flight_api.close()
        await self.hotel_api.close()


# Global API manager instance
api_manager = APIManager()


# Utility functions for easy access
async def get_weather(location: str, days: int = 7) -> WeatherData:
    """Get weather for a location"""
    return await api_manager.get_weather(location, days)


async def search_places(
    query: str, 
    location: Optional[str] = None,
    radius: int = 50000,
    type: Optional[str] = None
) -> List[PlaceData]:
    """Search for places"""
    return await api_manager.search_places(query, location, radius, type)


async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    adults: int = 1,
    cabin_class: str = "ECONOMY"
) -> List[FlightData]:
    """Search for flights"""
    return await api_manager.search_flights(
        origin, destination, departure_date, return_date, adults, cabin_class
    )


async def search_hotels(
    destination: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    children: int = 0,
    rooms: int = 1,
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None
) -> List[HotelData]:
    """Search for hotels"""
    return await api_manager.search_hotels(
        destination, check_in, check_out, adults, children, rooms, min_rating, max_price
    )


if __name__ == "__main__":
    # Test the API integrations
    async def test_apis():
        print("🌐 Testing Real API Integrations...")
        
        try:
            # Test weather API
            print("\n🌤️ Testing Weather API...")
            weather = await get_weather("London", 5)
            print(f"Weather in London: {weather.current.get('description', 'Unknown')}")
            
            # Test places API
            print("\n🏛️ Testing Places API...")
            places = await search_places("restaurants", "London", 5000)
            print(f"Found {len(places)} restaurants in London")
            
            # Test flight API
            print("\n✈️ Testing Flight API...")
            flights = await search_flights("JFK", "LHR", "2024-06-15", adults=2)
            print(f"Found {len(flights)} flights from JFK to LHR")
            
            # Test hotel API
            print("\n🏨 Testing Hotel API...")
            hotels = await search_hotels("London", "2024-06-15", "2024-06-20", adults=2)
            print(f"Found {len(hotels)} hotels in London")
            
        except Exception as e:
            print(f"❌ API test failed: {e}")
        
        finally:
            await api_manager.close()
    
    asyncio.run(test_apis())
