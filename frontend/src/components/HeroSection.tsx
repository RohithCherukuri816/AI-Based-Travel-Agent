import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const heroStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dark-bg: #0f0f23;
  --card-bg: rgba(255, 255, 255, 0.05);
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --glow-color: rgba(102, 126, 234, 0.6);
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--dark-bg);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.hero-page-container {
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
}

/* Animated background elements */
.hero-background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.hero-floating-shape {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.hero-shape-1 { width: 300px; height: 300px; top: 10%; left: 5%; animation-delay: 0s; }
.hero-shape-2 { width: 200px; height: 200px; top: 60%; right: 10%; animation-delay: 2s; }
.hero-shape-3 { width: 150px; height: 150px; bottom: 20%; left: 15%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

.hero-section {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  animation: slideInLeft 1s ease-out;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background: var(--primary-gradient);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.2;
  z-index: -1;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 0.8s ease 0.2s both;
}

.hero-title-main {
  display: block;
  font-size: 3.5rem;
}

.hero-title-ai {
  display: block;
  font-size: 5rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.8s ease 0.6s both;
}

.hero-btn {
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
  position: relative;
  overflow: hidden;
}

.hero-btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.hero-btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.hero-btn-primary:hover::before {
  left: 100%;
}

.hero-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.hero-btn-outline {
  background: transparent;
  border-color: rgba(102, 126, 234, 0.5);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
}

.hero-btn-outline:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.8);
  transform: translateY(-3px);
}

.hero-stats {
  display: flex;
  gap: 3rem;
  animation: fadeInUp 0.8s ease 0.8s both;
}

.hero-stat-item {
  text-align: center;
}

.hero-stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.hero-stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Hero Visual Section */
.hero-visual {
  position: relative;
  animation: slideInRight 1s ease-out;
}

.hero-visual-container {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-main-card {
  position: absolute;
  width: 300px;
  height: 200px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  animation: floatCard 4s ease-in-out infinite;
}

.hero-main-card i {
  font-size: 3rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-main-card span {
  font-weight: 600;
  font-size: 1.1rem;
}

.hero-floating-card {
  position: absolute;
  background: var(--card-bg);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 140px;
  height: 140px;
  animation: float 6s ease-in-out infinite;
}

.hero-floating-card i {
  font-size: 2rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-floating-card span {
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
}

.hero-card-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.hero-card-2 {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.hero-card-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .hero-title-main {
    font-size: 3rem;
  }
  
  .hero-title-ai {
    font-size: 4rem;
  }
  
  .hero-visual-container {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .hero-page-container {
    padding: 1rem;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-title-main {
    font-size: 2.5rem;
  }
  
  .hero-title-ai {
    font-size: 3rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .hero-stats {
    justify-content: center;
    gap: 2rem;
  }
  
  .hero-visual-container {
    height: 300px;
  }
  
  .hero-main-card {
    width: 250px;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-title-main {
    font-size: 2rem;
  }
  
  .hero-title-ai {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .hero-stat-number {
    font-size: 2rem;
  }
}
`;

const HeroSection: React.FC = () => {
  return (
    <>
      <style>{heroStyles}</style>
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