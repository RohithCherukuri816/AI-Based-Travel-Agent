import React from 'react';

import './FeaturesSection.css';

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