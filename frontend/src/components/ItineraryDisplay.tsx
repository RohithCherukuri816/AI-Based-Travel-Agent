import React from 'react';

interface Activity {
  time: string;
  description: string;
  type: string;
  backup_option?: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

interface Itinerary {
  destination: string;
  start_date: string;
  end_date: string;
  preferences: string[];
  num_travelers: number;
  budget?: string;
  days: DayPlan[];
}

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  return (
    <div className="itinerary-display-card">
      <h2 className="itinerary-title">Your Adventure to {itinerary.destination}</h2>
      <p className="itinerary-dates">From {itinerary.start_date} to {itinerary.end_date}</p>
      <p className="itinerary-meta">Travelers: {itinerary.num_travelers} | Style: {(itinerary.preferences || []).join(', ')} | Budget: {itinerary.budget || 'Not specified'}</p>

      <div className="itinerary-days-container">
        {(itinerary.days || []).map((dayPlan) => (
          <div key={dayPlan.day} className="itinerary-day">
            <h3 className="day-header">Day {dayPlan.day} - {new Date(dayPlan.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <ul className="activity-list">
              {(dayPlan.activities || []).map((activity, index) => (
                <li key={index} className="activity-item">
                  <span className="activity-time">{activity.time}:</span> 
                  <span className="activity-description">{activity.description}</span>
                  {activity.backup_option && (
                    <span className="activity-backup"> (Backup: {activity.backup_option})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryDisplay;
