import React from 'react';
import { Link } from 'react-router-dom';

const landingStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dark-bg: #0f0f23;
  --card-bg: rgba(255, 255, 255, 0.05);
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
}

.landing-page-container {
  min-height: 100vh;
  background: var(--dark-bg);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.landing-content {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

.landing-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.landing-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.get-started-section {
  margin-top: 3rem;
}

.get-started-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.start-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.landing-btn {
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 2px solid transparent;
}

.landing-btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.landing-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.landing-btn-outline {
  background: transparent;
  border-color: rgba(102, 126, 234, 0.5);
  color: var(--text-primary);
}

.landing-btn-outline:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.8);
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .landing-title {
    font-size: 2.5rem;
  }
  
  .start-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .landing-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
`;

const PlanningLandingPage: React.FC = () => {
  return (
    <>
      <style>{landingStyles}</style>
      <div className="landing-page-container">
        <div className="landing-content">
          <h1 className="landing-title">Start Your AI-Powered Journey</h1>
          <p className="landing-subtitle">
            Choose how you'd like to plan your perfect trip with our intelligent travel assistant
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-robot feature-icon"></i>
              <h3 className="feature-title">AI Trip Planning</h3>
              <p className="feature-description">
                Get personalized itineraries crafted by our AI based on your preferences, 
                budget, and travel style.
              </p>
            </div>
            
            <div className="feature-card">
              <i className="fas fa-comments feature-icon"></i>
              <h3 className="feature-title">Chat with AI Assistant</h3>
              <p className="feature-description">
                Have a conversation with our AI travel expert to get recommendations 
                and answers to all your travel questions.
              </p>
            </div>
            
            <div className="feature-card">
              <i className="fas fa-calculator feature-icon"></i>
              <h3 className="feature-title">Budget Calculator</h3>
              <p className="feature-description">
                Plan your expenses with our smart budget calculator that estimates costs 
                for your entire trip.
              </p>
            </div>
          </div>
          
          <div className="get-started-section">
            <h2 className="get-started-title">Ready to Get Started?</h2>
            <div className="start-buttons">
              <Link to="/planning" className="landing-btn landing-btn-primary">
                <i className="fas fa-magic"></i>
                Start AI Planning
              </Link>
              <Link to="/chat" className="landing-btn landing-btn-outline">
                <i className="fas fa-comments"></i>
                Chat with AI Assistant
              </Link>
              <Link to="/budget-calculator" className="landing-btn landing-btn-outline">
                <i className="fas fa-calculator"></i>
                Use Budget Calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanningLandingPage;