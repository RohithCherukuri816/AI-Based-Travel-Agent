import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Inline CSS for the entire app to ensure a cohesive look
const pageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #6a0dad;
  --primary-light: #9d4edd;
  --text-color: #333333;
  --background-color: #f0f4f8;
  --card-bg: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --border-color: #e0e0e0;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.chat-page-container {
  display: flex;
  flex-direction: column;
  height: 85vh;
  width: 100%;
  max-width: 900px;
  background: var(--card-bg);
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  margin: 2rem auto;
}

.chat-header {
  background: linear-gradient(to right, #6a0dad, #9d4edd);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header-info {
  display: flex;
  flex-direction: column;
}
.chat-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
}
.chat-header p {
  font-weight: 400;
  opacity: 0.8;
  font-size: 0.9rem;
}
.new-chat-btn {
  background: white;
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}
.new-chat-btn:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.chat-window::-webkit-scrollbar {
  display: none;
}

.message-bubble {
  max-width: 85%;
  padding: 1rem 1.5rem;
  border-radius: 1.25rem;
  animation: fadeIn 0.5s ease-out;
  line-height: 1.6;
  word-wrap: break-word;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  background: var(--primary-color);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0.5rem;
}
.ai-message {
  background: #f8fafc;
  color: var(--text-color);
  align-self: flex-start;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-bottom-left-radius: 0.5rem;
}

.chat-input-container {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  align-items: center;
}
.chat-input {
  flex-grow: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #ddd;
  border-radius: 9999px;
  font-size: 1rem;
  transition: all 0.3s;
}
.chat-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(106, 13, 173, 0.2);
}
.chat-input-btn {
  background: var(--primary-color);
  color: white;
  border-radius: 9999px;
  width: 50px;
  height: 50px;
  font-size: 1.2rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-input-btn:hover {
  background: var(--primary-light);
  transform: scale(1.05);
}
.ai-typing-indicator {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 1.5rem 1.5rem;
  gap: 0.5rem;
}
.ai-typing-indicator .dot {
  width: 10px;
  height: 10px;
  background-color: #c0c0c0;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.ai-typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.ai-typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
`;

const API_BASE_URL = 'http://localhost:8000';

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

// ChatHeader component integrated into this file
interface ChatHeaderProps {
  onNewChat: () => void;
  onDeleteChat: () => void;
}
const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onDeleteChat }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <h1>AI Travel Agent Chat</h1>
        <p>Your intelligent assistant for travel planning</p>
      </div>
      <div className="flex gap-2">
        <button className="new-chat-btn" onClick={onNewChat}>
          <i className="fas fa-plus"></i> New Chat
        </button>
        <button className="new-chat-btn" onClick={onDeleteChat}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

// ChatWindow component integrated into this file
interface ChatWindowProps {
  messages: Message[];
}
const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderContent = (content: string | React.ReactElement) => {
    if (React.isValidElement(content)) {
      return content;
    }
    return <p>{content}</p>;
  };

  return (
    <div className="chat-window">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
        >
          {renderContent(message.content)}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// MessageInput component integrated into this file
interface MessageInputProps {
  onSendMessage: (message: string) => void;
}
const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        setInput('');
        recognitionRef.current.start();
      }
      setIsRecording(!isRecording);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <button type="button" onClick={toggleRecording} className="chat-input-btn">
        {isRecording ? <i className="fas fa-stop-circle"></i> : <i className="fas fa-microphone"></i>}
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isRecording ? "Listening..." : "Type your message..."}
        className="chat-input"
      />
      <button type="submit" className="chat-input-btn">
        <i className="fas fa-paper-plane"></i>
      </button>
    </form>
  );
};

// Main ChatPage component
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
  const [isAITyping, setIsAITyping] = useState<boolean>(false);

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
        setMessages([
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
    setIsAITyping(true);

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
      setIsAITyping(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!sessionId) return;
    
    // Using console.log instead of window.confirm
    console.log("Attempting to delete chat session...");

    try {
      const response = await fetch(`${API_BASE_URL}/delete_session?session_id=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessionId('');
        setMessages([
          {
            id: uuidv4(),
            sender: 'ai',
            content: "Hello! I'm TravelBot, your AI travel agent. How can I assist you today?",
          },
        ]);
        console.log("Chat session deleted successfully.");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete chat session:", errorData.detail || response.statusText);
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };
  
  return (
    <>
      <style>{pageStyles}</style>
      <div className="chat-page-container">
        <ChatHeader onNewChat={() => startNewSession(userId)} onDeleteChat={handleDeleteChat} />
        <ChatWindow messages={messages} />
        {isAITyping && (
          <div className="ai-typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </>
  );
};

export default ChatPage;
