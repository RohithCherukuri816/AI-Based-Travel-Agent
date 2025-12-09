from typing import List, Dict, Any
from .travel_provider import TravelDataProvider
# Import the existing manager. We might want to refactor real_api_config later, 
# but for now we use it as the low-level client.
from real_api_config import real_api_manager 

class RealTimeTravelProvider(TravelDataProvider):
    """
    Implementation that tries to fetch real data, with fallback to another provider (usually mock).
    """

    def __init__(self, fallback_provider: TravelDataProvider):
        self.fallback = fallback_provider

    def analyze_user_preferences(self, destination: str, preferences: List[str], budget: float, duration: int) -> Dict[str, Any]:
        # Logic for analysis can be shared or specific. 
        # For now, real APIs don't do "style analysis" well, so we delegate to fallback/mock logic 
        # which has the rule-based system, OR we could implement AI based analysis here.
        # The existing app.py used simple rule-based. Let's stick to that for consistency.
        return self.fallback.analyze_user_preferences(destination, preferences, budget, duration)

    async def get_flights(self, origin: str, destination: str, start_date: str, budget: float, travelers: int) -> List[Dict[str, Any]]:
        try:
            real_flights = await real_api_manager.get_real_flights(origin, destination, start_date, travelers)
            if real_flights:
                # Filter by budget (logic preserved from app.py)
                affordable_flights = [f for f in real_flights if f["price"] * travelers <= budget * 0.6]
                if affordable_flights:
                    print(f"✅ Using {len(affordable_flights)} real-time flights")
                    return affordable_flights[:5]
            
            print("⚠️ Real-time flights not available/affordable, using fallback")
            return await self.fallback.get_flights(origin, destination, start_date, budget, travelers)
            
        except Exception as e:
            print(f"⚠️ Real flight API error: {e}")
            return await self.fallback.get_flights(origin, destination, start_date, budget, travelers)

    async def get_hotels(self, destination: str, start_date: str, duration: int, budget: float, travelers: int, travel_style: str) -> List[Dict[str, Any]]:
        try:
            # Note: real_api_manager.get_real_hotels signature might need verifying. 
            # app.py called: get_real_hotels(destination, start_date, checkout_date, travelers)
            from datetime import datetime, timedelta
            start_dt = datetime.fromisoformat(start_date)
            end_dt = start_dt + timedelta(days=duration)
            checkout_date = end_dt.strftime("%Y-%m-%d")

            real_hotels = await real_api_manager.get_real_hotels(destination, start_date, checkout_date, travelers)
            
            if real_hotels:
                budget_per_night = budget * 0.4 / duration
                suitable_hotels = []
                for hotel in real_hotels:
                    # Simple filter logic
                    if hotel["price"] <= budget_per_night:
                         suitable_hotels.append(hotel)
                
                if suitable_hotels:
                    print(f"✅ Using {len(suitable_hotels)} real-time hotels")
                    return suitable_hotels[:5]

            print("⚠️ Real-time hotels not available/affordable, using fallback")
            return await self.fallback.get_hotels(destination, start_date, duration, budget, travelers, travel_style)

        except Exception as e:
            print(f"⚠️ Real hotel API error: {e}")
            return await self.fallback.get_hotels(destination, start_date, duration, budget, travelers, travel_style)

    async def get_activities(self, destination: str, duration: int, preferences: List[str], budget: float) -> List[Dict[str, Any]]:
        try:
            real_activities = await real_api_manager.get_real_activities(destination, preferences)
            
            if real_activities and len(real_activities) >= duration:
                 print(f"✅ Using {len(real_activities)} real-time activities")
                 return real_activities
            
            print("⚠️ Insufficient real-time activities, using fallback")
            return await self.fallback.get_activities(destination, duration, preferences, budget)

        except Exception as e:
            print(f"⚠️ Real-time activity API error: {e}")
            return await self.fallback.get_activities(destination, duration, preferences, budget)

    async def get_weather(self, destination: str, start_date: str, duration: int) -> Dict[str, Any]:
        try:
            real_weather = await real_api_manager.get_real_weather(destination, start_date, duration)
            if real_weather and real_weather.get("forecast"):
                return real_weather
            
            print("⚠️ Real-time weather unavailable, using fallback")
            return await self.fallback.get_weather(destination, start_date, duration)
        except Exception as e:
            print(f"⚠️ Real-time weather error: {e}")
            return await self.fallback.get_weather(destination, start_date, duration)
