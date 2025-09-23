import React from 'react';

const pricingStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #6a0dad, #9d4edd);
  color: #333333;
  line-height: 1.6;
}

.pricing-page-container {
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

.pricing-section {
  width: 100%;
  text-align: center;
}

.pricing-header {
  margin-bottom: 2rem;
}

.pricing-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6a0dad;
  margin-bottom: 0.5rem;
}

.pricing-header p {
  font-size: 1.2rem;
  color: #6a0dad;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.pricing-card {
  background-color: #f8fafc;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.pricing-card.featured {
  border-color: #6a0dad;
  position: relative;
  overflow: hidden;
}

.pricing-badge {
  position: absolute;
  top: 1rem;
  right: -2rem;
  background-color: #6a0dad;
  color: white;
  padding: 0.25rem 2.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  transform: rotate(45deg);
  transform-origin: 100% 0;
}

.pricing-card .pricing-header h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.pricing-card .price {
  font-size: 3rem;
  font-weight: 700;
  color: #6a0dad;
  margin-bottom: 1.5rem;
}

.pricing-card .price .currency {
  font-size: 1.5rem;
  vertical-align: top;
}

.pricing-card .price .period {
  font-size: 1rem;
  font-weight: 400;
  color: #666;
}

.pricing-features {
  list-style: none;
  text-align: left;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.pricing-features li {
  font-size: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: #555;
}

.pricing-features li i {
  color: #28a745;
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  width: 100%;
}

.btn-outline {
  background: transparent;
  border-color: #6a0dad;
  color: #6a0dad;
}

.btn-outline:hover {
  background: #6a0dad;
  color: white;
}

.btn-primary {
  background: #6a0dad;
  color: white;
}

.btn-primary:hover {
  background: #9d4edd;
}

`;

const PricingSection: React.FC = () => {
  return (
    <>
      <style>{pricingStyles}</style>
      <div className="pricing-page-container">
        <section id="pricing" className="pricing-section">
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
              <button className="btn btn-outline">Get Started</button>
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
              <button className="btn btn-primary">Start Premium</button>
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
              <button className="btn btn-outline">Contact Sales</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PricingSection;
