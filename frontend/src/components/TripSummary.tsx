import React from 'react';

interface TripSummaryProps {
    travelPlan: any; // Using any for flexibility as structure might vary, ideally strict typed
}

const TripSummary: React.FC<TripSummaryProps> = ({ travelPlan }) => {
    if (!travelPlan) return null;

    return (
        <div className="widget trip-summary">
            <div className="widget-title">
                <i className="fas fa-clipboard-list"></i> Trip Summary
            </div>
            <div className="summary-content">
                <div className="summary-item">
                    <span className="summary-label">Total Cost</span>
                    <span className="summary-value">${travelPlan.total_cost || 0}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Duration</span>
                    <span className="summary-value">{travelPlan.duration || 'N/A'} days</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Activities</span>
                    <span className="summary-value">{travelPlan.itinerary ? travelPlan.itinerary.reduce((acc: number, day: any) => acc + (day.morning?.length || 0) + (day.afternoon?.length || 0) + (day.evening?.length || 0), 0) : 0}</span>
                </div>
            </div>
        </div>
    );
};

export default TripSummary;
