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
  max-width: 800px;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
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

.start-planning-btn {
  padding: 1.2rem 3rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.3rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid transparent;
  background: var(--primary-gradient);
  color: white;
}

.start-planning-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.back-to-home {
  margin-top: 2rem;
}

.back-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .landing-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .start-planning-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
}
`;

const PlanningLandingPage: React.FC = () => {
  return (
    <>
      <style>{landingStyles}</style>
      <div className="landing-page-container">
        <div className="landing-content">
          <h1 className="landing-title">AI Travel Planning</h1>
          <p className="landing-subtitle">
            Let our intelligent AI assistant create the perfect travel itinerary tailored just for you
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-robot feature-icon"></i>
              <h3 className="feature-title">Smart Itineraries</h3>
              <p className="feature-description">
                AI-powered travel plans based on your preferences, budget, and interests
              </p>
            </div>
            
            <div className="feature-card">
              <i className="fas fa-map-marked-alt feature-icon"></i>
              <h3 className="feature-title">Personalized Routes</h3>
              <p className="feature-description">
                Optimized daily schedules and transportation recommendations
              </p>
            </div>
            
            <div className="feature-card">
              <i className="fas fa-dollar-sign feature-icon"></i>
              <h3 className="feature-title">Budget Planning</h3>
              <p className="feature-description">
                Detailed cost breakdowns and money-saving suggestions
              </p>
            </div>
          </div>
          
          <div className="get-started-section">
            <h2 className="get-started-title">Ready to Plan Your Trip?</h2>
            <Link to="/planning" className="start-planning-btn">
              <i className="fas fa-magic"></i>
              Start AI Planning
            </Link>
            
            <div className="back-to-home">
              <Link to="/" className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanningLandingPage;