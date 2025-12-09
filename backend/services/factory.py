import os
from .travel_provider import TravelDataProvider
from .mock_provider import MockTravelProvider
from .real_provider import RealTimeTravelProvider

def get_travel_provider() -> TravelDataProvider:
    """
    Factory function to get the appropriate travel data provider.
    Returns RealTimeTravelProvider (with Mock fallback) if keys are present,
    otherwise returns MockTravelProvider.
    """
    # Check for essential API keys for real-time data
    places_key = os.getenv("GOOGLE_PLACES_API_KEY")
    gemini_key = os.getenv("GOOGLE_AI_API_KEY")
    
    mock_provider = MockTravelProvider()
    
    # If we have at least one major key, we try real-time
    if places_key or gemini_key:
        print("🏭 Factory: Real-time configuration detected. Using RealTimeTravelProvider.")
        return RealTimeTravelProvider(fallback_provider=mock_provider)
    
    print("🏭 Factory: No API keys detected. Using MockTravelProvider.")
    return mock_provider
