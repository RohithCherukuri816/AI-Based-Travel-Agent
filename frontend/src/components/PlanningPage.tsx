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
import ProgressTracker from './ProgressTracker';
import QuickActions from './QuickActions';
import '../PlanningPage.css';

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
          console.log('✅ Location access granted - nearby places available');
        },
        (error) => {
          console.error("❌ Location access denied - nearby features unavailable:", error);
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
              <ProgressTracker planningProgress={planningProgress} />

              {/* Quick Actions Widget */}
              <QuickActions onAction={handleSendMessage} hasLocation={!!currentLocation} />

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