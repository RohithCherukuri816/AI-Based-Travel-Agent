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
  
  .chat-message.user .message-content,
  .chat-message.ai .message-content {
    max-width: 85%;
  }
}
`;

const PlanningPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      sender: 'ai',
      content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan your dream trip. To start, what is your desired destination?",
    },
  ]);
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | undefined>(undefined);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
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
        const aiResponseContent = response.data.response.content;
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

        if (parsedContent.Itinerary) setPlanningProgress(prev => ({...prev, itinerary: true}));
        if (parsedContent['Cost Breakdown']) setPlanningProgress(prev => ({...prev, budget: true}));
        if (parsedContent['Booking Confirmation']) setPlanningProgress(prev => ({...prev, booking: true}));

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
      setPlanningProgress(prev => ({...prev, destination: true}));
    }
    if (lowerMessage.includes('preference') || lowerMessage.includes('like') || lowerMessage.includes('want')) {
      setPlanningProgress(prev => ({...prev, preferences: true}));
    }
  };

  const handleSubmitPreferences = async (preferences: any) => {
    const formatArray = (arr: any) => (Array.isArray(arr) ? arr.join(', ') : arr || '');

    const formattedMessage = `My travel preferences are:\n**destination**: ${preferences.destination}\n**destination type**: ${formatArray(preferences.destinationType)}\n**purpose**: ${formatArray(preferences.purpose)}\n**start date**: ${preferences.startDate}\n**end date**: ${preferences.endDate}\n**num travelers**: ${preferences.numTravelers}\n**budget**: ${preferences.budget}\n**accommodation type**: ${formatArray(preferences.accommodationType)}\n**transport mode**: ${formatArray(preferences.transportMode)}\n**special needs**: ${preferences.specialNeeds || 'Please plan my trip!'}`;
    await handleSendMessage(formattedMessage);
    setPlanningProgress(prev => ({...prev, destination: true, preferences: true}));
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
          content: response.data.response.content,
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
              {messages.length === 1 && (
                <div className="travel-form-container">
                  <TravelForm onSubmitPreferences={handleSubmitPreferences} />
                </div>
              )}
              
              {messages.length > 1 && (
                <>
                  <ChatWindow messages={messages.map(msg => {
                    let parsedContent: any = {};
                    try {
                      if (typeof msg.content === 'string' && (msg.content.includes('"Itinerary"') || msg.content.includes('"Cost Breakdown"'))) {
                        const jsonMatch = msg.content.match(/```json\n([\s\S]*?)\n```/);
                        if (jsonMatch && jsonMatch[1]) {
                          parsedContent = JSON.parse(jsonMatch[1]);
                        } else {
                          parsedContent = JSON.parse(msg.content);
                        }
                      }
                    } catch (e) {
                      console.error("Error parsing message content as JSON:", e);
                    }

                    const itinerary = parsedContent.Itinerary || msg.itinerary;
                    const costBreakdown = parsedContent['Cost Breakdown'] || parsedContent.CostBreakdown || msg.costBreakdown;
                    const bookingConfirmation = parsedContent['Booking Confirmation'] || parsedContent.BookingConfirmation || msg.bookingConfirmation;
                    const generalContent = parsedContent["General Content"] || msg.content;

                    return {
                      ...msg,
                      itinerary: itinerary,
                      costBreakdown: costBreakdown,
                      bookingConfirmation: bookingConfirmation,
                      content: itinerary ? <ItineraryDisplay itinerary={itinerary} /> :
                                costBreakdown ? <CostBreakdownDisplay costBreakdown={costBreakdown} /> :
                                bookingConfirmation ? <BookingConfirmationDisplay confirmation={bookingConfirmation} /> :
                                generalContent
                    };
                  })} />
                  
                  {isAITyping && (
                    <div className="ai-thinking">
                      <div className="ai-avatar">
                        <i className="fas fa-robot"></i>
                      </div>
                      <div className="thinking-dots">
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                        <div className="thinking-dot"></div>
                      </div>
                      <span>AI is planning your trip...</span>
                    </div>
                  )}
                  
                  <MessageInput onSendMessage={handleSendMessage} />
                </>
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