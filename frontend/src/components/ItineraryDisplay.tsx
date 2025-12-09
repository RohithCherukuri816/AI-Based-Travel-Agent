import React, { useState } from 'react';

// Enhanced styles for the itinerary display
import './ItineraryDisplay.css';

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
