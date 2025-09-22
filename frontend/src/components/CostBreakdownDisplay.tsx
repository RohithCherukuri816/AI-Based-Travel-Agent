import React from 'react';

interface CostBreakdown {
  destination: string;
  num_travelers: number;
  duration: number;
  budget_tier: string;
  breakdown: {
    transport_mode: string;
    flights: number;
    accommodation_type: string;
    accommodation: number;
    meals: number;
    activities: number;
    insurance: number;
    taxes_fees: number;
  };
  total_estimated_cost: number;
}

interface CostBreakdownDisplayProps {
  costBreakdown: CostBreakdown;
}

const CostBreakdownDisplay: React.FC<CostBreakdownDisplayProps> = ({ costBreakdown }) => {
  const { destination, num_travelers, duration, budget_tier, breakdown, total_estimated_cost } = costBreakdown;

  return (
    <div className="cost-breakdown-card">
      <h2 className="cost-breakdown-title">Estimated Cost for your {budget_tier} trip to {destination}</h2>
      <p className="cost-breakdown-meta">Travelers: {num_travelers} | Duration: {duration} days</p>

      <div className="breakdown-details">
        <div className="detail-item">
          <span className="detail-label">Flights ({breakdown.transport_mode}):</span>
          <span className="detail-value">${breakdown.flights.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Accommodation ({breakdown.accommodation_type}):</span>
          <span className="detail-value">${breakdown.accommodation.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Meals:</span>
          <span className="detail-value">${breakdown.meals.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Activities:</span>
          <span className="detail-value">${breakdown.activities.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Insurance:</span>
          <span className="detail-value">${breakdown.insurance.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Taxes & Fees:</span>
          <span className="detail-value">${breakdown.taxes_fees.toFixed(2)}</span>
        </div>
      </div>

      <div className="total-cost">
        <span className="total-label">Total Estimated Cost:</span>
        <span className="total-value">${total_estimated_cost.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CostBreakdownDisplay;
