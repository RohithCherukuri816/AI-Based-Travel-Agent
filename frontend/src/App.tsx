import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// Import all components from the components directory
import Navbar from './components/Navbar';
import PlanningLandingPage from './components/PlanningLandingPage';
import PlanningNavbar from './components/PlanningNavbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ChatPage from './components/ChatPage';
import PlanningPage from './components/PlanningPage';
import Footer from './components/Footer';
import AboutDeveloperPage from './components/AboutDeveloperPage';
import BudgetCalculatorPage from './components/BudgetCalculatorPage';


import './App.css';

// This component conditionally renders the correct Navbar based on the URL
const AppContent = () => {
  const location = useLocation();

  // Define which routes should use the planning navbar
  const isPlanningRoute = location.pathname === '/planning' || location.pathname === '/chat' || location.pathname === '/budget-calculator';

  return (
    <div className="App">
      {/* Conditionally render the correct navbar */}
      {isPlanningRoute ? <PlanningNavbar /> : <Navbar />}

      {/* Main content area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/features" element={<FeaturesSection />} />
          <Route path="/about-developer" element={<AboutDeveloperPage />} />
          <Route path="/pricing" element={<PricingSection />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/budget-calculator" element={<BudgetCalculatorPage />} />
          <Route path="/planning-landing" element={<PlanningLandingPage />} />
        </Routes>
      </main>

      {/* Render the Footer on all pages */}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
