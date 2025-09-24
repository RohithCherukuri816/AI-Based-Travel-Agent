import React from 'react';

const featuresStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dark-bg: #0a0a1a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0c0;
  --glow-color: rgba(102, 126, 234, 0.8);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--dark-bg);
  color: var(--text-primary);
  overflow-x: hidden;
}

.features-page-container {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 0% 0%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(247, 37, 133, 0.1) 0%, transparent 50%),
    linear-gradient(45deg, #0a0a1a 0%, #151528 50%, #0a0a1a 100%);
  position: relative;
  overflow: hidden;
}

/* Advanced Particle System */
.features-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat 8s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

/* Grid Background Animation */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
  opacity: 0.3;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Floating Orbs */
.floating-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.1;
  animation: orbFloat 15s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: var(--primary-gradient);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--secondary-gradient);
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: var(--accent-gradient);
  bottom: 20%;
  left: 20%;
  animation-delay: 10s;
}

@keyframes orbFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.1;
  }
  33% {
    transform: translate(50px, -30px) scale(1.2);
    opacity: 0.15;
  }
  66% {
    transform: translate(-30px, 40px) scale(0.8);
    opacity: 0.08;
  }
}

.features-content {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem;
}

/* Modern Header */
.features-header {
  text-align: center;
  margin-bottom: 8rem;
}

.features-title {
  font-size: 6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #f093fb, #4facfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}

.features-title::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.features-subtitle {
  font-size: 1.8rem;
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 300;
  letter-spacing: 1px;
}

/* Modern Feature Widgets */
.features-widgets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 6rem;
}

/* Holographic Widget */
.holographic-widget {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 3rem;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.holographic-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(102, 126, 234, 0.1), 
    rgba(247, 37, 133, 0.1), 
    transparent);
  transition: left 1s cubic-bezier(0.25, 1, 0.5, 1);
}

.holographic-widget:hover::before {
  left: 100%;
}

.holographic-widget:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 100px rgba(102, 126, 234, 0.1);
}

.widget-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  transition: all 0.4s ease;
}

.holographic-widget:hover .widget-icon {
  transform: scale(1.2) rotate(10deg);
}

.widget-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffffff, #b0b0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.widget-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
  font-weight: 300;
}

.widget-badge {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(247, 37, 133, 0.2));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .features-widgets {
    grid-template-columns: repeat(2, 1fr); 
  }
}

@media (max-width: 768px) {
  .features-content {
    padding: 4rem 1rem;
  }
  
  .features-title {
    font-size: 4rem;
  }
  
  .features-subtitle {
    font-size: 1.4rem;
  }
  
  .features-widgets {
    grid-template-columns: 1fr;
  }
  
  .holographic-widget {
    padding: 2rem;
    min-height: 350px;
  }
}

@media (max-width: 480px) {
  .features-title {
    font-size: 3rem;
  }
  
  .features-subtitle {
    font-size: 1.2rem;
  }
  
  .widget-title {
    font-size: 1.8rem;
  }
}
`;

const FeaturesSection = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6
  }));

  const features = [
    {
      id: 1,
      title: "Multi-Agent AI System",
      description: "Eight specialized AI agents working together to create the perfect travel plan.",
      icon: "fas fa-brain"
    },
    {
      id: 2,
      title: "Natural Language Chat",
      description: "Plan your trip through natural conversation with our intelligent AI assistant.",
      icon: "fas fa-comments"
    },
    {
      id: 3,
      title: "Advanced Analytics",
      description: "Comprehensive business intelligence and user behavior insights.",
      icon: "fas fa-chart-line"
    },
    {
      id: 4,
      title: "Secure Payments",
      description: "Integrated payment processing with Stripe and PayPal.",
      icon: "fas fa-credit-card"
    },
    {
      id: 5,
      title: "Progressive Web App",
      description: "Mobile-responsive design that works seamlessly across all devices.",
      icon: "fas fa-mobile-alt"
    },
    {
      id: 6,
      title: "Real-time Updates",
      description: "Live pricing, availability, and weather information.",
      icon: "fas fa-sync-alt"
    }
  ];

  return (
    <>
      <style>{featuresStyles}</style>
      <div className="features-page-container">
        <div className="grid-background"></div>
        
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="features-particles">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>

        <div className="features-content">
          <div className="features-header">
            <h2 className="features-title">Next-Level Features</h2>
            <p className="features-subtitle">
              Discover what makes our AI Travel Agent revolutionary.
            </p>
          </div>

          <div className="features-widgets">
            {features.map((feature) => (
              <div key={feature.id} className="holographic-widget">
                <i className={`widget-icon ${feature.icon}`}></i>
                <h3 className="widget-title">{feature.title}</h3>
                <p className="widget-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturesSection;