import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import CostBreakdownDisplay from './components/CostBreakdownDisplay';
import BookingConfirmationDisplay from './components/BookingConfirmationDisplay';
import FeedbackForm from './components/FeedbackForm'; // Import FeedbackForm
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import './App.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement; // Allow content to be a string or a React.ReactElement
  // Optional fields for structured content
  itinerary?: any;
  costBreakdown?: any;
  bookingConfirmation?: any;
}

interface Location { // Define Location interface
  lat: number;
  lon: number;
}

const API_BASE_URL = 'http://localhost:8000'; // Adjust if your FastAPI runs on a different port

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan your dream trip. To start, what is your desired destination?" },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(uuidv4()); // Generate a UUID for userId
  const [currentTripId, setCurrentTripId] = useState<string | null>(null); // To store the current active trip ID
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null); // State for user's current location

  useEffect(() => {
    // Start a new session when the component mounts
    const startNewSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/start_session?user_id=${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSessionId(data.session_id);
          console.log("New session started:", data.session_id);
        } else {
          console.error("Failed to start new session:", data.detail);
        }
      } catch (error) {
        console.error("Error starting new session:", error);
      }
    };
    startNewSession();

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          console.log("Current location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Optionally set a default location or handle the error gracefully
          setCurrentLocation({ lat: 48.8584, lon: 2.2945 }); // Default to Eiffel Tower, Paris
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setCurrentLocation({ lat: 48.8584, lon: 2.2945 }); // Default to Eiffel Tower, Paris
    }

  }, [userId]); // Depend on userId to start session once per user

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: text,
          session_id: sessionId,
          current_location: currentLocation ? { lat: currentLocation.lat, lon: currentLocation.lon } : undefined, // Send actual location if available
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const aiContent = JSON.parse(data.response.content); // Parse the AI's content JSON
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          content: aiContent["General Content"] || JSON.stringify(aiContent, null, 2), // Default to general content or raw JSON
        };

        // Check for structured outputs and add them to the message object
        if (aiContent.Itinerary) {
          aiMessage.itinerary = aiContent.Itinerary;
          aiMessage.content = aiContent["General Content"] || "Here's your itinerary!"; // Use a more friendly message
          if (aiContent.Itinerary.trip_id) { // Assuming itinerary JSON includes trip_id
            setCurrentTripId(aiContent.Itinerary.trip_id);
          }
        }
        if (aiContent["Cost Breakdown"]) {
          aiMessage.costBreakdown = aiContent["Cost Breakdown"];
          aiMessage.content = aiContent["General Content"] || "Here's the cost breakdown!";
        }
        if (aiContent["Booking Confirmation"]) {
          aiMessage.bookingConfirmation = aiContent["Booking Confirmation"];
          aiMessage.content = aiContent["General Content"] || "Your booking is confirmed!";
          if (aiContent["Booking Confirmation"].trip_id) { // Assuming booking confirmation JSON includes trip_id
            setCurrentTripId(aiContent["Booking Confirmation"].trip_id);
          }
          // Potentially show feedback form after booking confirmation
          // setShowFeedbackForm(true); // Uncomment if you want to immediately ask for feedback
        }

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        console.error("Failed to get AI response:", data.detail);
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now().toString(), sender: 'ai', content: `Error: ${data.detail}` },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), sender: 'ai', content: "Error: Could not connect to backend." },
      ]);
    }
  };

  const handleSubmitPreferences = async (preferences: { [key: string]: string | number | string[] }) => {
    console.log("User Preferences:", preferences);
    const preferenceMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: "I've submitted my travel preferences. Please help me plan!",
    };
    setMessages((prevMessages) => [...prevMessages, preferenceMessage]);

    // Send preferences as a chat message to the AI
    const formattedPreferences = Object.entries(preferences)
      .map(([key, value]) => `**${key.replace(/([A-Z])/g, ' $1').toLowerCase()}**: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');
      
    await handleSendMessage(`My travel preferences are:\n${formattedPreferences}\nPlease plan my trip!`);
  };

  const handleSubmitFeedback = async (rating: number, comments: string) => {
    if (!currentTripId) {
      alert("Cannot submit feedback: No active trip found.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: `/submit_feedback ${currentTripId} ${rating} ${comments}`,
          session_id: sessionId,
          current_location: currentLocation ? { lat: currentLocation.lat, lon: currentLocation.lon } : undefined, // Send actual location if available
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const aiResponse: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          content: JSON.parse(data.response.content)["General Content"] || "Feedback submitted successfully!",
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        setShowFeedbackForm(false); // Hide form after submission
      } else {
        console.error("Failed to submit feedback:", data.detail);
        alert(`Failed to submit feedback: ${data.detail}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback: Could not connect to backend.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Travel Agent</h1>
      </header>
      <main className="App-main">
        <div className="chat-container">
          <ChatWindow messages={messages.map(msg => ({
            ...msg,
            content: msg.itinerary ? <ItineraryDisplay itinerary={msg.itinerary} /> :
                     msg.costBreakdown ? <CostBreakdownDisplay costBreakdown={msg.costBreakdown} /> :
                     msg.bookingConfirmation ? <BookingConfirmationDisplay confirmation={msg.bookingConfirmation} /> :
                     msg.content
          }))} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
        <div className="travel-form-container">
          <TravelForm onSubmitPreferences={handleSubmitPreferences} />

          {/* Example button to show feedback form - replace with actual trip completion logic */}
          {currentTripId && !showFeedbackForm && (
            <button className="show-feedback-button" onClick={() => setShowFeedbackForm(true)}>
              Provide Trip Feedback
            </button>
          )}

          {showFeedbackForm && currentTripId && (
            <FeedbackForm onSubmitFeedback={handleSubmitFeedback} tripId={currentTripId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
