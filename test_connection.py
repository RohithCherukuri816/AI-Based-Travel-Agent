#!/usr/bin/env python3
"""
Test script to verify frontend-backend connectivity
"""

import requests
import json
import time
import sys

def test_backend_health():
    """Test if backend is running and healthy"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_chat_session():
    """Test chat session creation"""
    print("🔍 Testing chat session creation...")
    try:
        response = requests.post(
            "http://localhost:8000/start_session",
            params={"user_id": "test_user"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            if "session_id" in data:
                print("✅ Chat session created successfully")
                return data["session_id"]
            else:
                print("❌ Invalid session response")
                return None
        else:
            print(f"❌ Session creation failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Session creation error: {e}")
        return None

def test_chat_message(session_id):
    """Test sending a chat message"""
    print("🔍 Testing chat message...")
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json={
                "user_id": "test_user",
                "message": "Hello, can you help me plan a trip to Paris?",
                "session_id": session_id
            },
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            if "response" in data and "content" in data["response"]:
                print("✅ Chat message sent and received response")
                print(f"   Response: {data['response']['content'][:100]}...")
                return True
            else:
                print("❌ Invalid chat response format")
                return False
        else:
            print(f"❌ Chat message failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chat message error: {e}")
        return False

def test_travel_planning():
    """Test travel planning endpoint"""
    print("🔍 Testing travel planning...")
    try:
        response = requests.post(
            "http://localhost:8000/api/plan",
            json={
                "destination": "Paris",
                "start_date": "2024-06-01",
                "duration": 7,
                "budget": 2000,
                "preferences": ["culture", "food"],
                "travelers": 2
            },
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print("✅ Travel planning endpoint working")
            return True
        else:
            print(f"❌ Travel planning failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Travel planning error: {e}")
        return False

def test_analytics():
    """Test analytics endpoints"""
    print("🔍 Testing analytics...")
    try:
        response = requests.get("http://localhost:8000/api/analytics/dashboard", timeout=10)
        if response.status_code == 200:
            print("✅ Analytics dashboard working")
            return True
        else:
            print(f"❌ Analytics failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Analytics error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Frontend-Backend Connection Test")
    print("=" * 50)
    
    # Test backend health
    if not test_backend_health():
        print("\n❌ Backend is not running. Please start the backend first.")
        sys.exit(1)
    
    print()
    
    # Test chat functionality
    session_id = test_chat_session()
    if session_id:
        test_chat_message(session_id)
    
    print()
    
    # Test travel planning
    test_travel_planning()
    
    print()
    
    # Test analytics
    test_analytics()
    
    print()
    print("🎉 Connection test completed!")
    print("✅ Frontend and backend are properly connected")

if __name__ == "__main__":
    main()
