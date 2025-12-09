import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <>

      <div className="hero-page-container">
        {/* Animated Background */}
        <div className="hero-background-elements">
          <div className="hero-floating-shape hero-shape-1"></div>
          <div className="hero-floating-shape hero-shape-2"></div>
          <div className="hero-floating-shape hero-shape-3"></div>
        </div>

        <section id="home" className="hero-section">
          <div className="hero-content">
            <div className="hero-glow"></div>

            <h1 className="hero-title">
              <span className="hero-title-main">Plan Your Dream Trip with</span>
              <span className="hero-title-ai">AI Intelligence</span>
            </h1>

            <p className="hero-subtitle">
              Experience the future of travel planning with our advanced AI agents.
              Get personalized itineraries, real-time pricing, and intelligent recommendations in seconds.
            </p>

            <div className="hero-actions">
              <Link to="/planning" className="hero-btn hero-btn-primary">
                <i className="fas fa-magic"></i>
                Start Planning
              </Link>
              <button className="hero-btn hero-btn-outline">
                <i className="fas fa-play"></i>
                Watch Demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-item">
                <div className="hero-stat-number">10K+</div>
                <div className="hero-stat-label">Trips Planned</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-number">98%</div>
                <div className="hero-stat-label">Satisfaction</div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-number">24/7</div>
                <div className="hero-stat-label">AI Support</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-container">
              <div className="hero-main-card">
                <i className="fas fa-robot"></i>
                <span>AI Travel Assistant</span>
              </div>

              <div className="hero-floating-card hero-card-1">
                <i className="fas fa-map-marked-alt"></i>
                <span>Smart Routing</span>
              </div>

              <div className="hero-floating-card hero-card-2">
                <i className="fas fa-star"></i>
                <span>AI Recommendations</span>
              </div>

              <div className="hero-floating-card hero-card-3">
                <i className="fas fa-clock"></i>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HeroSection;