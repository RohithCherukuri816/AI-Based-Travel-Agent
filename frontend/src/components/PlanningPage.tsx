import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import TravelForm from './TravelForm';
import ItineraryDisplay from './ItineraryDisplay';
import CostBreakdownDisplay from './CostBreakdownDisplay';
import BookingConfirmationDisplay from './BookingConfirmationDisplay';
import FeedbackForm from './FeedbackForm';
import apiService from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement;
  itinerary?: any;
  costBreakdown?: any;
  bookingConfirmation?: any;
}

interface Location {
  latitude: number;
  longitude: number;
}

const planningStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  
  --dark-bg: #0f0f23;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-hover: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.15);
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-muted: #8b8b8b;
  --glow-color: rgba(102, 126, 234, 0.6);
  --shadow-glow: 0 0 30px rgba(102, 126, 234, 0.3);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.planning-page-container {
  min-height: 100vh;
  background: var(--dark-bg);
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(247, 37, 133, 0.12) 0%, transparent 60%),
    radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 60% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(1px);
}

.planning-background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.planning-floating-shape {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
}

.planning-shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
.planning-shape-2 { width: 150px; height: 150px; top: 60%; right: 10%; animation-delay: 3s; }
.planning-shape-3 { width: 100px; height: 100px; bottom: 20%; left: 15%; animation-delay: 6s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-30px) rotate(180deg) scale(1.1); }
}

.planning-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.planning-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: slideDown 1s ease-out;
}

.planning-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  position: relative;
}

.planning-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.planning-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.planning-main {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  flex: 1;
}

.chat-section {
  background: transparent;
  border-radius: 0;
  padding: 0;
  animation: slideInLeft 1s ease-out;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: slideInRight 1s ease-out;
}

.widget {
  background: var(--card-bg);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent);
  transition: left 0.6s;
}

.widget:hover::before {
  left: 100%;
}

.widget-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-title i {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.progress-step.active {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
}

.progress-step.completed {
  background: rgba(76, 175, 80, 0.08);
  border-color: rgba(76, 175, 80, 0.3);
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  font-size: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step-icon.completed {
  background: var(--accent-gradient);
  color: white;
  border: none;
}

.step-icon.active {
  background: var(--primary-gradient);
  color: white;
  border: none;
}

.step-info {
  flex: 1;
}

.step-label {
  font-weight: 600;
  color: var(--text-primary);
}

.step-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.action-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.action-btn i {
  font-size: 1.5rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.trip-summary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(244, 87, 108, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.ai-thinking {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: pulse 2s infinite;
}

.ai-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.thinking-dots {
  display: flex;
  gap: 0.5rem;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-dot:nth-child(1) { animation-delay: -0.32s; }
.thinking-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feedback-section {
  margin-top: 2rem;
  animation: fadeInUp 0.8s ease;
}

.show-feedback-button {
  width: 100%;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--secondary-gradient);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-top: 1rem;
}

.show-feedback-button:hover {
  transform: translateY(-2px);
}

.travel-form-container {
  background: transparent;
  padding: 0;
}

/* Chat message styles to match dark theme */
.chat-messages {
  background: transparent;
}

.chat-message {
  margin-bottom: 1.5rem;
}

.chat-message.user .message-content {
  background: var(--primary-gradient);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem;
  border-bottom-right-radius: 0.5rem;
  max-width: 70%;
  margin-left: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-message.ai .message-content {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  padding: 1rem 1.5rem;
  border-radius: 1.5rem;
  border-bottom-left-radius: 0.5rem;
  max-width: 70%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.message-input-form {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  backdrop-filter: blur(20px);
}

.message-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  flex: 1;
  padding: 1rem;
  font-size: 1rem;
}

.message-input:focus {
  outline: none;
}

.microphone-button, .send-button {
  background: var(--primary-gradient);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.microphone-button:hover, .send-button:hover {
  transform: scale(1.1);
}

.microphone-button.recording {
  background: var(--secondary-gradient);
  animation: pulse 1s infinite;
}

@media (max-width: 1024px) {
  .planning-main {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

.travel-plan-display {
  background: var(--card-bg);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  padding: 2rem;
  animation: slideInLeft 0.8s ease-out;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.plan-header h2 {
  font-size: 2rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.start-over-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  background: var(--secondary-gradient);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.start-over-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(247, 37, 133, 0.4);
}

.plan-summary {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.plan-summary h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.total-cost {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--success-gradient);
  border-radius: 0.8rem;
  text-align: center;
  color: white;
  font-size: 1.2rem;
}

.itinerary-section, .recommendations-section {
  margin-bottom: 2rem;
}

.recommendations-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.recommendations-section ul {
  list-style: none;
  padding: 0;
}

.recommendations-section li {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.8rem;
  border-left: 3px solid var(--accent-gradient);
  color: var(--text-primary);
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--text-primary);
}

.error-message i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.generating-plan {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: var(--card-bg);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

@media (max-width: 768px) {
  .planning-content {
    padding: 1rem;
  }
  
  .planning-title {
    font-size: 2.5rem;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .widget {
    padding: 1rem;
  }
  
  .plan-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .travel-plan-display {
    padding: 1.5rem;
  }
}
`;

const PlanningPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showForm, setShowForm] = useState<boolean>(true);
  const [travelPlan, setTravelPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | undefined>(undefined);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [currentTravelRequest, setCurrentTravelRequest] = useState<any>(null);
  const [planningProgress, setPlanningProgress] = useState({
    destination: false,
    preferences: false,
    itinerary: false,
    budget: false,
    booking: false
  });

  useEffect(() => {
    let storedUserId: string | null = localStorage.getItem('travelAgentUserId');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('travelAgentUserId', storedUserId!);
    }
    setUserId(storedUserId!);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (userId && !sessionId) {
      startNewSession(userId, currentTripId);
    }
  }, [userId, sessionId, currentTripId]);

  const startNewSession = async (currentUserId: string, tripId: string | null) => {
    try {
      const response = await apiService.startChatSession(currentUserId, tripId || undefined);
      if (response.success && response.data) {
        setSessionId(response.data.session_id);
        setMessages([
          {
            id: uuidv4(),
            sender: 'ai',
            content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan your dream trip. To start, what is your desired destination?",
          },
        ]);
        setCurrentTripId(null);
        setShowFeedbackForm(false);
        setPlanningProgress({
          destination: false,
          preferences: false,
          itinerary: false,
          budget: false,
          booking: false
        });
      }
    } catch (error) {
      console.error("Error starting new session:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { id: uuidv4(), sender: 'user', content: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsAITyping(true);

    updatePlanningProgress(message);

    try {
      const response = await apiService.sendChatMessage({
        user_id: userId,
        message: message,
        session_id: sessionId,
        current_location: currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        } : undefined,
      });

      if (response.success && response.data) {
        const aiResponseContent = response.data.response.content || response.data.response.message || "I'm sorry, I couldn't process your request.";
        let parsedContent: any = {};
        try {
          if (typeof aiResponseContent === 'string' && (aiResponseContent.includes('"Itinerary"') || aiResponseContent.includes('"Cost Breakdown"'))) {
            const jsonMatch = aiResponseContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              parsedContent = JSON.parse(jsonMatch[1]);
            } else {
              parsedContent = JSON.parse(aiResponseContent);
            }
          }
        } catch (e) {
          console.error("Error parsing message content as JSON:", e);
        }

        const aiMessage: Message = {
          id: uuidv4(),
          sender: 'ai',
          content: parsedContent["General Content"] || aiResponseContent,
          itinerary: parsedContent.Itinerary,
          costBreakdown: parsedContent['Cost Breakdown'] || parsedContent.CostBreakdown,
          bookingConfirmation: parsedContent['Booking Confirmation'] || parsedContent.BookingConfirmation,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);

        if (response.data.context && response.data.context.trip_id && response.data.context.trip_id !== currentTripId) {
          setCurrentTripId(response.data.context.trip_id);
        }

        if (parsedContent.Itinerary) setPlanningProgress(prev => ({ ...prev, itinerary: true }));
        if (parsedContent['Cost Breakdown']) setPlanningProgress(prev => ({ ...prev, budget: true }));
        if (parsedContent['Booking Confirmation']) setPlanningProgress(prev => ({ ...prev, booking: true }));

      } else {
        console.error("Error from AI backend:", response.error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: uuidv4(), sender: 'ai', content: `Error: ${response.error}` },
        ]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: uuidv4(), sender: 'ai', content: 'Error: Could not connect to backend.' },
      ]);
    } finally {
      setIsAITyping(false);
    }
  };

  const updatePlanningProgress = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('destination')) {
      setPlanningProgress(prev => ({ ...prev, destination: true }));
    }
    if (lowerMessage.includes('preference') || lowerMessage.includes('like') || lowerMessage.includes('want')) {
      setPlanningProgress(prev => ({ ...prev, preferences: true }));
    }
  };

  const handleSubmitPreferences = async (preferences: any) => {
    setIsGeneratingPlan(true);
    setShowForm(false);

    try {
      // Calculate duration from start and end dates
      const startDate = new Date(preferences.startDate);
      const endDate = new Date(preferences.endDate);
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Map budget to numeric value
      const budgetMap: { [key: string]: number } = {
        'Budget': 1500,
        'Standard': 3000,
        'Luxury': 6000
      };

      const budgetValue = budgetMap[preferences.budget] || 3000;

      // Format preferences for the travel planning API
      const travelRequest = {
        destination: preferences.destination || 'Paris',
        start_date: preferences.startDate,
        duration: duration > 0 ? duration : 7,
        budget: budgetValue,
        preferences: [
          ...(preferences.destinationType ? preferences.destinationType.split(', ') : []),
          ...(preferences.purpose ? preferences.purpose.split(', ') : []),
          ...(preferences.accommodationType ? preferences.accommodationType.split(', ') : []),
          ...(preferences.transportMode ? preferences.transportMode.split(', ') : [])
        ].filter(p => p && p !== 'Not specified'),
        travelers: preferences.numTravelers || 1,
        travel_style: preferences.budget?.toLowerCase() || 'standard'
      };

      // Store the travel request for later use
      setCurrentTravelRequest(travelRequest);

      // Call the travel planning API directly
      const response = await apiService.planTravel(travelRequest);

      if (response.success && response.data) {
        setTravelPlan(response.data);
        setPlanningProgress({
          destination: true,
          preferences: true,
          itinerary: true,
          budget: true,
          booking: false
        });
      } else {
        console.error("Error generating travel plan:", response.error);
        setTravelPlan({
          error: "Sorry, I couldn't generate your travel plan. Please try again.",
          itinerary: [],
          total_cost: 0,
          summary: "Plan generation failed",
          recommendations: []
        });
      }
    } catch (error) {
      console.error("Error submitting preferences:", error);
      setTravelPlan({
        error: "Sorry, there was an error generating your travel plan. Please try again.",
        itinerary: [],
        total_cost: 0,
        summary: "Plan generation failed",
        recommendations: []
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSubmitFeedback = async (tripId: string, rating: number, comments: string) => {
    try {
      const response = await apiService.sendChatMessage({
        user_id: userId,
        message: `/submit_feedback ${tripId} ${rating} ${comments}`,
        session_id: sessionId,
        current_location: currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        } : undefined,
      });

      if (response.success && response.data) {
        const aiMessage: Message = {
          id: uuidv4(),
          sender: 'ai',
          content: response.data.response.content || response.data.response.message || "I'm sorry, I couldn't process your request.",
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setShowFeedbackForm(false);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const getCompletedSteps = () => {
    return Object.values(planningProgress).filter(Boolean).length;
  };

  const getTotalSteps = () => {
    return Object.keys(planningProgress).length;
  };

  const handleStartOver = () => {
    setShowForm(true);
    setTravelPlan(null);
    setMessages([]);
    setPlanningProgress({
      destination: false,
      preferences: false,
      itinerary: false,
      budget: false,
      booking: false
    });
  };

  return (
    <>
      <style>{planningStyles}</style>
      <div className="planning-page-container">
        {/* Animated Background */}
        <div className="planning-background-elements">
          <div className="planning-floating-shape planning-shape-1"></div>
          <div className="planning-floating-shape planning-shape-2"></div>
          <div className="planning-floating-shape planning-shape-3"></div>
        </div>

        <div className="planning-content">
          <div className="planning-header">
            <h1 className="planning-title">AI Travel Planning</h1>
            <p className="planning-subtitle">Let's create your perfect trip together</p>
          </div>

          <div className="planning-main">
            <div className="chat-section">
              {showForm && (
                <div className="travel-form-container">
                  <TravelForm onSubmitPreferences={handleSubmitPreferences} />
                </div>
              )}

              {isGeneratingPlan && (
                <div className="generating-plan">
                  <div className="ai-thinking">
                    <div className="ai-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="thinking-dots">
                      <div className="thinking-dot"></div>
                      <div className="thinking-dot"></div>
                      <div className="thinking-dot"></div>
                    </div>
                    <span>AI is creating your personalized travel plan...</span>
                  </div>
                </div>
              )}

              {travelPlan && !isGeneratingPlan && (
                <div className="travel-plan-display">
                  <div className="plan-header">
                    <h2>Your Personalized Travel Plan</h2>
                    <button className="start-over-btn" onClick={handleStartOver}>
                      <i className="fas fa-redo"></i>
                      Plan Another Trip
                    </button>
                  </div>

                  {travelPlan.error ? (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      <p>{travelPlan.error}</p>
                      <button className="retry-btn" onClick={handleStartOver}>
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="plan-summary">
                        <h3>Trip Summary</h3>
                        <p>{travelPlan.summary}</p>
                        <div className="total-cost">
                          <strong>Total Cost: ${travelPlan.total_cost?.toFixed(2) || '0.00'}</strong>
                        </div>
                      </div>

                      {travelPlan.itinerary && travelPlan.itinerary.length > 0 && (
                        <div className="itinerary-section">
                          <ItineraryDisplay itinerary={{
                            destination: currentTravelRequest?.destination || 'Unknown',
                            start_date: currentTravelRequest?.start_date || '',
                            end_date: currentTravelRequest?.end_date || '',
                            preferences: currentTravelRequest?.preferences || [],
                            num_travelers: currentTravelRequest?.travelers || 1,
                            budget: currentTravelRequest?.travel_style || 'Not specified',
                            days: travelPlan.itinerary
                          }} />
                        </div>
                      )}

                      {travelPlan.recommendations && travelPlan.recommendations.length > 0 && (
                        <div className="recommendations-section">
                          <h3>Recommendations</h3>
                          <ul>
                            {travelPlan.recommendations.map((rec: string, index: number) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="sidebar">
              {/* Progress Widget */}
              <div className="widget">
                <h3 className="widget-title">
                  <i className="fas fa-tasks"></i>
                  Planning Progress
                </h3>
                <div className="progress-steps">
                  <div className={`progress-step ${planningProgress.destination ? 'completed' : planningProgress.destination ? 'active' : ''}`}>
                    <div className={`step-icon ${planningProgress.destination ? 'completed' : planningProgress.destination ? 'active' : ''}`}>
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="step-info">
                      <div className="step-label">Destination Set</div>
                      <div className="step-description">Choose where to go</div>
                    </div>
                  </div>

                  <div className={`progress-step ${planningProgress.preferences ? 'completed' : planningProgress.preferences ? 'active' : ''}`}>
                    <div className={`step-icon ${planningProgress.preferences ? 'completed' : planningProgress.preferences ? 'active' : ''}`}>
                      <i className="fas fa-sliders-h"></i>
                    </div>
                    <div className="step-info">
                      <div className="step-label">Preferences</div>
                      <div className="step-description">Set your travel style</div>
                    </div>
                  </div>

                  <div className={`progress-step ${planningProgress.itinerary ? 'completed' : ''}`}>
                    <div className={`step-icon ${planningProgress.itinerary ? 'completed' : ''}`}>
                      <i className="fas fa-route"></i>
                    </div>
                    <div className="step-info">
                      <div className="step-label">Itinerary</div>
                      <div className="step-description">Daily plan created</div>
                    </div>
                  </div>

                  <div className={`progress-step ${planningProgress.budget ? 'completed' : ''}`}>
                    <div className={`step-icon ${planningProgress.budget ? 'completed' : ''}`}>
                      <i className="fas fa-chart-pie"></i>
                    </div>
                    <div className="step-info">
                      <div className="step-label">Budget</div>
                      <div className="step-description">Cost breakdown ready</div>
                    </div>
                  </div>

                  <div className={`progress-step ${planningProgress.booking ? 'completed' : ''}`}>
                    <div className={`step-icon ${planningProgress.booking ? 'completed' : ''}`}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="step-info">
                      <div className="step-label">Booking</div>
                      <div className="step-description">Reservations made</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Widget */}
              <div className="widget">
                <h3 className="widget-title">
                  <i className="fas fa-bolt"></i>
                  Quick Actions
                </h3>
                <div className="quick-actions">
                  <button className="action-btn" onClick={() => handleSendMessage("Show me budget options")}>
                    <i className="fas fa-dollar-sign"></i>
                    Budget Options
                  </button>
                  <button className="action-btn" onClick={() => handleSendMessage("What are the best activities?")}>
                    <i className="fas fa-star"></i>
                    Top Activities
                  </button>
                  <button className="action-btn" onClick={() => handleSendMessage("Show accommodation options")}>
                    <i className="fas fa-hotel"></i>
                    Accommodation
                  </button>
                  <button className="action-btn" onClick={() => handleSendMessage("What's the weather like?")}>
                    <i className="fas fa-cloud-sun"></i>
                    Weather Info
                  </button>
                </div>
              </div>

              {/* Trip Summary Widget */}
              {currentTripId && (
                <div className="widget trip-summary">
                  <h3 className="widget-title">
                    <i className="fas fa-suitcase"></i>
                    Trip Summary
                  </h3>
                  <div className="summary-item">
                    <span className="summary-label">Trip ID:</span>
                    <span className="summary-value">{currentTripId.slice(0, 8)}...</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Status:</span>
                    <span className="summary-value">Planning</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Progress:</span>
                    <span className="summary-value">{getCompletedSteps()}/{getTotalSteps()} steps</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="feedback-section">
            {currentTripId && !showFeedbackForm && (
              <button className="show-feedback-button" onClick={() => setShowFeedbackForm(true)}>
                <i className="fas fa-comment-alt"></i>
                Provide Trip Feedback
              </button>
            )}

            {showFeedbackForm && currentTripId && (
              <div className="feedback-form-container">
                <FeedbackForm onSubmitFeedback={handleSubmitFeedback} tripId={currentTripId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanningPage;