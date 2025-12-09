from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class TravelDataProvider(ABC):
    """
    Abstract base class for travel data providers.
    Defines the interface for fetching flights, hotels, activities, and weather.
    """

    @abstractmethod
    async def get_flights(self, origin: str, destination: str, start_date: str, budget: float, travelers: int) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_hotels(self, destination: str, start_date: str, duration: int, budget: float, travelers: int, travel_style: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_activities(self, destination: str, duration: int, preferences: List[str], budget: float) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def get_weather(self, destination: str, start_date: str, duration: int) -> Dict[str, Any]:
        pass

    @abstractmethod
    def analyze_user_preferences(self, destination: str, preferences: List[str], budget: float, duration: int) -> Dict[str, Any]:
        """
        Analyze user preferences to determine travel style and other metrics.
        This might be shared logic or provider-specific. 
        For now, we include it here to allow flexibility.
        """
        pass
