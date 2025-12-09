import React, { useState, useEffect, useRef } from 'react';
import CostBreakdownDisplay from './CostBreakdownDisplay';

import './BudgetCalculatorPage.css';

// Enhanced budget templates with more realistic data
const budgetTemplates = {
  budget: {
    destination: 'Bali, Indonesia',
    num_travelers: 2,
    duration: 7,
    budget_tier: 'budget',
    breakdown: {
      transport_mode: 'Economy Flight',
      flights: 800,
      accommodation_type: 'Hostel/Guesthouse',
      accommodation: 350,
      meals: 280,
      activities: 200,
      insurance: 50,
      taxes_fees: 120,
    },
    total_estimated_cost: 1800,
  },
  standard: {
    destination: 'Bali, Indonesia',
    num_travelers: 2,
    duration: 7,
    budget_tier: 'standard',
    breakdown: {
      transport_mode: 'Standard Flight',
      flights: 1200,
      accommodation_type: 'Hotel',
      accommodation: 800,
      meals: 400,
      activities: 300,
      insurance: 80,
      taxes_fees: 150,
    },
    total_estimated_cost: 2930,
  },
  luxury: {
    destination: 'Bali, Indonesia',
    num_travelers: 2,
    duration: 7,
    budget_tier: 'luxury',
    breakdown: {
      transport_mode: 'Business Flight',
      flights: 2500,
      accommodation_type: 'Luxury Resort',
      accommodation: 2000,
      meals: 800,
      activities: 600,
      insurance: 120,
      taxes_fees: 200,
    },
    total_estimated_cost: 6220,
  }
};

const EnhancedBudgetCalculatorPage: React.FC = () => {
  const [currentBudget, setCurrentBudget] = useState(budgetTemplates.standard);
  const [destination, setDestination] = useState('Bali, Indonesia');
  const [travelers, setTravelers] = useState(2);
  const [duration, setDuration] = useState(7);
  const [budgetTier, setBudgetTier] = useState('standard');
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Generate particles
  useEffect(() => {
    if (particlesRef.current) {
      const particles = Array.from({ length: 20 }, (_, i) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 12 + 's';
        particle.style.animationDuration = (Math.random() * 8 + 8) + 's';
        return particle;
      });

      particlesRef.current.append(...particles);
    }
  }, []);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setCurrentStep(2);

    // Simulate realistic calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const template = budgetTemplates[budgetTier as keyof typeof budgetTemplates] || budgetTemplates.standard;
    setCurrentBudget({
      ...template,
      destination,
      num_travelers: travelers,
      duration,
      budget_tier: budgetTier,
    });

    setCurrentStep(3);
    setIsCalculating(false);
  };

  const handleReset = () => {
    setDestination('Bali, Indonesia');
    setTravelers(2);
    setDuration(7);
    setBudgetTier('standard');
    setCurrentBudget(budgetTemplates.standard);
    setCurrentStep(1);
  };

  const budgetTips = [
    {
      icon: '💡',
      title: 'Book Early',
      description: 'Book flights 2-3 months in advance for better prices.'
    },
    {
      icon: '🏨',
      title: 'Flexible Dates',
      description: 'Consider traveling mid-week for cheaper accommodation.'
    },
    {
      icon: '🍽️',
      title: 'Local Eateries',
      description: 'Eat at local restaurants to save on food costs.'
    },
    {
      icon: '🚌',
      title: 'Public Transport',
      description: 'Use public transportation for daily commuting.'
    }
  ];

  return (
    <>

      <div className="enhanced-budget-wrapper">
        {/* Animated Background */}
        <div className="budget-background-elements">
          <div className="budget-floating-shape budget-shape-1"></div>
          <div className="budget-floating-shape budget-shape-2"></div>
          <div className="budget-floating-shape budget-shape-3"></div>
        </div>

        {/* Particle System */}
        <div className="budget-particles" ref={particlesRef}></div>

        <div className="budget-content">
          {/* Enhanced Header */}
          <div className="budget-header">
            <h1 className="budget-title">AI Budget Calculator</h1>
            <p className="budget-subtitle">
              Plan your perfect trip with our intelligent budget calculator.
              Get detailed cost breakdowns, personalized recommendations, and optimize your travel expenses.
            </p>

            {/* Progress Indicator */}
            <div className="budget-progress">
              <div className="progress-steps">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-circle">1</div>
                  <div className="step-label">Details</div>
                </div>
                <div className={`progress-line ${currentStep > 1 ? 'completed' : ''}`}></div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-circle">2</div>
                  <div className="step-label">Calculate</div>
                </div>
                <div className={`progress-line ${currentStep > 2 ? 'completed' : ''}`}></div>
                <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                  <div className="step-circle">3</div>
                  <div className="step-label">Results</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="budget-main-container">
            {/* Input Section */}
            <div className="budget-input-section">
              <h2 className="section-title">
                <i className="fas fa-edit"></i>
                Trip Details
              </h2>

              <div className="budget-inputs">
                <div className="input-group">
                  <label className="input-label">
                    <i className="fas fa-map-marker-alt"></i>
                    Destination
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where do you want to go?"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <i className="fas fa-users"></i>
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <i className="fas fa-calendar-alt"></i>
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              {/* Budget Tier Selector */}
              <div className="budget-tier-selector">
                <label className="input-label">
                  <i className="fas fa-coins"></i>
                  Budget Tier
                </label>
                <div className="tier-options">
                  <div
                    className={`tier-option ${budgetTier === 'budget' ? 'selected' : ''}`}
                    onClick={() => setBudgetTier('budget')}
                  >
                    <div className="tier-icon">💰</div>
                    <div className="tier-name">Budget</div>
                    <div className="tier-description">Basic comfort</div>
                  </div>
                  <div
                    className={`tier-option ${budgetTier === 'standard' ? 'selected' : ''}`}
                    onClick={() => setBudgetTier('standard')}
                  >
                    <div className="tier-icon">⭐</div>
                    <div className="tier-name">Standard</div>
                    <div className="tier-description">Good comfort</div>
                  </div>
                  <div
                    className={`tier-option ${budgetTier === 'luxury' ? 'selected' : ''}`}
                    onClick={() => setBudgetTier('luxury')}
                  >
                    <div className="tier-icon">👑</div>
                    <div className="tier-name">Luxury</div>
                    <div className="tier-description">Premium comfort</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="budget-actions">
                <button
                  className={`action-btn btn-primary ${isCalculating ? 'btn-loading' : ''}`}
                  onClick={handleCalculate}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <i className="fas fa-spinner"></i>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calculator"></i>
                      Calculate Budget
                    </>
                  )}
                </button>
                <button
                  className="action-btn btn-secondary"
                  onClick={handleReset}
                >
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
              </div>
            </div>

            {/* Results Sidebar */}
            <div className="results-sidebar">
              {/* Cost Summary Widget */}
              <div className="widget cost-summary">
                <h3 className="widget-title">
                  <i className="fas fa-chart-pie"></i>
                  Cost Summary
                </h3>
                <div className="summary-item">
                  <span className="summary-label">Flights</span>
                  <span className="summary-value">${currentBudget.breakdown.flights}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Accommodation</span>
                  <span className="summary-value">${currentBudget.breakdown.accommodation}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Meals</span>
                  <span className="summary-value">${currentBudget.breakdown.meals}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Activities</span>
                  <span className="summary-value">${currentBudget.breakdown.activities}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Cost</span>
                  <span className="summary-value">${currentBudget.total_estimated_cost}</span>
                </div>
              </div>

              {/* Budget Tips Widget */}
              <div className="widget tips-widget">
                <h3 className="widget-title">
                  <i className="fas fa-lightbulb"></i>
                  Money Saving Tips
                </h3>
                {budgetTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <div className="tip-icon">{tip.icon}</div>
                    <div className="tip-content">
                      <div className="tip-title">{tip.title}</div>
                      <div className="tip-description">{tip.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Breakdown Section */}
          <div className="cost-breakdown-section">
            <h2 className="section-title">
              <i className="fas fa-chart-bar"></i>
              Detailed Cost Breakdown
            </h2>
            <div className="cost-breakdown-container">
              <CostBreakdownDisplay costBreakdown={currentBudget} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedBudgetCalculatorPage;