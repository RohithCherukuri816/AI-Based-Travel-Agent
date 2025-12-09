import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';

import './ChatPage.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement;
  timestamp?: Date;
}

interface Location {
  latitude: number;
  longitude: number;
}

// Enhanced Chat Header Component
const EnhancedChatHeader: React.FC<{
  onNewChat: () => void;
  onDeleteChat: () => void;
  locationStatus: 'loading' | 'active' | 'denied' | 'unavailable';
}> = ({ onNewChat, onDeleteChat, locationStatus }) => {
  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'loading': return '📍 Getting location...';
      case 'active': return '📍 Live location active';
      case 'denied': return '⚠️ Location access denied';
      case 'unavailable': return '⚠️ Location unavailable';
      default: return '📍 Location status unknown';
    }
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case 'active': return 'rgba(16, 185, 129, 1)';
      case 'loading': return 'rgba(245, 158, 11, 1)';
      case 'denied':
      case 'unavailable': return 'rgba(239, 68, 68, 1)';
      default: return 'rgba(156, 163, 175, 1)';
    }
  };

  return (
    <div className="enhanced-chat-header">
      <div className="chat-header-info">
        <div className="chat-avatar">🤖</div>
        <div className="chat-header-text">
          <h1>TravelBot AI</h1>
          <p>Your intelligent travel companion</p>
          <div className="chat-status">
            <div className="status-dot"></div>
            <span>Online & Ready</span>
          </div>
          <div className="chat-status" style={{ color: getLocationStatusColor(), marginTop: '0.3rem' }}>
            <div className="status-dot" style={{ background: getLocationStatusColor() }}></div>
            <span style={{ fontSize: '0.75rem' }}>{getLocationStatusText()}</span>
          </div>
        </div>
      </div>
      <div className="enhanced-header-actions">
        <button
          className="enhanced-chat-btn new-chat-btn-enhanced"
          onClick={onNewChat}
        >
          <i className="fas fa-plus"></i>
          New Chat
        </button>
        <button
          className="enhanced-chat-btn delete-chat-btn-enhanced"
          onClick={onDeleteChat}
        >
          <i className="fas fa-trash"></i>
          Clear
        </button>
      </div>
    </div>
  );
};

// Enhanced Chat Window Component
const EnhancedChatWindow: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageContent = (content: string | React.ReactElement) => {
    if (React.isValidElement(content)) {
      return content;
    }

    return (
      <div className="message-text-content">
        {String(content).split('\n').map((line, index) => (
          <p key={index} className="message-line">
            {line}
          </p>
        ))}
      </div>
    );
  };

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div
      className="enhanced-chat-window"
      ref={chatContainerRef}
    >
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`enhanced-message-bubble ${message.sender === 'user' ? 'enhanced-user-message' : 'enhanced-ai-message'
            } ${index === messages.length - 1 ? 'message-highlight' : ''} `}
        >
          {renderMessageContent(message.content)}
          {message.timestamp && (
            <div className="message-timestamp">
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      ))}

      {/* Scroll target for auto-scroll */}
      <div ref={messagesEndRef} style={{ height: '1px' }} />
    </div>
  );
};

// Enhanced Message Input Component
const EnhancedMessageInput: React.FC<{
  onSendMessage: (message: string) => void;
}> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      setIsListening(true);
      // Simulate voice input
      setTimeout(() => {
        setMessage("I'd like to plan a trip to Japan for 2 weeks");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="enhanced-chat-input-container">
      <form onSubmit={handleSubmit} className="enhanced-input-group">
        <input
          type="text"
          className="enhanced-chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about travel planning..."
          disabled={isListening}
        />
        <button
          type="button"
          className={`enhanced-input-btn mic-btn ${isListening ? 'recording' : ''} `}
          onClick={handleVoiceInput}
          disabled={isListening}
        >
          <i className={isListening ? 'fas fa-stop' : 'fas fa-microphone'}></i>
        </button>
        <button
          type="submit"
          className="enhanced-input-btn send-btn"
          disabled={!message.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

// Enhanced Typing Indicator Component
const EnhancedTypingIndicator: React.FC = () => (
  <div className="enhanced-typing-indicator">
    <div className="typing-avatar">🤖</div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <span className="typing-text">TravelBot is thinking...</span>
  </div>
);

// Main Enhanced ChatPage Component
const EnhancedChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'active' | 'denied' | 'unavailable'>('loading');
  const [userId] = useState(() => `user_${Date.now()} `);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Generate particles
  useEffect(() => {
    if (particlesRef.current) {
      const particles = Array.from({ length: 25 }, (_, i) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        return particle;
      });

      particlesRef.current.append(...particles);
    }
  }, []);

  // Get user location with continuous tracking
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('loading');

      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          setLocationStatus('active');
          console.log('✅ Location access granted:', newLocation);
          console.log('📍 Latitude:', newLocation.latitude, 'Longitude:', newLocation.longitude);
        },
        (error) => {
          setLocationStatus('denied');
          console.log('❌ Location access denied:', error.message);
          console.log('💡 Please enable location access in your browser settings to use nearby features');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Watch for location changes (real-time tracking)
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          setLocationStatus('active');
          console.log('📍 Location updated:', newLocation);
        },
        (error) => {
          console.log('⚠️ Location tracking error:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000 // Update every 30 seconds
        }
      );

      // Cleanup function to stop watching location
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setLocationStatus('unavailable');
      console.log('❌ Geolocation is not supported by this browser');
    }
  }, []);

  // Start new session when component mounts
  useEffect(() => {
    if (userId && !sessionId) {
      startNewSession(userId);
    }
  }, [userId, sessionId]);

  const startNewSession = async (currentUserId: string) => {
    try {
      const response = await apiService.startChatSession(currentUserId);
      if (response.success && response.data) {
        setSessionId(response.data.session_id);
        setMessages([
          {
            id: uuidv4(),
            sender: 'ai',
            content: "🌟 Welcome to TravelBot! I'm your AI travel companion, ready to help you plan amazing adventures. Whether you need destination recommendations, itinerary planning, budget calculations, or travel tips - I'm here to make your travel dreams come true! Where would you like to explore today?",
            timestamp: new Date(),
          },
        ]);
        console.log("New session started:", response.data.session_id);
      } else {
        console.error("Failed to start new session:", response.error);
      }
    } catch (error) {
      console.error("Error starting new session:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsAITyping(true);

    try {
      const chatRequest = {
        user_id: userId,
        message: message,
        session_id: sessionId,
        current_location: currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        } : undefined,
        timestamp: new Date().toISOString(),
      };

      console.log('🚀 Sending chat request:', chatRequest);
      console.log('📍 Current location available:', !!currentLocation);

      const response = await apiService.sendChatMessage(chatRequest);

      if (response.success && response.data) {
        const aiResponseContent = response.data.response.content || response.data.response.message || "I'm sorry, I couldn't process your request.";
        const aiMessage: Message = {
          id: uuidv4(),
          sender: 'ai',
          content: aiResponseContent,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        console.error("Error from AI backend:", response.error);
        console.error("Full response:", response);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuidv4(),
            sender: 'ai',
            content: `I apologize, but I'm having trouble connecting right now. Please try again in a moment.`,
            timestamp: new Date()
          },
        ]);
      }
    } catch (error) {
      console.error("Network error:", error);
      console.error("Error details:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          sender: 'ai',
          content: `I apologize, but I seem to be having connection issues. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check that the backend server is running on http://localhost:8000 and try again.`,
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!sessionId) return;

    console.log("Attempting to delete chat session...");

    try {
      const response = await apiService.deleteChatSession(sessionId);

      if (response.success) {
        setSessionId('');
        setMessages([
          {
            id: uuidv4(),
            sender: 'ai',
            content: "🌟 Welcome back! I'm TravelBot, your AI travel companion. I'm ready to help you plan your next amazing adventure! Where would you like to explore today?",
            timestamp: new Date(),
          },
        ]);
        console.log("Chat session deleted successfully.");
      } else {
        console.error("Failed to delete chat session:", response.error);
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  return (
    <>
      <div className="enhanced-chat-container">
        {/* Ultra-Advanced Background Elements */}
        <div className="chat-background-elements">
          <div className="chat-floating-shape chat-shape-1"></div>
          <div className="chat-floating-shape chat-shape-2"></div>
          <div className="chat-floating-shape chat-shape-3"></div>
        </div>

        {/* Particle System */}
        <div className="chat-particles" ref={particlesRef}></div>

        <div className="chat-content">
          <div className="chat-page-container">
            <EnhancedChatHeader
              onNewChat={() => startNewSession(userId)}
              onDeleteChat={handleDeleteChat}
              locationStatus={locationStatus}
            />
            <EnhancedChatWindow messages={messages} />
            {isAITyping && <EnhancedTypingIndicator />}
            <EnhancedMessageInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </>
  );
};

const ChatPage = EnhancedChatPage;
export default ChatPage;