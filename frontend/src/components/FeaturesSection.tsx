import React from 'react';

const featuresStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #6a0dad, #9d4edd);
  color: #333333;
  line-height: 1.6;
}

.features-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust for navbar height */
  padding: 2rem;
  width: 100%;
  max-width: 900px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.features-section {
  width: 100%;
  text-align: center;
  padding: 2rem;
}

.features-header {
  margin-bottom: 2rem;
}

.features-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6a0dad;
  margin-bottom: 0.5rem;
}

.features-header p {
  font-size: 1.2rem;
  color: #6a0dad;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.feature-card {
  background-color: #f8fafc;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #9d4edd, #6a0dad);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 2.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.feature-card p {
  font-size: 0.9rem;
  color: #555;
}
`;

const FeaturesSection: React.FC = () => {
  return (
    <>
      <style>{featuresStyles}</style>
      <div className="features-page-container">
        <section id="features" className="features-section">
          <div className="features-header">
            <h2>Next-Level Features</h2>
            <p>Discover what makes our AI Travel Agent revolutionary</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Multi-Agent AI System</h3>
              <p>Eight specialized AI agents working together to create the perfect travel plan</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Natural Language Chat</h3>
              <p>Plan your trip through natural conversation with our intelligent AI assistant</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Advanced Analytics</h3>
              <p>Comprehensive business intelligence and user behavior insights</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <h3>Secure Payments</h3>
              <p>Integrated payment processing with Stripe and PayPal</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Progressive Web App</h3>
              <p>Mobile-responsive design that works seamlessly across all devices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-sync-alt"></i>
              </div>
              <h3>Real-time Updates</h3>
              <p>Live pricing, availability, and weather information</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FeaturesSection;
