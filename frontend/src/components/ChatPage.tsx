import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader'; // Import ChatHeader
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

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      sender: 'ai',
      content: "Hello! I'm TravelBot, your AI travel agent. How can I assist you today?",
    },
  ]);
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<Location | undefined>(undefined);
  const [isAITyping, setIsAITyping] = useState<boolean>(false); // State for AI typing indicator
  const chatWindowRef = useRef<HTMLDivElement>(null); // Ref for the chat window scroll container
  const [showBottomBar, setShowBottomBar] = useState<boolean>(true); // State to control bottom bar visibility

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
      startNewSession(userId);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    const chatWindowElement = chatWindowRef.current;
    if (chatWindowElement) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = chatWindowElement;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1; // Add a small buffer
        if (showBottomBar && !isAtBottom) {
          setShowBottomBar(false);
        } else if (!showBottomBar && isAtBottom) {
          setShowBottomBar(true);
        }
      };

      chatWindowElement.addEventListener('scroll', handleScroll);

      // Initial check on mount
      handleScroll();

      return () => {
        chatWindowElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [showBottomBar]); // Depend on showBottomBar to re-run effect when its value changes

  const startNewSession = async (currentUserId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/start_session?user_id=${currentUserId}`,
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
            content: "Hello! I'm TravelBot, your AI travel agent. How can I assist you today?",
          },
        ]);
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
    setIsAITyping(true); // Set AI to typing

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
        const aiMessage: Message = {
          id: uuidv4(),
          sender: 'ai',
          content: aiResponseContent,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
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
    } finally {
      setIsAITyping(false); // Reset AI typing indicator
    }
  };

  const handleDeleteChat = async () => {
    if (!sessionId) return;

    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete_session?session_id=${sessionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSessionId(''); // Clear session ID
          setMessages([
            {
              id: uuidv4(),
              sender: 'ai',
              content: "Hello! I'm TravelBot, your AI travel agent. How can I assist you today?",
            },
          ]); // Clear messages
          console.log("Chat session deleted successfully.");
        } else {
          const errorData = await response.json();
          console.error("Failed to delete chat session:", errorData.detail || response.statusText);
        }
      } catch (error) {
        console.error("Error deleting chat session:", error);
      }
    }
  };

  return (
    <div className="chat-page-content">
      <div className="chat-container">
        <ChatHeader onNewChat={() => startNewSession(userId)} onDeleteChat={handleDeleteChat} /> {/* Pass onDeleteChat prop */}
        <ChatWindow messages={messages} />{/* Pass ref to ChatWindow */}
        {isAITyping && (
          <div className="ai-typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
      </div>
        )}
        {showBottomBar && <MessageInput onSendMessage={handleSendMessage} />} {/* Conditionally render MessageInput */}
      </div>
    </div>
  );
};

export default ChatPage;
