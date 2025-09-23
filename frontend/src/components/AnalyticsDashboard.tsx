import React from 'react';

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
  return (
    <>
      <style>{analyticsStyles}</style>
      <div className="dashboard-page-container">
        <div className="analytics-card">
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
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Users</h3>
              <p>1,234,567</p>
            </div>
            <div className="metric-card">
              <h3>Active Trips</h3>
              <p>5,432</p>
            </div>
            <div className="metric-card">
              <h3>Revenue (Monthly)</h3>
              <p>$123,456</p>
            </div>
            <div className="metric-card">
              <h3>Conversion Rate</h3>
              <p>15.2%</p>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-row">
              <div className="chart-card">
                <h3>User Growth</h3>
                <div id="userGrowthChart" className="chart">Chart Placeholder</div>
              </div>
              <div className="chart-card">
                <h3>Revenue Growth</h3>
                <div id="revenueChart" className="chart">Chart Placeholder</div>
              </div>
            </div>
            <div className="chart-row">
              <div className="chart-card">
                <h3>Trip Planning Analytics</h3>
                <div id="tripPlanningChart" className="chart">Chart Placeholder</div>
              </div>
              <div className="chart-card">
                <h3>User Engagement</h3>
                <div id="engagementChart" className="chart">Chart Placeholder</div>
              </div>
            </div>
          </div>
          
          <div className="real-time-metrics">
            <h3>Real-time System Metrics</h3>
            <div className="real-time-grid">
              <div className="metric-card">
                <h3>API Latency</h3>
                <p>50ms</p>
              </div>
              <div className="metric-card">
                <h3>Active Sessions</h3>
                <p>1,200</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;
