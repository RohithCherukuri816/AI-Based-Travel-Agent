import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Navbar.css';

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