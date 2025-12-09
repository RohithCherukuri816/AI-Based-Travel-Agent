import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// Import all components from the components directory
import Navbar from './components/Navbar';
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

import RealTimeStatus from './components/RealTimeStatus';

import './App.css';

// This component conditionally renders the correct Navbar based on the URL
const AppContent = () => {
  const location = useLocation();

  // Define which routes should use the planning navbar
  const isPlanningRoute = location.pathname === '/planning' || location.pathname === '/chat' || location.pathname === '/budget-calculator';

  // Define routes that should not show any navbar
  const noNavbarRoutes: string[] = [];

  // Define routes that should not show footer
  const noFooterRoutes = ['/chat', '/budget-calculator', '/planning'];

  return (
    <div className="App">
      {/* Conditionally render the correct navbar - hide for landing page */}
      {!noNavbarRoutes.includes(location.pathname) && (
        isPlanningRoute ? <PlanningNavbar /> : <Navbar />
      )}

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
        </Routes>
      </main>

      {/* Render the Footer on all pages except specified routes */}
      {!noFooterRoutes.includes(location.pathname) && <Footer />}

      {/* Real-Time API Status Indicator */}
      <RealTimeStatus />
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