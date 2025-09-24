import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navbarStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dark-bg: #0a0a1a;
  --card-bg: rgba(255, 255, 255, 0.03);
  --text-primary: #ffffff;
  --text-secondary: #a0a0c0;
  --glow-color: rgba(102, 126, 234, 0.6);
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.navbar.scrolled {
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(30px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

/* Logo/Brand */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.brand-logo {
  width: 40px;
  height: 40px;
  background: var(--primary-gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  transition: all 0.3s ease;
}

.brand-text {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.navbar-brand:hover .brand-logo {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
}

.navbar-brand:hover .brand-text {
  background: linear-gradient(135deg, #f093fb, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Navigation Menu */
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 25px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.nav-link:hover {
  color: white;
  transform: translateY(-2px);
}

.nav-link:hover::before {
  opacity: 0.1;
}

.nav-link.active {
  color: white;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.nav-link.active::before {
  opacity: 0.2;
}

/* Auth Buttons */
.navbar-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-btn {
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  font-size: 0.9rem;
}

.btn-login {
  background: transparent;
  color: var(--text-secondary);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-login:hover {
  color: white;
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.btn-signup {
  background: var(--primary-gradient);
  color: white;
  position: relative;
  overflow: hidden;
}

.btn-signup::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-signup:hover::before {
  left: 100%;
}

.btn-signup:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* Mobile Menu Toggle */
.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.toggle-bar {
  width: 25px;
  height: 2px;
  background: var(--text-primary);
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-toggle.active .toggle-bar:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-toggle.active .toggle-bar:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active .toggle-bar:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Menu */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(30px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  display: none;
  flex-direction: column;
  gap: 1rem;
}

.mobile-menu.active {
  display: flex;
}

.mobile-nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 1rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  text-align: center;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: white;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

/* Responsive Design */
@media (max-width: 968px) {
  .navbar-menu {
    display: none;
  }
  
  .navbar-auth {
    display: none;
  }
  
  .mobile-toggle {
    display: flex;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 1rem;
  }
  
  .brand-text {
    font-size: 1.5rem;
  }
  
  .brand-logo {
    width: 35px;
    height: 35px;
    font-size: 1.3rem;
  }
}

/* Floating Notification Dot */
.notification-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 8px;
  height: 8px;
  background: var(--secondary-gradient);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

/* Navigation Indicator */
.nav-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--primary-gradient);
  transition: all 0.3s ease;
  border-radius: 2px;
}

`;

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: 'fas fa-home' },
    { path: '/features', label: 'Features', icon: 'fas fa-star' },
    // { path: '/planning', label: 'Plan Trip', icon: 'fas fa-plane' },
    // { path: '/chat', label: 'AI Chat', icon: 'fas fa-robot' },
    // { path: '/budget-calculator', label: 'Budget', icon: 'fas fa-calculator' },
    { path: '/about-developer', label: 'Developer', icon: 'fas fa-code' }
  ];

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <style>{navbarStyles}</style>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <div className="brand-logo">
              <i className="fas fa-plane-departure"></i>
            </div>
            <span className="brand-text">AI Travel Agent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
              >
                <i className={item.icon} style={{ marginRight: '0.5rem' }}></i>
                {item.label}
                <span className="nav-indicator"></span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="navbar-auth">
            <a href="#login" className="auth-btn btn-login">
              <i className="fas fa-sign-in-alt" style={{ marginRight: '0.5rem' }}></i>
              Login
            </a>
            <a href="#signup" className="auth-btn btn-signup">
              <i className="fas fa-user-plus" style={{ marginRight: '0.5rem' }}></i>
              Sign Up
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
            <span className="toggle-bar"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
            >
              <i className={item.icon} style={{ marginRight: '1rem' }}></i>
              {item.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a href="#login" className="auth-btn btn-login" style={{ flex: 1, textAlign: 'center' }}>
              Login
            </a>
            <a href="#signup" className="auth-btn btn-signup" style={{ flex: 1, textAlign: 'center' }}>
              Sign Up
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;