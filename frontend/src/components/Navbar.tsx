import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Assuming App.css contains global styles including navbar

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <i className="fas fa-plane-departure"></i>
          <span>AI Travel Agent</span>
        </div>
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <Link to="/planning" className="nav-link">Start Planning</Link>
          <Link to="/chat" className="nav-link">AI Chat</Link>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline" id="loginBtn">Login</button>
          <button className="btn btn-primary" id="signupBtn">Sign Up</button>
        </div>
        <div className="nav-toggle" id="navToggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
