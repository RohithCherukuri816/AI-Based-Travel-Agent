import React from 'react';

const heroStyles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #6a0dad, #9d4edd);
  color: #333333;
  line-height: 1.6;
}

.hero-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust for navbar height */
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 4rem;
}

.hero-content {
  flex: 1;
  text-align: left;
  padding-right: 2rem;
}

.hero-title {
  font-family: 'Poppins', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #333;
}

.gradient-text {
  background: linear-gradient(to right, #6a0dad, #9d4edd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.btn-primary {
  background: #6a0dad;
  color: white;
}

.btn-primary:hover {
  background: #9d4edd;
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

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6a0dad;
}

.stat-label {
  font-size: 0.9rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 400px;
}

.floating-card {
  position: absolute;
  background: #f8fafc;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #333;
  transition: transform 0.3s, box-shadow 0.3s;
}

.floating-card i {
  font-size: 2rem;
  color: #6a0dad;
}

.floating-card span {
  font-weight: 600;
  font-size: 0.9rem;
}

.card-1 {
  top: 10%;
  left: 10%;
  transform: rotate(-10deg);
}

.card-2 {
  top: 30%;
  right: 15%;
  transform: rotate(15deg);
}

.card-3 {
  bottom: 10%;
  left: 20%;
  transform: rotate(-5deg);
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }

  .hero-content {
    padding-right: 0;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    display: none;
  }
}
`;

const HeroSection: React.FC = () => {
  return (
    <>
      <style>{heroStyles}</style>
      <div className="hero-page-container">
        <section id="home" className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span style={{ color: "#000" }}>Plan Your Dream Trip with </span>
              <span className="gradient-text">AI Intelligence</span>
            </h1>
            <p className="hero-subtitle">
              Experience the future of travel planning with our advanced AI agents. Get personalized itineraries, real-time pricing, and intelligent recommendations in seconds.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">
                <i className="fas fa-magic"></i>
                Start Planning
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-play"></i>
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Trips Planned</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">AI Support</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <i className="fas fa-map-marked-alt"></i>
              <span>Smart Routing</span>
            </div>
            <div className="floating-card card-2">
              <i className="fas fa-star"></i>
              <span>AI Recommendations</span>
            </div>
            <div className="floating-card card-3">
              <i className="fas fa-clock"></i>
              <span>Real-time Updates</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HeroSection;
