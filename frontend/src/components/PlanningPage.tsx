import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import TravelForm from './TravelForm';
import ItineraryDisplay from './ItineraryDisplay';
import CostBreakdownDisplay from './CostBreakdownDisplay';
import BookingConfirmationDisplay from './BookingConfirmationDisplay';
import FeedbackForm from './FeedbackForm';
import '../App.css';

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

const API_BASE_URL = 'http://localhost:8000';

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
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique user ID for this session
    let storedUserId: string | null = localStorage.getItem('travelAgentUserId');
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('travelAgentUserId', storedUserId!);
    }
    setUserId(storedUserId!);

    // Request geolocation permissions and get current location
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
      const response = await fetch(`${API_BASE_URL}/start_session?user_id=${currentUserId}${tripId ? `&trip_id=${tripId}` : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSessionId(data.session_id);
        setMessages(prevMessages => [
          {
            id: uuidv4(),
            sender: 'ai',
            content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan your dream trip. To start, what is your desired destination?",
          },
        ]);
        setCurrentTripId(null);
        setShowFeedbackForm(false);
        console.log("New session started:", data.session_id);
      } else {
        console.error("Failed to start new session:", data.detail || response.statusText);
      }
    } catch (error) {
      console.error("Error starting new session:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { id: uuidv4(), sender: 'user', content: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: message,
          session_id: sessionId,
          current_location: currentLocation ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : undefined,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const aiResponseContent = data.response.content;
        let parsedContent: any = {};
        try {
          if (typeof aiResponseContent === 'string' && (aiResponseContent.includes('"Itinerary"') || aiResponseContent.includes('"Cost Breakdown"') || aiResponseContent.includes('"Booking Confirmation"'))) {
            const jsonMatch = aiResponseContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              parsedContent = JSON.parse(jsonMatch[1]);
            } else {
              parsedContent = JSON.parse(aiResponseContent);
            }
          }
        } catch (e) {
          console.error("Error parsing AI response content as JSON:", e);
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

        if (data.context && data.context.trip_id && data.context.trip_id !== currentTripId) {
          setCurrentTripId(data.context.trip_id);
        }
      } else {
        console.error("Error from AI backend:", data.detail || response.statusText);
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: uuidv4(), sender: 'ai', content: `Error: ${data.detail || response.statusText}` },
        ]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: uuidv4(), sender: 'ai', content: 'Error: Could not connect to backend.' },
      ]);
    }
  };

  const handleSubmitPreferences = async (preferences: any) => {
    const formatArray = (arr: any) => (Array.isArray(arr) ? arr.join(', ') : arr || '');

    const formattedMessage = `My travel preferences are:\n**destination**: ${preferences.destination}\n**destination type**: ${formatArray(preferences.destinationType)}\n**purpose**: ${formatArray(preferences.purpose)}\n**start date**: ${preferences.startDate}\n**end date**: ${preferences.endDate}\n**num travelers**: ${preferences.numTravelers}\n**budget**: ${preferences.budget}\n**accommodation type**: ${formatArray(preferences.accommodationType)}\n**transport mode**: ${formatArray(preferences.transportMode)}\n**special needs**: ${preferences.specialNeeds || 'Please plan my trip!'}`;
    await handleSendMessage(formattedMessage);
  };

  const handleSubmitFeedback = async (tripId: string, rating: number, comments: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message: `/submit_feedback ${tripId} ${rating} ${comments}`,
          session_id: sessionId,
          current_location: currentLocation ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude } : undefined,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const aiMessage: Message = {
          id: uuidv4(),
          sender: 'ai',
          content: data.response.content,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setShowFeedbackForm(false);
      } else {
        console.error("Feedback submission failed:", data.detail || response.statusText);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="chat-page-content">
      <div className="chat-container">
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
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
      <TravelForm onSubmitPreferences={handleSubmitPreferences} />

      {currentTripId && !showFeedbackForm && (
        <button className="show-feedback-button" onClick={() => setShowFeedbackForm(true)}>
          Provide Trip Feedback
        </button>
      )}

      {showFeedbackForm && currentTripId && (
        <FeedbackForm onSubmitFeedback={handleSubmitFeedback} tripId={currentTripId} />
      )}
    </div>
  );
};

export default PlanningPage;
