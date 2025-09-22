import React from 'react';
import '../App.css'; // Assuming App.css contains global styles

const AnalyticsDashboard: React.FC = () => {
  return (
    <section id="analytics" className="analytics-section">
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>Business Analytics Dashboard</h2>
          <div className="analytics-controls">
            <select id="timeRange" className="time-range-select">
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month" selected>This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="btn btn-outline" id="exportReportBtn">
              <i className="fas fa-download"></i>
              Export Report
            </button>
          </div>
        </div>
        
        <div className="metrics-grid" id="metricsGrid">
          {/* Key metrics will be populated here */}
          <div className="metric-card">
            <h3>Total Users</h3>
            <p>1,234,567</p> {/* Placeholder */}
          </div>
          <div className="metric-card">
            <h3>Active Trips</h3>
            <p>5,432</p> {/* Placeholder */}
          </div>
          <div className="metric-card">
            <h3>Revenue (Monthly)</h3>
            <p>$123,456</p> {/* Placeholder */}
          </div>
          <div className="metric-card">
            <h3>Conversion Rate</h3>
            <p>15.2%</p> {/* Placeholder */}
          </div>
        </div>
        
        <div className="charts-container">
          <div className="chart-row">
            <div className="chart-card">
              <h3>User Growth</h3>
              <div id="userGrowthChart" className="chart"></div>
            </div>
            <div className="chart-card">
              <h3>Revenue Growth</h3>
              <div id="revenueChart" className="chart"></div>
            </div>
          </div>
          <div className="chart-row">
            <div className="chart-card">
              <h3>Trip Planning Analytics</h3>
              <div id="tripPlanningChart" className="chart"></div>
            </div>
            <div className="chart-card">
              <h3>User Engagement</h3>
              <div id="engagementChart" className="chart"></div>
            </div>
          </div>
        </div>
        
        <div className="real-time-metrics">
          <h3>Real-time System Metrics</h3>
          <div className="real-time-grid" id="realTimeGrid">
            {/* Real-time metrics will be populated here */}
            <div className="metric-card">
              <h3>API Latency</h3>
              <p>50ms</p> {/* Placeholder */}
            </div>
            <div className="metric-card">
              <h3>Active Sessions</h3>
              <p>1,200</p> {/* Placeholder */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
