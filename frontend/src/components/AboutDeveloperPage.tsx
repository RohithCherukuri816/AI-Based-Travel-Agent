import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const developerStyles = `
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

.developer-portfolio-container {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(247, 37, 133, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.05) 0%, transparent 50%);
  position: relative;
}

/* Animated background elements */
.background-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
.shape-2 { width: 150px; height: 150px; top: 60%; right: 10%; animation-delay: 2s; }
.shape-3 { width: 100px; height: 100px; bottom: 20%; left: 15%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.developer-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 6rem 0 4rem;
  position: relative;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: var(--primary-gradient);
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  z-index: -1;
}

.avatar-container {
  width: 180px;
  height: 180px;
  margin: 0 auto 2rem;
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  border: 4px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.avatar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  animation: fadeInUp 1s ease;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease 0.2s both;
}

.hero-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  animation: fadeInUp 1s ease 0.4s both;
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

/* Tech Stack */
.tech-stack {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 2rem 0;
}

.tech-item {
  background: var(--card-bg);
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.tech-item:hover {
  transform: translateY(-2px);
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
}

/* Sections */
.section {
  margin: 6rem 0;
  animation: fadeIn 1s ease;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 3rem;
  text-align: center;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.project-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.project-card:hover::before {
  left: 100%;
}

.project-card:hover {
  transform: translateY(-10px);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.project-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.project-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tech-tag {
  background: rgba(102, 126, 234, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

/* Skills */
.skills-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.skill-category {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skill-category h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.skill-list {
  list-style: none;
  padding: 0;
}

.skill-list li {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  position: relative;
  padding-left: 1.5rem;
}

.skill-list li::before {
  content: '▹';
  position: absolute;
  left: 0;
  color: #667eea;
}

/* Contact */
.contact-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
}

.contact-link {
  width: 60px;
  height: 60px;
  background: var(--card-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.contact-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--primary-gradient);
  transition: left 0.3s ease;
  z-index: -1;
}

.contact-link:hover::before {
  left: 0;
}

.contact-link:hover {
  transform: translateY(-5px) scale(1.1);
  color: white;
  border-color: transparent;
}

/* Back to App Button */
.back-to-app {
  text-align: center;
  margin-top: 4rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--primary-gradient);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .developer-content {
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-links {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

/* Scroll animations */
.fade-in {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
`;

const DeveloperPortfolioPage: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

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
      title: "AI Travel Agent",
      description: "Revolutionary travel planning platform with multi-agent AI system, real-time analytics, and intelligent itinerary generation.",
      tech: ["React", "TypeScript", "Node.js", "Python", "AI/ML"],
      icon: "fas fa-plane-departure"
    },
    {
      id: 2,
      title: "Blockchain Marketplace",
      description: "Decentralized e-commerce platform with smart contracts, cryptocurrency payments, and NFT integration.",
      tech: ["Solidity", "Web3.js", "React", "Ethereum"],
      icon: "fas fa-cube"
    },
    {
      id: 3,
      title: "Health Analytics Dashboard",
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
      <style>{developerStyles}</style>
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
              {["Gen AI", "Agentic AI", "Business Automation" , "AWS & GCP", "Vibe Coding", "Prompt Engineering"].map((tech) => (
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
                  <button className="back-button" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
                    View Details <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          <section 
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
          </section>

          {/* Contact Section */}
          <section 
            id="contact" 
            ref={(el: HTMLDivElement | null) => { sectionRefs.current.contact = el; }}
            className={`section fade-in ${visibleSections.has('contact') ? 'visible' : ''}`}
          >
            <h2 className="section-title">Let's Connect</h2>
            <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem'}}>
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