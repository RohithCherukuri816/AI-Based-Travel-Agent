import asyncio
import os
import sys

# Add current directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.factory import get_travel_provider

async def verify_backend():
    print("🧪 Starting Backend Verification...")
    
    # 1. Test Factory
    print("\n1️⃣  Testing Factory...")
    provider = get_travel_provider()
    print(f"   Provider Type: {provider.__class__.__name__}")
    
    # 2. Test Fetching Flights
    print("\n2️⃣  Testing get_flights (London)...")
    flights = await provider.get_flights(
        origin="New York",
        destination="London", 
        start_date="2023-12-25", 
        budget=2000, 
        travelers=1
    )
    print(f"   Flights found: {len(flights)}")
    if flights:
        print(f"   First flight: {flights[0].get('airline')} - ${flights[0].get('price')}")
    else:
        print("   ❌ No flights returned")

    # 3. Test Fetching Activities
    print("\n3️⃣  Testing get_activities (Paris)...")
    activities = await provider.get_activities(
        destination="Paris",
        duration=3,
        preferences=["culture", "food"],
        budget=1000
    )
    print(f"   Activities found: {len(activities)}")
    if activities:
        print(f"   First activity: {activities[0].get('name')}")
    else:
        print("   ❌ No activities returned")

    # 4. Test Weather
    print("\n4️⃣  Testing get_weather (Tokyo)...")
    weather = await provider.get_weather(
        destination="Tokyo",
        start_date="2023-12-25",
        duration=3
    )
    if weather and weather.get("forecast"):
        print(f"   Weather forecast items: {len(weather['forecast'])}")
        print(f"   Condition: {weather['forecast'][0].get('condition')}")
    else:
        print("   ❌ No weather returned")

    print("\n✅ Verification Complete")

if __name__ == "__main__":
    asyncio.run(verify_backend())
