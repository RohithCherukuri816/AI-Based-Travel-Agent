import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const analyticsStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #6a0dad, #9d4edd); /* Updated to match other pages */
  color: #333333;
  line-height: 1.6;
}

.dashboard-page-container {
  display: flex;
  flex-direction: column;
  height: 85vh;
  width: 100%;
  max-width: 900px; /* Same as chat and planning pages */
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: auto;
  margin: 2rem auto;
  padding: 2rem;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.analytics-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #6a0dad; /* Updated to match the primary color */
}

.analytics-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-range-select {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  background: transparent;
  border-color: #6a0dad; /* Updated to match the primary color */
  color: #6a0dad; /* Updated to match the primary color */
}

.btn-outline:hover {
  background: #6a0dad; /* Updated to match the primary color */
  color: white;
}

.metrics-grid, .real-time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card, .chart-card {
  background: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
}

.metric-card h3, .chart-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #6a0dad; /* Updated to match the primary color */
  margin-bottom: 0.5rem;
}

.metric-card p {
  font-size: 2rem;
  font-weight: 700;
  color: #333333;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.chart-card {
  flex: 1;
  min-width: 300px;
  height: 350px;
}

.chart {
  width: 100%;
  height: 100%;
  background-color: #f8fafc;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a0a0;
  font-size: 1rem;
}
`;

const AnalyticsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadAnalyticsData();
    loadRealTimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalyticsDashboard(timeRange);
      if (response.success && response.data) {
        setDashboardData(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load analytics data');
      }
    } catch (err) {
      setError('Failed to connect to analytics service');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const response = await apiService.getRealTimeAnalytics();
      if (response.success && response.data) {
        setRealTimeData(response.data);
      }
    } catch (err) {
      console.error('Real-time analytics error:', err);
    }
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented soon!');
  };

  if (loading && !dashboardData) {
    return (
      <>
        <style>{analyticsStyles}</style>
        <div className="dashboard-page-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Loading Analytics...</h2>
            <p>Please wait while we fetch your data.</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{analyticsStyles}</style>
        <div className="dashboard-page-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Error Loading Analytics</h2>
            <p>{error}</p>
            <button onClick={loadAnalyticsData} className="btn btn-outline">
              <i className="fas fa-refresh"></i>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{analyticsStyles}</style>
      <div className="dashboard-page-container">
        <div className="analytics-card">
          <div className="analytics-header">
            <h2>Business Analytics Dashboard</h2>
            <div className="analytics-controls">
              <select 
                value={timeRange} 
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="time-range-select"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="btn btn-outline" onClick={handleExportReport}>
                <i className="fas fa-download"></i>
                Export Report
              </button>
            </div>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Users</h3>
              <p>{dashboardData?.overview?.total_users?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="metric-card">
              <h3>Active Trips</h3>
              <p>{dashboardData?.trip_metrics?.trips_planned_today || 'N/A'}</p>
            </div>
            <div className="metric-card">
              <h3>Revenue (Monthly)</h3>
              <p>${dashboardData?.overview?.revenue?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="metric-card">
              <h3>Growth Rate</h3>
              <p>{dashboardData?.overview?.growth_rate || 'N/A'}%</p>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-row">
              <div className="chart-card">
                <h3>User Growth</h3>
                <div className="chart">
                  {dashboardData?.charts?.user_growth ? (
                    <div style={{ padding: '1rem' }}>
                      <p>User growth data available</p>
                      <small>Chart visualization coming soon</small>
                    </div>
                  ) : (
                    'Chart Placeholder'
                  )}
                </div>
              </div>
              <div className="chart-card">
                <h3>Revenue Growth</h3>
                <div className="chart">
                  {dashboardData?.charts?.revenue ? (
                    <div style={{ padding: '1rem' }}>
                      <p>Revenue data available</p>
                      <small>Chart visualization coming soon</small>
                    </div>
                  ) : (
                    'Chart Placeholder'
                  )}
                </div>
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-card">
                <h3>Trip Planning Analytics</h3>
                <div className="chart">
                  {dashboardData?.charts?.trip_planning ? (
                    <div style={{ padding: '1rem' }}>
                      <p>Trip planning data available</p>
                      <small>Chart visualization coming soon</small>
                    </div>
                  ) : (
                    'Chart Placeholder'
                  )}
                </div>
              </div>
              <div className="chart-card">
                <h3>Popular Destinations</h3>
                <div className="chart">
                  {dashboardData?.trip_metrics?.popular_destinations ? (
                    <div style={{ padding: '1rem' }}>
                      {dashboardData.trip_metrics.popular_destinations.slice(0, 3).map((dest: any, index: number) => (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>
                          <strong>{dest.name}</strong>: {dest.count} trips
                        </div>
                      ))}
                    </div>
                  ) : (
                    'Chart Placeholder'
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="real-time-metrics">
            <h3>Real-time System Metrics</h3>
            <div className="real-time-grid">
              <div className="metric-card">
                <h3>API Latency</h3>
                <p>{realTimeData?.response_time || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>Active Sessions</h3>
                <p>{realTimeData?.current_sessions || 'N/A'}</p>
              </div>
              <div className="metric-card">
                <h3>System Health</h3>
                <p style={{ 
                  color: realTimeData?.system_health === 'healthy' ? '#10b981' : '#ef4444' 
                }}>
                  {realTimeData?.system_health || 'Unknown'}
                </p>
              </div>
              <div className="metric-card">
                <h3>API Requests/min</h3>
                <p>{realTimeData?.api_requests_per_minute || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;
