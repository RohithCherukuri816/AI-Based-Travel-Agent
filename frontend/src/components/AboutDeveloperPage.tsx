import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import './AboutDeveloperPage.css';

const DeveloperPortfolioPage: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const projects = [
    {
      id: 1,
      title: "AI Voice customer support",
      description: "Revolutionary travel planning platform with multi-agent AI system, real-time analytics, and intelligent itinerary generation.",
      tech: ["React", "TypeScript", "Node.js", "Python", "AI/ML"],
      icon: "fas fa-plane-departure"
    },
    {
      id: 2,
      title: "AI Powered Lead Qualification Bot",
      description: "Decentralized e-commerce platform with smart contracts, cryptocurrency payments, and NFT integration.",
      tech: ["Solidity", "Web3.js", "React", "Ethereum"],
      icon: "fas fa-cube"
    },
    {
      id: 3,
      title: "AI Customer Ticket Resolution Bot",
      description: "Real-time health monitoring system with predictive analytics and IoT device integration.",
      tech: ["Vue.js", "Python", "TensorFlow", "IoT"],
      icon: "fas fa-heartbeat"
    },
    {
      id: 4,
      title: "Finetuned Gemma LLM Chatbot",
      description: "Real-time health monitoring system with predictive analytics and IoT device integration.",
      tech: ["Vue.js", "Python", "TensorFlow", "IoT"],
      icon: "fas fa-heartbeat"
    },
    {
      id: 5,
      title: "Website content automation using n8n",
      description: "Real-time health monitoring system with predictive analytics and IoT device integration.",
      tech: ["Vue.js", "Python", "TensorFlow", "IoT"],
      icon: "fas fa-heartbeat"
    },
    {
      id: 3,
      title: "AI Customer Ticket Resolution Bot",
      description: "Real-time health monitoring system with predictive analytics and IoT device integration.",
      tech: ["Vue.js", "Python", "TensorFlow", "IoT"],
      icon: "fas fa-heartbeat"
    }


  ];

  const skills = {
    frontend: ["React", "Vue.js", "TypeScript", "Next.js", "Tailwind CSS"],
    backend: ["Node.js", "Python", "Express", "GraphQL", "PostgreSQL"],
    mobile: ["React Native", "Flutter", "iOS Swift", "Android Kotlin"],
    devops: ["Docker", "AWS", "CI/CD", "Kubernetes", "Nginx"]
  };

  return (
    <>

      <div className="developer-portfolio-container">
        {/* Animated Background */}
        <div className="background-elements">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>

        <div className="developer-content">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-glow"></div>
            <div className="avatar-container">
              <div className="avatar">
                <i className="fas fa-code"></i>
              </div>
            </div>
            <h1 className="hero-title">Rohith Cherukuri</h1>
            <h2 className="hero-subtitle">AI Specialist</h2>
            <p className="hero-description">
              Passionate about creating innovative digital experiences that combine cutting-edge technology
              with exceptional user interfaces. Specializing in AI-driven applications and automated systems.
            </p>

            <div className="tech-stack">
              {["Gen AI", "Agentic AI", "Business Automation", "AWS & GCP", "Vibe Coding", "Prompt Engineering"].map((tech) => (
                <div key={tech} className="tech-item">{tech}</div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section
            id="projects"
            ref={el => sectionRefs.current.projects = el as HTMLDivElement | null}
            className={`section fade-in ${visibleSections.has('projects') ? 'visible' : ''}`}
          >
            <h2 className="section-title">Featured Projects</h2>
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-icon">
                    <i className={project.icon}></i>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <button className="back-button" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    View Details <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          {/* <section 
            id="skills" 
            ref={el => sectionRefs.current.skills = el as HTMLDivElement | null}
            className={`section fade-in ${visibleSections.has('skills') ? 'visible' : ''}`}
          >
            <h2 className="section-title">Technical Expertise</h2>
            <div className="skills-container">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="skill-category">
                  <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                  <ul className="skill-list">
                    {skillList.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section> */}

          {/* Contact Section */}
          <section
            id="contact"
            ref={(el: HTMLDivElement | null) => { sectionRefs.current.contact = el; }}
            className={`section fade-in ${visibleSections.has('contact') ? 'visible' : ''}`}
          >
            <h2 className="section-title">Let's Connect</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Interested in collaboration or have a project in mind?
            </p>
            <div className="contact-links">
              <a href="#" className="contact-link" title="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="contact-link" title="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="contact-link" title="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="contact-link" title="Email">
                <i className="fas fa-envelope"></i>
              </a>
              <a href="#" className="contact-link" title="Portfolio">
                <i className="fas fa-globe"></i>
              </a>
            </div>
          </section>

          {/* Back to App */}
          <div className="back-to-app">
            <Link to="/" className="back-button">
              <i className="fas fa-arrow-left"></i>
              Back to Travel App
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeveloperPortfolioPage;