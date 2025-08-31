"""
AI Travel Planning Agent - Advanced Analytics Dashboard
Business intelligence and user behavior analytics
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import pandas as pd
import numpy as np
from collections import defaultdict, Counter
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

from config import settings
from models import User, Trip, Payment, ChatSession, ChatMessage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MetricType(str, Enum):
    """Types of analytics metrics"""
    USER_GROWTH = "user_growth"
    REVENUE = "revenue"
    TRIP_PLANNING = "trip_planning"
    USER_ENGAGEMENT = "user_engagement"
    CONVERSION = "conversion"
    PERFORMANCE = "performance"


class TimeRange(str, Enum):
    """Time range options for analytics"""
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"
    CUSTOM = "custom"


@dataclass
class AnalyticsMetric:
    """Analytics metric structure"""
    name: str
    value: float
    unit: str
    change_percentage: Optional[float] = None
    previous_value: Optional[float] = None
    trend: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class ChartData:
    """Chart data structure"""
    labels: List[str]
    values: List[float]
    chart_type: str = "line"
    title: str = ""
    x_label: str = ""
    y_label: str = ""


class AnalyticsEngine:
    """Core analytics engine for data processing"""
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
    
    async def get_user_growth_metrics(self, time_range: TimeRange = TimeRange.MONTH) -> List[AnalyticsMetric]:
        """Get user growth metrics"""
        try:
            # In a real implementation, this would query the database
            # For now, we'll simulate the data
            
            if time_range == TimeRange.MONTH:
                current_users = 1250
                previous_users = 980
                change_pct = ((current_users - previous_users) / previous_users) * 100
                
                return [
                    AnalyticsMetric(
                        name="Total Users",
                        value=current_users,
                        unit="users",
                        change_percentage=change_pct,
                        previous_value=previous_users,
                        trend="up" if change_pct > 0 else "down"
                    ),
                    AnalyticsMetric(
                        name="New Users This Month",
                        value=270,
                        unit="users",
                        change_percentage=15.2,
                        previous_value=234,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Active Users",
                        value=890,
                        unit="users",
                        change_percentage=8.7,
                        previous_value=819,
                        trend="up"
                    )
                ]
            
            return []
            
        except Exception as e:
            logger.error(f"User growth metrics failed: {e}")
            return []
    
    async def get_revenue_metrics(self, time_range: TimeRange = TimeRange.MONTH) -> List[AnalyticsMetric]:
        """Get revenue metrics"""
        try:
            if time_range == TimeRange.MONTH:
                current_revenue = 15420.50
                previous_revenue = 12850.75
                change_pct = ((current_revenue - previous_revenue) / previous_revenue) * 100
                
                return [
                    AnalyticsMetric(
                        name="Monthly Revenue",
                        value=current_revenue,
                        unit="USD",
                        change_percentage=change_pct,
                        previous_value=previous_revenue,
                        trend="up" if change_pct > 0 else "down"
                    ),
                    AnalyticsMetric(
                        name="Average Order Value",
                        value=89.45,
                        unit="USD",
                        change_percentage=5.2,
                        previous_value=85.10,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Revenue per User",
                        value=12.34,
                        unit="USD",
                        change_percentage=12.1,
                        previous_value=11.01,
                        trend="up"
                    )
                ]
            
            return []
            
        except Exception as e:
            logger.error(f"Revenue metrics failed: {e}")
            return []
    
    async def get_trip_planning_metrics(self, time_range: TimeRange = TimeRange.MONTH) -> List[AnalyticsMetric]:
        """Get trip planning metrics"""
        try:
            if time_range == TimeRange.MONTH:
                current_trips = 456
                previous_trips = 389
                change_pct = ((current_trips - previous_trips) / previous_trips) * 100
                
                return [
                    AnalyticsMetric(
                        name="Trips Planned",
                        value=current_trips,
                        unit="trips",
                        change_percentage=change_pct,
                        previous_value=previous_trips,
                        trend="up" if change_pct > 0 else "down"
                    ),
                    AnalyticsMetric(
                        name="Planning Success Rate",
                        value=87.3,
                        unit="%",
                        change_percentage=2.1,
                        previous_value=85.5,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Average Planning Time",
                        value=3.2,
                        unit="minutes",
                        change_percentage=-8.5,
                        previous_value=3.5,
                        trend="down"
                    )
                ]
            
            return []
            
        except Exception as e:
            logger.error(f"Trip planning metrics failed: {e}")
            return []
    
    async def get_user_engagement_metrics(self, time_range: TimeRange = TimeRange.MONTH) -> List[AnalyticsMetric]:
        """Get user engagement metrics"""
        try:
            if time_range == TimeRange.MONTH:
                return [
                    AnalyticsMetric(
                        name="Daily Active Users",
                        value=234,
                        unit="users",
                        change_percentage=12.5,
                        previous_value=208,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Session Duration",
                        value=8.7,
                        unit="minutes",
                        change_percentage=15.2,
                        previous_value=7.6,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Pages per Session",
                        value=4.2,
                        unit="pages",
                        change_percentage=5.0,
                        previous_value=4.0,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Bounce Rate",
                        value=32.1,
                        unit="%",
                        change_percentage=-8.3,
                        previous_value=35.0,
                        trend="down"
                    )
                ]
            
            return []
            
        except Exception as e:
            logger.error(f"User engagement metrics failed: {e}")
            return []
    
    async def get_conversion_metrics(self, time_range: TimeRange = TimeRange.MONTH) -> List[AnalyticsMetric]:
        """Get conversion metrics"""
        try:
            if time_range == TimeRange.MONTH:
                return [
                    AnalyticsMetric(
                        name="Free to Premium Conversion",
                        value=12.8,
                        unit="%",
                        change_percentage=1.5,
                        previous_value=12.6,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Trip Planning to Booking",
                        value=23.4,
                        unit="%",
                        change_percentage=3.2,
                        previous_value=22.7,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Chat to Planning",
                        value=67.2,
                        unit="%",
                        change_percentage=5.8,
                        previous_value=63.6,
                        trend="up"
                    )
                ]
            
            return []
            
        except Exception as e:
            logger.error(f"Conversion metrics failed: {e}")
            return []
    
    async def get_performance_metrics(self, time_range: TimeRange = TimeRange.MONTH) -> List[AnalyticsMetric]:
        """Get system performance metrics"""
        try:
            if time_range == TimeRange.MONTH:
                return [
                    AnalyticsMetric(
                        name="API Response Time",
                        value=245,
                        unit="ms",
                        change_percentage=-12.5,
                        previous_value=280,
                        trend="down"
                    ),
                    AnalyticsMetric(
                        name="System Uptime",
                        value=99.87,
                        unit="%",
                        change_percentage=0.05,
                        previous_value=99.82,
                        trend="up"
                    ),
                    AnalyticsMetric(
                        name="Error Rate",
                        value=0.23,
                        unit="%",
                        change_percentage=-15.4,
                        previous_value=0.27,
                        trend="down"
                    )
                ]
            
            return []
            
        except Exception as e:
            logger.error(f"Performance metrics failed: {e}")
            return []


class ChartGenerator:
    """Generate charts and visualizations"""
    
    @staticmethod
    def create_user_growth_chart(data: List[AnalyticsMetric]) -> go.Figure:
        """Create user growth chart"""
        fig = go.Figure()
        
        # Add user growth line
        fig.add_trace(go.Scatter(
            x=["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            y=[650, 720, 810, 920, 1050, 1250],
            mode='lines+markers',
            name='Total Users',
            line=dict(color='#6366f1', width=3),
            marker=dict(size=8)
        ))
        
        # Add new users bar
        fig.add_trace(go.Bar(
            x=["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            y=[70, 90, 110, 130, 150, 270],
            name='New Users',
            marker_color='#10b981',
            opacity=0.7
        ))
        
        fig.update_layout(
            title="User Growth Over Time",
            xaxis_title="Month",
            yaxis_title="Number of Users",
            template="plotly_white",
            height=400,
            showlegend=True
        )
        
        return fig
    
    @staticmethod
    def create_revenue_chart(data: List[AnalyticsMetric]) -> go.Figure:
        """Create revenue chart"""
        fig = go.Figure()
        
        # Revenue line chart
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        revenue = [8500, 9200, 10500, 11800, 13200, 15420]
        
        fig.add_trace(go.Scatter(
            x=months,
            y=revenue,
            mode='lines+markers',
            name='Monthly Revenue',
            line=dict(color='#f59e0b', width=3),
            marker=dict(size=8),
            fill='tonexty'
        ))
        
        fig.update_layout(
            title="Monthly Revenue Growth",
            xaxis_title="Month",
            yaxis_title="Revenue (USD)",
            template="plotly_white",
            height=400,
            showlegend=True
        )
        
        return fig
    
    @staticmethod
    def create_trip_planning_chart(data: List[AnalyticsMetric]) -> go.Figure:
        """Create trip planning chart"""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Trips Planned', 'Planning Success Rate', 'Average Planning Time', 'Popular Destinations'),
            specs=[[{"type": "bar"}, {"type": "indicator"}],
                   [{"type": "bar"}, {"type": "pie"}]]
        )
        
        # Trips planned bar chart
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        trips = [120, 145, 180, 220, 280, 456]
        
        fig.add_trace(
            go.Bar(x=months, y=trips, name="Trips", marker_color='#8b5cf6'),
            row=1, col=1
        )
        
        # Success rate indicator
        fig.add_trace(
            go.Indicator(
                mode="gauge+number+delta",
                value=87.3,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Success Rate (%)"},
                delta={'reference': 85.5},
                gauge={'axis': {'range': [None, 100]},
                       'bar': {'color': "#8b5cf6"},
                       'steps': [{'range': [0, 50], 'color': "lightgray"},
                                {'range': [50, 80], 'color': "gray"}],
                       'threshold': {'line': {'color': "red", 'width': 4},
                                   'thickness': 0.75, 'value': 90}}
            ),
            row=1, col=2
        )
        
        # Planning time bar chart
        planning_times = [4.2, 3.8, 3.5, 3.3, 3.1, 3.2]
        fig.add_trace(
            go.Bar(x=months, y=planning_times, name="Time (min)", marker_color='#06b6d4'),
            row=2, col=1
        )
        
        # Popular destinations pie chart
        destinations = ['Paris', 'Tokyo', 'New York', 'London', 'Rome', 'Other']
        counts = [45, 38, 32, 28, 25, 42]
        
        fig.add_trace(
            go.Pie(labels=destinations, values=counts, name="Destinations"),
            row=2, col=2
        )
        
        fig.update_layout(
            title="Trip Planning Analytics",
            template="plotly_white",
            height=600,
            showlegend=False
        )
        
        return fig
    
    @staticmethod
    def create_engagement_chart(data: List[AnalyticsMetric]) -> go.Figure:
        """Create user engagement chart"""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Daily Active Users', 'Session Duration', 'Pages per Session', 'Bounce Rate'),
            specs=[[{"type": "scatter"}, {"type": "scatter"}],
                   [{"type": "scatter"}, {"type": "scatter"}]]
        )
        
        # Daily active users
        days = list(range(1, 31))
        dau_values = [180 + np.random.normal(0, 20) for _ in days]
        
        fig.add_trace(
            go.Scatter(x=days, y=dau_values, mode='lines', name='DAU', line=dict(color='#10b981')),
            row=1, col=1
        )
        
        # Session duration
        duration_values = [7.5 + np.random.normal(0, 0.5) for _ in days]
        fig.add_trace(
            go.Scatter(x=days, y=duration_values, mode='lines', name='Duration', line=dict(color='#f59e0b')),
            row=1, col=2
        )
        
        # Pages per session
        pages_values = [3.8 + np.random.normal(0, 0.2) for _ in days]
        fig.add_trace(
            go.Scatter(x=days, y=pages_values, mode='lines', name='Pages', line=dict(color='#8b5cf6')),
            row=2, col=1
        )
        
        # Bounce rate
        bounce_values = [35 + np.random.normal(0, 3) for _ in days]
        fig.add_trace(
            go.Scatter(x=days, y=bounce_values, mode='lines', name='Bounce Rate', line=dict(color='#ef4444')),
            row=2, col=2
        )
        
        fig.update_layout(
            title="User Engagement Metrics (30 Days)",
            template="plotly_white",
            height=600,
            showlegend=False
        )
        
        return fig


class AnalyticsDashboard:
    """Main analytics dashboard"""
    
    def __init__(self):
        self.analytics_engine = AnalyticsEngine()
        self.chart_generator = ChartGenerator()
    
    async def get_dashboard_data(self, time_range: TimeRange = TimeRange.MONTH) -> Dict[str, Any]:
        """Get complete dashboard data"""
        try:
            # Get all metrics
            user_growth = await self.analytics_engine.get_user_growth_metrics(time_range)
            revenue = await self.analytics_engine.get_revenue_metrics(time_range)
            trip_planning = await self.analytics_engine.get_trip_planning_metrics(time_range)
            engagement = await self.analytics_engine.get_user_engagement_metrics(time_range)
            conversion = await self.analytics_engine.get_conversion_metrics(time_range)
            performance = await self.analytics_engine.get_performance_metrics(time_range)
            
            # Generate charts
            user_growth_chart = self.chart_generator.create_user_growth_chart(user_growth)
            revenue_chart = self.chart_generator.create_revenue_chart(revenue)
            trip_planning_chart = self.chart_generator.create_trip_planning_chart(trip_planning)
            engagement_chart = self.chart_generator.create_engagement_chart(engagement)
            
            return {
                "metrics": {
                    "user_growth": user_growth,
                    "revenue": revenue,
                    "trip_planning": trip_planning,
                    "engagement": engagement,
                    "conversion": conversion,
                    "performance": performance
                },
                "charts": {
                    "user_growth": user_growth_chart.to_json(),
                    "revenue": revenue_chart.to_json(),
                    "trip_planning": trip_planning_chart.to_json(),
                    "engagement": engagement_chart.to_json()
                },
                "summary": {
                    "total_users": user_growth[0].value if user_growth else 0,
                    "monthly_revenue": revenue[0].value if revenue else 0,
                    "trips_planned": trip_planning[0].value if trip_planning else 0,
                    "active_users": engagement[0].value if engagement else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Dashboard data generation failed: {e}")
            return {"error": str(e)}
    
    async def get_custom_report(
        self, 
        metrics: List[MetricType], 
        time_range: TimeRange,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate custom analytics report"""
        try:
            report_data = {}
            
            for metric_type in metrics:
                if metric_type == MetricType.USER_GROWTH:
                    report_data["user_growth"] = await self.analytics_engine.get_user_growth_metrics(time_range)
                elif metric_type == MetricType.REVENUE:
                    report_data["revenue"] = await self.analytics_engine.get_revenue_metrics(time_range)
                elif metric_type == MetricType.TRIP_PLANNING:
                    report_data["trip_planning"] = await self.analytics_engine.get_trip_planning_metrics(time_range)
                elif metric_type == MetricType.USER_ENGAGEMENT:
                    report_data["engagement"] = await self.analytics_engine.get_user_engagement_metrics(time_range)
                elif metric_type == MetricType.CONVERSION:
                    report_data["conversion"] = await self.analytics_engine.get_conversion_metrics(time_range)
                elif metric_type == MetricType.PERFORMANCE:
                    report_data["performance"] = await self.analytics_engine.get_performance_metrics(time_range)
            
            return {
                "report_type": "custom",
                "metrics_requested": [m.value for m in metrics],
                "time_range": time_range.value,
                "filters": filters or {},
                "data": report_data,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Custom report generation failed: {e}")
            return {"error": str(e)}
    
    async def export_report(self, report_data: Dict[str, Any], format: str = "json") -> str:
        """Export report in specified format"""
        try:
            if format.lower() == "json":
                return json.dumps(report_data, indent=2, default=str)
            elif format.lower() == "csv":
                # Convert to CSV format
                csv_data = []
                for metric_type, metrics in report_data.get("data", {}).items():
                    for metric in metrics:
                        csv_data.append({
                            "metric_type": metric_type,
                            "name": metric.name,
                            "value": metric.value,
                            "unit": metric.unit,
                            "change_percentage": metric.change_percentage,
                            "trend": metric.trend
                        })
                
                df = pd.DataFrame(csv_data)
                return df.to_csv(index=False)
            else:
                raise ValueError(f"Unsupported format: {format}")
                
        except Exception as e:
            logger.error(f"Report export failed: {e}")
            return f"Export failed: {str(e)}"


class RealTimeAnalytics:
    """Real-time analytics and monitoring"""
    
    def __init__(self):
        self.current_sessions = 0
        self.active_users = 0
        self.api_requests_per_minute = 0
        self.error_count = 0
    
    async def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get real-time system metrics"""
        try:
            # Simulate real-time data
            current_time = datetime.utcnow()
            
            return {
                "timestamp": current_time.isoformat(),
                "current_sessions": self.current_sessions + np.random.randint(-5, 5),
                "active_users": self.active_users + np.random.randint(-10, 10),
                "api_requests_per_minute": self.api_requests_per_minute + np.random.randint(-20, 20),
                "error_count": self.error_count + np.random.randint(0, 3),
                "system_status": "healthy",
                "last_updated": current_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Real-time metrics failed: {e}")
            return {"error": str(e)}
    
    async def update_metrics(self, metric_type: str, value: int):
        """Update real-time metrics"""
        try:
            if metric_type == "sessions":
                self.current_sessions = value
            elif metric_type == "users":
                self.active_users = value
            elif metric_type == "api_requests":
                self.api_requests_per_minute = value
            elif metric_type == "errors":
                self.error_count = value
                
        except Exception as e:
            logger.error(f"Metrics update failed: {e}")


# Global instances
analytics_dashboard = AnalyticsDashboard()
real_time_analytics = RealTimeAnalytics()


# API endpoints for analytics
async def get_dashboard_data(time_range: str = "month") -> Dict[str, Any]:
    """Get main dashboard data"""
    try:
        time_range_enum = TimeRange(time_range)
        return await analytics_dashboard.get_dashboard_data(time_range_enum)
    except ValueError:
        return {"error": f"Invalid time range: {time_range}"}


async def get_custom_report(
    metrics: List[str],
    time_range: str = "month",
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Generate custom analytics report"""
    try:
        metric_types = [MetricType(metric) for metric in metrics]
        time_range_enum = TimeRange(time_range)
        return await analytics_dashboard.get_custom_report(metric_types, time_range_enum, filters)
    except ValueError as e:
        return {"error": f"Invalid parameters: {str(e)}"}


async def export_analytics_report(
    report_data: Dict[str, Any],
    format: str = "json"
) -> str:
    """Export analytics report"""
    return await analytics_dashboard.export_report(report_data, format)


async def get_real_time_metrics() -> Dict[str, Any]:
    """Get real-time system metrics"""
    return await real_time_analytics.get_real_time_metrics()


if __name__ == "__main__":
    # Test the analytics dashboard
    async def test_analytics():
        print("📊 Testing Analytics Dashboard...")
        
        # Test dashboard data
        print("\n📈 Testing Dashboard Data...")
        dashboard_data = await get_dashboard_data("month")
        print(f"Dashboard data generated: {'data' in dashboard_data}")
        
        # Test custom report
        print("\n📋 Testing Custom Report...")
        custom_report = await get_custom_report(
            ["user_growth", "revenue"],
            "month"
        )
        print(f"Custom report generated: {'data' in custom_report}")
        
        # Test real-time metrics
        print("\n⚡ Testing Real-time Metrics...")
        real_time_data = await get_real_time_metrics()
        print(f"Real-time metrics: {real_time_data.get('current_sessions', 'N/A')} active sessions")
        
        # Test report export
        print("\n📤 Testing Report Export...")
        if 'data' in custom_report:
            json_export = await export_analytics_report(custom_report, "json")
            print(f"JSON export length: {len(json_export)} characters")
        
        print("\n✅ Analytics Dashboard tests completed!")
    
    asyncio.run(test_analytics())
