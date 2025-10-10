"""
AI Travel Planning Agent - Simplified Analytics Dashboard
Basic analytics and metrics
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MetricType(str, Enum):
    """Types of analytics metrics"""
    USER_GROWTH = "user_growth"
    REVENUE = "revenue"
    TRIP_PLANNING = "trip_planning"
    USER_ENGAGEMENT = "user_engagement"

async def get_dashboard_data(time_range: str = "month") -> Dict[str, Any]:
    """Get analytics dashboard data"""
    try:
        # Generate mock analytics data
        return {
            "overview": {
                "total_users": 1250,
                "active_users": 890,
                "total_trips": 2340,
                "revenue": 125000,
                "growth_rate": 15.2
            },
            "user_metrics": {
                "new_users_today": 45,
                "active_sessions": 123,
                "avg_session_duration": "12m 34s",
                "bounce_rate": 23.5
            },
            "trip_metrics": {
                "trips_planned_today": 67,
                "avg_trip_value": 2500,
                "popular_destinations": [
                    {"name": "Paris", "count": 234},
                    {"name": "London", "count": 189},
                    {"name": "Tokyo", "count": 156},
                    {"name": "New York", "count": 134},
                    {"name": "Rome", "count": 98}
                ]
            },
            "charts": {
                "user_growth": generate_chart_data("user_growth", time_range),
                "revenue": generate_chart_data("revenue", time_range),
                "trip_planning": generate_chart_data("trip_planning", time_range)
            }
        }
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        return {"error": str(e)}

async def get_real_time_metrics() -> Dict[str, Any]:
    """Get real-time metrics"""
    try:
        return {
            "active_users": random.randint(80, 150),
            "current_sessions": random.randint(20, 50),
            "trips_being_planned": random.randint(5, 25),
            "api_requests_per_minute": random.randint(100, 300),
            "system_health": "healthy",
            "response_time": f"{random.randint(50, 200)}ms"
        }
    except Exception as e:
        logger.error(f"Error getting real-time metrics: {e}")
        return {"error": str(e)}

def generate_chart_data(chart_type: str, time_range: str) -> List[Dict[str, Any]]:
    """Generate mock chart data"""
    days = 30 if time_range == "month" else 7
    data = []
    
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-i-1)).strftime("%Y-%m-%d")
        
        if chart_type == "user_growth":
            value = random.randint(20, 80)
        elif chart_type == "revenue":
            value = random.randint(1000, 5000)
        elif chart_type == "trip_planning":
            value = random.randint(10, 50)
        else:
            value = random.randint(1, 100)
        
        data.append({"date": date, "value": value})
    
    return data

def analytics_dashboard():
    """Analytics dashboard endpoint"""
    return {"status": "Analytics dashboard available"}