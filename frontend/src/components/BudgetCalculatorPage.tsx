import React, { useState, useEffect, useRef } from 'react';
import CostBreakdownDisplay from './CostBreakdownDisplay';

const enhancedBudgetStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  
  --dark-bg: #0f0f23;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-hover: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.15);
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-muted: #8b8b8b;
  --glow-color: rgba(102, 126, 234, 0.6);
  --shadow-glow: 0 0 30px rgba(102, 126, 234, 0.3);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.enhanced-budget-wrapper {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(247, 37, 133, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.05) 0%, transparent 50%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-x: hidden;
}

/* Animated Background Elements */
.budget-background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.budget-floating-shape {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.budget-shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
.budget-shape-2 { width: 150px; height: 150px; top: 60%; right: 10%; animation-delay: 2s; }
.budget-shape-3 { width: 100px; height: 100px; bottom: 20%; left: 15%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Main Container */
.enhanced-budget-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  background: var(--card-bg);
  border-radius: 2rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  box-shadow: 
    var(--shadow-card),
    var(--shadow-glow);
  overflow: hidden;
  animation: slideUp 0.8s ease-out;
  padding: 3rem;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Section */
.budget-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.budget-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  animation: fadeInUp 0.8s ease 0.2s both;
}

.budget-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease 0.4s both;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Budget Controls */
.budget-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease 0.6s both;
}

.budget-control-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.budget-control-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.budget-control-card:hover::before {
  left: 100%;
}

.budget-control-card:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.control-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.control-input {
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.control-select {
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.control-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.control-select option {
  background: var(--dark-bg);
  color: var(--text-primary);
}

/* Action Buttons */
.budget-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease 0.8s both;
}

.budget-btn {
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.budget-btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.budget-btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.budget-btn-primary:hover::before {
  left: 100%;
}

.budget-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.budget-btn-outline {
  background: transparent;
  border: 2px solid rgba(102, 126, 234, 0.5);
  color: var(--text-primary);
}

.budget-btn-outline:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.8);
  transform: translateY(-3px);
}

/* Cost Breakdown Section */
.cost-breakdown-section {
  animation: fadeInUp 0.8s ease 1s both;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  text-align: center;
}

/* Enhanced Cost Breakdown Display */
.enhanced-cost-breakdown {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 1.5rem;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Budget Summary */
.budget-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  animation: fadeInUp 0.8s ease 1.2s both;
}

.summary-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .enhanced-budget-container {
    padding: 2rem;
  }
  
  .budget-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .enhanced-budget-wrapper {
    padding: 1rem;
  }
  
  .enhanced-budget-container {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }
  
  .budget-title {
    font-size: 2.5rem;
  }
  
  .budget-subtitle {
    font-size: 1.1rem;
  }
  
  .budget-controls {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .budget-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .budget-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .enhanced-cost-breakdown {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .budget-title {
    font-size: 2rem;
  }
  
  .budget-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .budget-summary {
    grid-template-columns: 1fr;
  }
}
`;

// Sample data with multiple budget options
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

  const handleCalculate = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const template = budgetTemplates[budgetTier as keyof typeof budgetTemplates] || budgetTemplates.standard;
      setCurrentBudget({
        ...template,
        destination,
        num_travelers: travelers,
        duration,
        budget_tier: budgetTier,
      });
      setIsCalculating(false);
    }, 1000);
  };

  const handleReset = () => {
    setDestination('Bali, Indonesia');
    setTravelers(2);
    setDuration(7);
    setBudgetTier('standard');
    setCurrentBudget(budgetTemplates.standard);
  };

  return (
    <>
      <style>{enhancedBudgetStyles}</style>
      <div className="enhanced-budget-wrapper">
        {/* Animated Background */}
        <div className="budget-background-elements">
          <div className="budget-floating-shape budget-shape-1"></div>
          <div className="budget-floating-shape budget-shape-2"></div>
          <div className="budget-floating-shape budget-shape-3"></div>
        </div>

        <div className="enhanced-budget-container">
          {/* Header Section */}
          <div className="budget-header">
            <h1 className="budget-title">AI Budget Calculator</h1>
            <p className="budget-subtitle">
              Plan your perfect trip with our intelligent budget calculator. 
              Get detailed cost breakdowns and optimize your travel expenses.
            </p>
          </div>

          {/* Budget Controls */}
          <div className="budget-controls">
            <div className="budget-control-card">
              <label className="control-label">
                <i className="fas fa-map-marker-alt"></i> Destination
              </label>
              <input
                type="text"
                className="control-input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where do you want to go?"
              />
            </div>

            <div className="budget-control-card">
              <label className="control-label">
                <i className="fas fa-users"></i> Travelers
              </label>
              <input
                type="number"
                className="control-input"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
              />
            </div>

            <div className="budget-control-card">
              <label className="control-label">
                <i className="fas fa-calendar-alt"></i> Duration (Days)
              </label>
              <input
                type="number"
                className="control-input"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                min="1"
                max="30"
              />
            </div>

            <div className="budget-control-card">
              <label className="control-label">
                <i className="fas fa-coins"></i> Budget Tier
              </label>
              <select
                className="control-select"
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
              >
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="budget-actions">
            <button 
              className="budget-btn budget-btn-primary" 
              onClick={handleCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
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
              className="budget-btn budget-btn-outline" 
              onClick={handleReset}
            >
              <i className="fas fa-redo"></i>
              Reset
            </button>
          </div>

          {/* Cost Breakdown Section */}
          <div className="cost-breakdown-section">
            <h2 className="section-title">Cost Breakdown</h2>
            <div className="enhanced-cost-breakdown">
              <CostBreakdownDisplay costBreakdown={currentBudget} />
            </div>
          </div>

          {/* Budget Summary */}
          <div className="budget-summary">
            <div className="summary-card">
              <div className="summary-value">${currentBudget.total_estimated_cost}</div>
              <div className="summary-label">Total Cost</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">${Math.round(currentBudget.total_estimated_cost / currentBudget.duration)}</div>
              <div className="summary-label">Per Day</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">${Math.round(currentBudget.total_estimated_cost / currentBudget.num_travelers)}</div>
              <div className="summary-label">Per Person</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{currentBudget.budget_tier}</div>
              <div className="summary-label">Tier</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedBudgetCalculatorPage;