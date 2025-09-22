import React from 'react';
import '../App.css'; // Assuming App.css contains global styles

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Plan Your Dream Trip with
            <span className="gradient-text">AI Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Experience the future of travel planning with our advanced AI agents.
            Get personalized itineraries, real-time pricing, and intelligent recommendations in seconds.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" id="startPlanningBtn">
              <i className="fas fa-magic"></i>
              Start Planning
            </button>
            <button className="btn btn-outline btn-large" id="watchDemoBtn">
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
      </div>
    </section>
  );
};

export default HeroSection;
