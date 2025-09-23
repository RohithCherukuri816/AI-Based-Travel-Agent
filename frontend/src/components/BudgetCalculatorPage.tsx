import React from 'react';
import CostBreakdownDisplay from './CostBreakdownDisplay';
import ItineraryDisplay from './ItineraryDisplay';

const sampleCostBreakdown = {
  destination: 'Sample Destination',
  num_travelers: 2,
  duration: 7,
  budget_tier: 'Standard',
  breakdown: {
    transport_mode: 'Flight',
    flights: 1200,
    accommodation_type: 'Hotel',
    accommodation: 800,
    meals: 400,
    activities: 350,
    insurance: 100,
    taxes_fees: 150,
  },
  total_estimated_cost: 3000,
};

const BudgetCalculatorPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6a0dad', marginBottom: '1rem' }}>Budget Calculator</h2>
      <p style={{ color: '#555', marginBottom: '2rem' }}>This page displays a sample cost breakdown of a trip.</p>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <CostBreakdownDisplay costBreakdown={sampleCostBreakdown} />
      </div>
    </div>
  );
};

export default BudgetCalculatorPage;