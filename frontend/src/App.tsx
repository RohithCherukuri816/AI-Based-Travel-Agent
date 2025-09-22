import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Import other components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import ChatPage from './components/ChatPage'; // Import ChatPage
import PlanningPage from './components/PlanningPage'; // Import PlanningPage
import AnalyticsDashboard from './components/AnalyticsDashboard'; // Import AnalyticsDashboard
import PaymentModal from './components/PaymentModal'; // Import PaymentModal
import Footer from './components/Footer'; // Import Footer

import './App.css';

// Placeholder Components for new routes
const HomePage = () => <HeroSection />;
const FeaturesPage = () => <FeaturesSection />;
const PricingPage = () => <PricingSection />;
const AnalyticsPage = () => <AnalyticsDashboard />;

// Remove Message interface, Location interface, API_BASE_URL, and all state/handlers that were moved to ChatPage.tsx

function App() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleOpenPaymentModal = () => setIsPaymentModalOpen(true);
  const handleClosePaymentModal = () => setIsPaymentModalOpen(false);

  return (
    <Router> {/* Wrap the entire application in Router */}
      <div className="App">
        <Navbar /> {/* Render the Navbar */}
        {/* Add a button to open the payment modal for testing */}
        <button onClick={handleOpenPaymentModal} style={{ margin: '20px', padding: '10px 20px', position: 'fixed', top: '80px', right: '20px', zIndex: 1000 }}>
          Open Payment Modal (Test)
        </button>
        <main className="main-content"> {/* Wrap Routes in a main tag with a class for styling */}
          <Routes> {/* Define routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/chat" element={<ChatPage />} /> {/* Route for chatbot only */}
            <Route path="/planning" element={<PlanningPage />} /> {/* Route for planning page */}
          </Routes>
        </main>
        <PaymentModal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} />
        <Footer /> {/* Render the Footer */}
      </div>
    </Router>
  );
}

export default App;
