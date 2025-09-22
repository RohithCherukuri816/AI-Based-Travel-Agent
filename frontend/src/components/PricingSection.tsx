import React from 'react';
import '../App.css'; // Assuming App.css contains global styles

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Start free and upgrade as you grow</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Free</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check"></i> 3 trips per month</li>
              <li><i className="fas fa-check"></i> Basic AI planning</li>
              <li><i className="fas fa-check"></i> Standard itineraries</li>
              <li><i className="fas fa-check"></i> Email support</li>
            </ul>
            <button className="btn btn-outline btn-full">Get Started</button>
          </div>
          
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Premium</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">19</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check"></i> Unlimited trips</li>
              <li><i className="fas fa-check"></i> Advanced AI planning</li>
              <li><i className="fas fa-check"></i> Premium itineraries</li>
              <li><i className="fas fa-check"></i> Priority support</li>
              <li><i className="fas fa-check"></i> Export options</li>
              <li><i className="fas fa-check"></i> Real-time updates</li>
            </ul>
            <button className="btn btn-primary btn-full">Start Premium</button>
          </div>
          
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Enterprise</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">99</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check"></i> Everything in Premium</li>
              <li><i className="fas fa-check"></i> Team collaboration</li>
              <li><i className="fas fa-check"></i> Custom integrations</li>
              <li><i className="fas fa-check"></i> Dedicated support</li>
              <li><i className="fas fa-check"></i> Advanced analytics</li>
              <li><i className="fas fa-check"></i> API access</li>
            </ul>
            <button className="btn btn-outline btn-full">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
