import React from 'react';
import '../App.css'; // Assuming App.css contains global styles

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="features-section">
      <div className="features-container">
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
      </div>
    </section>
  );
};

export default FeaturesSection;
