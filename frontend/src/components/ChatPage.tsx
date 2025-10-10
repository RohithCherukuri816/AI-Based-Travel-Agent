import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';

// Enhanced CSS with animations and effects matching other pages
const enhancedChatStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  
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
  --shadow-message: 0 4px 16px rgba(0, 0, 0, 0.2);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--dark-bg);
  color: var(--text-primary);
  overflow-x: hidden;
}

.enhanced-chat-container {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(247, 37, 133, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.05) 0%, transparent 50%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Animated Background Elements */
.chat-background-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.chat-floating-shape {
  position: absolute;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.chat-shape-1 { width: 200px; height: 200px; top: 10%; left: 5%; animation-delay: 0s; }
.chat-shape-2 { width: 150px; height: 150px; top: 60%; right: 10%; animation-delay: 2s; }
.chat-shape-3 { width: 100px; height: 100px; bottom: 20%; left: 15%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Main Chat Card */
.chat-page-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 85vh;
  width: 100%;
  max-width: 900px;
  background: var(--card-bg);
  border-radius: 2rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  box-shadow: 
    var(--shadow-card),
    var(--shadow-glow);
  overflow: hidden;
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Chat Header */
.enhanced-chat-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.enhanced-chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.enhanced-chat-header:hover::before {
  left: 100%;
}

.chat-header-info h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chat-header-info p {
  font-weight: 400;
  opacity: 0.9;
  font-size: 0.95rem;
}

.enhanced-header-actions {
  display: flex;
  gap: 1rem;
}

.enhanced-chat-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.new-chat-btn-enhanced {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.new-chat-btn-enhanced:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.delete-chat-btn-enhanced {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.delete-chat-btn-enhanced:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2);
}

/* Enhanced Chat Window */
.enhanced-chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: 
    radial-gradient(circle at 100% 100%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 0% 0%, rgba(247, 37, 133, 0.05) 0%, transparent 50%);
}

.enhanced-chat-window::-webkit-scrollbar {
  width: 6px;
}

.enhanced-chat-window::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.enhanced-chat-window::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 3px;
}

/* Enhanced Message Bubbles */
.enhanced-message-bubble {
  max-width: 70%;
  padding: 1.2rem 1.8rem;
  border-radius: 1.5rem;
  animation: messageSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  line-height: 1.6;
  word-wrap: break-word;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.enhanced-user-message {
  background: var(--primary-gradient);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0.5rem;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.enhanced-ai-message {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  align-self: flex-start;
  border-bottom-left-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.enhanced-ai-message::before {
  content: '🤖';
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.8;
}

/* Enhanced Input Area */
.enhanced-chat-input-container {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
}

.enhanced-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.enhanced-input-group:focus-within {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.enhanced-chat-input {
  flex-grow: 1;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.enhanced-chat-input::placeholder {
  color: var(--text-muted);
}

.enhanced-input-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  position: relative;
  overflow: hidden;
}

.mic-btn {
  background: var(--secondary-gradient);
  color: white;
}

.mic-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(247, 37, 133, 0.4);
}

.mic-btn.recording {
  background: var(--success-gradient);
  animation: pulse 1.5s infinite;
}

.send-btn {
  background: var(--primary-gradient);
  color: white;
}

.send-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Enhanced Typing Indicator */
.enhanced-typing-indicator {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem 2rem;
  gap: 0.8rem;
}

.typing-dot {
  width: 12px;
  height: 12px;
  background: var(--accent-gradient);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.4);
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% { 
    transform: scale(1.2);
    opacity: 1;
  }
}

.typing-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Message Timestamp */
.message-timestamp {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.5rem;
  text-align: right;
}

/* Responsive Design */
@media (max-width: 768px) {
  .enhanced-chat-container {
    padding: 1rem;
    height: 90vh;
  }
  
  .chat-page-container {
    border-radius: 1.5rem;
  }
  
  .enhanced-chat-header {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .enhanced-header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .enhanced-message-bubble {
    max-width: 85%;
  }
  
  .enhanced-ai-message::before {
    left: -30px;
    font-size: 1.2rem;
  }
  
  .enhanced-chat-window {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .enhanced-chat-header h1 {
    font-size: 1.5rem;
  }
  
  .enhanced-message-bubble {
    max-width: 90%;
    padding: 1rem 1.2rem;
  }
  
  .enhanced-input-group {
    gap: 0.5rem;
  }
  
  .enhanced-input-btn {
    width: 45px;
    height: 45px;
  }
}
`;

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement;
  timestamp: Date;
  itinerary?: any;
  costBreakdown?: any;
  bookingConfirmation?: any;
}

interface Location {
  latitude: number;
  longitude: number;
}

// Enhanced ChatHeader Component
interface EnhancedChatHeaderProps {
  onNewChat: () => void;
  onDeleteChat: () => void;
}
const EnhancedChatHeader: React.FC<EnhancedChatHeaderProps> = ({ onNewChat, onDeleteChat }) => {
  return (
    <div className="enhanced-chat-header">
      <div className="chat-header-info">
        <h1>AI Travel Agent</h1>
        <p>Your intelligent assistant for travel planning</p>
      </div>
      <div className="enhanced-header-actions">
        <button className="enhanced-chat-btn new-chat-btn-enhanced" onClick={onNewChat}>
          <i className="fas fa-plus"></i>
          New Chat
        </button>
        <button className="enhanced-chat-btn delete-chat-btn-enhanced" onClick={onDeleteChat}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

// Enhanced ChatWindow Component
interface EnhancedChatWindowProps {
  messages: Message[];
}
const EnhancedChatWindow: React.FC<EnhancedChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderContent = (content: string | React.ReactElement) => {
    if (React.isValidElement(content)) {
      return content;
    }
    return <p>{content}</p>;
  };

  return (
    <div className="enhanced-chat-window">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`enhanced-message-bubble ${
            message.sender === 'user' ? 'enhanced-user-message' : 'enhanced-ai-message'
          }`}
        >
          {renderContent(message.content)}
          <div className="message-timestamp">
            {formatTime(message.timestamp)}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Enhanced MessageInput Component
interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
}
const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({ onSendMessage }) => {
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
    <div className="enhanced-chat-input-container">
      <form onSubmit={handleSubmit}>
        <div className="enhanced-input-group">
          <button 
            type="button" 
            onClick={toggleRecording} 
            className={`enhanced-input-btn mic-btn ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? <i className="fas fa-stop"></i> : <i className="fas fa-microphone"></i>}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening... Speak now" : "Ask about destinations, budgets, or travel plans..."}
            className="enhanced-chat-input"
            disabled={isRecording}
          />
          <button type="submit" className="enhanced-input-btn send-btn" disabled={!input.trim()}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

// Enhanced Typing Indicator
const EnhancedTypingIndicator: React.FC = () => {
  return (
    <div className="enhanced-typing-indicator">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <span className="typing-text">AI is thinking...</span>
    </div>
  );
};

// Main Enhanced ChatPage Component
const EnhancedChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      sender: 'ai',
      content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan trips, find destinations, calculate budgets, and create amazing travel experiences! Where would you like to go?",
      timestamp: new Date(),
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
      const response = await apiService.startChatSession(currentUserId);
      if (response.success && response.data) {
        setSessionId(response.data.session_id);
        setMessages([
          {
            id: uuidv4(),
            sender: 'ai',
            content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan trips, find destinations, calculate budgets, and create amazing travel experiences! Where would you like to go?",
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
        const aiMessage: Message = {
          id: uuidv4(),
          sender: 'ai',
          content: aiResponseContent,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } else {
        console.error("Error from AI backend:", response.error);
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          id: uuidv4(), 
          sender: 'ai', 
          content: 'I apologize, but I seem to be having connection issues. Please check your internet connection and try again.',
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
            content: "Hello! I'm TravelBot, your AI travel agent. I can help you plan trips, find destinations, calculate budgets, and create amazing travel experiences! Where would you like to go?",
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
      <style>{enhancedChatStyles}</style>
      <div className="enhanced-chat-container">
        {/* Animated Background */}
        <div className="chat-background-elements">
          <div className="chat-floating-shape chat-shape-1"></div>
          <div className="chat-floating-shape chat-shape-2"></div>
          <div className="chat-floating-shape chat-shape-3"></div>
        </div>

        <div className="chat-page-container">
          <EnhancedChatHeader 
            onNewChat={() => startNewSession(userId)} 
            onDeleteChat={handleDeleteChat} 
          />
          <EnhancedChatWindow messages={messages} />
          {isAITyping && <EnhancedTypingIndicator />}
          <EnhancedMessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </>
  );
};

const ChatPage = EnhancedChatPage;
export default ChatPage;