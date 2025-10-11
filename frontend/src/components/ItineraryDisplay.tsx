import React, { useState } from 'react';

// Enhanced styles for the itinerary display
const itineraryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

  :root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
    --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    
    --dark-bg: #0f0f23;
    --card-bg: rgba(255, 255, 255, 0.08);
    --card-hover: rgba(255, 255, 255, 0.12);
    --glass-border: rgba(255, 255, 255, 0.15);
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --text-muted: #8b8b8b;
    --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .itinerary-display-card {
    background: var(--card-bg);
    border-radius: 1.5rem;
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(20px);
    padding: 2rem;
    margin: 1rem 0;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    box-shadow: var(--shadow-card);
    animation: slideInUp 0.8s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .itinerary-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--glass-border);
  }

  .itinerary-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    position: relative;
  }

  .itinerary-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: var(--primary-gradient);
    border-radius: 2px;
  }

  .itinerary-dates {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .itinerary-meta {
    font-size: 1rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.3rem 0.8rem;
    border-radius: 1rem;
    font-size: 0.9rem;
  }

  .itinerary-days-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .itinerary-day {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .itinerary-day::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent);
    transition: left 0.6s;
  }

  .itinerary-day:hover::before {
    left: 100%;
  }

  .itinerary-day:hover {
    transform: translateY(-2px);
    border-color: rgba(102, 126, 234, 0.3);
    background: rgba(102, 126, 234, 0.05);
  }

  .day-header {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }

  .day-number {
    background: var(--accent-gradient);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .weather-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    margin-left: auto;
  }

  .weather-icon {
    font-size: 1.2rem;
  }

  .time-section {
    margin-bottom: 1.5rem;
  }

  .time-header {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .time-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: white;
  }

  .morning-icon { background: var(--warning-gradient); }
  .afternoon-icon { background: var(--accent-gradient); }
  .evening-icon { background: var(--secondary-gradient); }

  .activity-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .activity-item {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.8rem;
    padding: 1rem;
    border-left: 3px solid var(--accent-gradient);
    transition: all 0.3s ease;
    position: relative;
  }

  .activity-item:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(5px);
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .activity-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
  }

  .activity-price {
    background: var(--success-gradient);
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .activity-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .activity-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .activity-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--warning-gradient);
    font-size: 0.8rem;
  }

  .activity-category {
    background: rgba(79, 172, 254, 0.1);
    color: var(--text-primary);
    padding: 0.2rem 0.6rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    border: 1px solid rgba(79, 172, 254, 0.3);
  }

  .activity-tags {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .activity-tag {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
    padding: 0.1rem 0.4rem;
    border-radius: 0.5rem;
    font-size: 0.7rem;
  }

  .day-summary {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .day-cost {
    background: var(--success-gradient);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .travel-tips {
    flex: 1;
    min-width: 200px;
  }

  .travel-tips-header {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .travel-tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .travel-tip {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .tip-icon {
    color: var(--warning-gradient);
    margin-top: 0.1rem;
    font-size: 0.7rem;
  }

  .no-activities {
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0.8rem;
    border: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .expand-toggle {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.5rem;
    transition: color 0.3s ease;
  }

  .expand-toggle:hover {
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    .itinerary-display-card {
      padding: 1.5rem;
      margin: 0.5rem 0;
    }

    .itinerary-title {
      font-size: 2rem;
    }

    .itinerary-meta {
      flex-direction: column;
      gap: 0.5rem;
    }

    .day-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .weather-info {
      margin-left: 0;
    }

    .activity-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .day-summary {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

interface Activity {
  name: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  tags: string[];
  bestTime?: string;
}

interface WeatherInfo {
  condition?: string;
  temperature?: number;
  precipitation?: number;
  high?: number;
  low?: number;
}

interface DayPlan {
  day: number;
  date: string;
  weather?: WeatherInfo;
  morning?: Activity[];
  afternoon?: Activity[];
  evening?: Activity[];
  total_activities?: number;
  estimated_cost?: number;
  travel_tips?: string[];
}

interface ItineraryDisplayProps {
  itinerary: DayPlan[] | any;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  // Handle different itinerary formats
  const days: DayPlan[] = Array.isArray(itinerary) ? itinerary : (itinerary?.days || []);

  const toggleDayExpansion = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  const renderActivities = (activities: Activity[] = [], timeOfDay: string) => {
    if (!activities || activities.length === 0) {
      return <div className="no-activities">No activities planned for {timeOfDay.toLowerCase()}</div>;
    }

    return (
      <ul className="activity-list">
        {activities.map((activity: Activity, index: number) => (
          <li key={index} className="activity-item">
            <div className="activity-header">
              <span className="activity-name">{activity.name}</span>
              <span className="activity-price">${activity.price?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="activity-description">{activity.description}</div>
            <div className="activity-meta">
              <div className="activity-rating">
                <i className="fas fa-star"></i>
                <span>{activity.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <span className="activity-category">{activity.category}</span>
              <div className="activity-tags">
                {(activity.tags || []).map((tag: string, tagIndex: number) => (
                  <span key={tagIndex} className="activity-tag">{tag}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const getWeatherIcon = (condition: string = '') => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return 'fas fa-sun';
    if (conditionLower.includes('cloud')) return 'fas fa-cloud';
    if (conditionLower.includes('rain')) return 'fas fa-cloud-rain';
    if (conditionLower.includes('snow')) return 'fas fa-snowflake';
    return 'fas fa-cloud-sun';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!days || days.length === 0) {
    return (
      <>
        <style>{itineraryStyles}</style>
        <div className="itinerary-display-card">
          <div className="no-activities">
            <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
            <p>No itinerary available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{itineraryStyles}</style>
      <div className="itinerary-display-card">
        <div className="itinerary-header">
          <h2 className="itinerary-title">
            <i className="fas fa-map-marked-alt"></i> Your Travel Itinerary
          </h2>
          <div className="itinerary-dates">
            <i className="fas fa-calendar-alt"></i>
            <span>{days.length} Day{days.length > 1 ? 's' : ''} of Adventure</span>
          </div>
        </div>

        <div className="itinerary-days-container">
          {days.map((dayPlan: DayPlan, dayIndex: number) => {
            const isExpanded = expandedDays.has(dayPlan.day || dayIndex + 1);
            const dayNumber = dayPlan.day || dayIndex + 1;

            return (
              <div key={dayNumber} className="itinerary-day">
                <div className="day-header">
                  <div className="day-number">{dayNumber}</div>
                  <div>
                    <h3>{formatDate(dayPlan.date)}</h3>
                  </div>
                  {dayPlan.weather && (
                    <div className="weather-info">
                      <i className={`weather-icon ${getWeatherIcon(dayPlan.weather.condition || '')}`}></i>
                      <span>
                        {dayPlan.weather.high || dayPlan.weather.temperature || 'N/A'}°
                        {dayPlan.weather.condition && ` • ${dayPlan.weather.condition}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="time-section">
                  <div className="time-header">
                    <div className="time-icon morning-icon">
                      <i className="fas fa-sun"></i>
                    </div>
                    Morning
                  </div>
                  {renderActivities(dayPlan.morning, 'Morning')}
                </div>

                <div className="time-section">
                  <div className="time-header">
                    <div className="time-icon afternoon-icon">
                      <i className="fas fa-cloud-sun"></i>
                    </div>
                    Afternoon
                  </div>
                  {renderActivities(dayPlan.afternoon, 'Afternoon')}
                </div>

                <div className="time-section">
                  <div className="time-header">
                    <div className="time-icon evening-icon">
                      <i className="fas fa-moon"></i>
                    </div>
                    Evening
                  </div>
                  {renderActivities(dayPlan.evening, 'Evening')}
                </div>

                <div className="day-summary">
                  <div className="day-cost">
                    <i className="fas fa-dollar-sign"></i>
                    <span>Day Total: ${dayPlan.estimated_cost?.toFixed(2) || '0.00'}</span>
                  </div>

                  {dayPlan.travel_tips && dayPlan.travel_tips.length > 0 && (
                    <div className="travel-tips">
                      <div className="travel-tips-header">
                        <i className="fas fa-lightbulb"></i>
                        Travel Tips
                      </div>
                      <ul className="travel-tips-list">
                        {dayPlan.travel_tips.slice(0, isExpanded ? undefined : 2).map((tip: string, tipIndex: number) => (
                          <li key={tipIndex} className="travel-tip">
                            <i className="fas fa-chevron-right tip-icon"></i>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                      {dayPlan.travel_tips.length > 2 && (
                        <button
                          className="expand-toggle"
                          onClick={() => toggleDayExpansion(dayNumber)}
                        >
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                          {isExpanded ? 'Show Less' : `Show ${dayPlan.travel_tips.length - 2} More Tips`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ItineraryDisplay;
