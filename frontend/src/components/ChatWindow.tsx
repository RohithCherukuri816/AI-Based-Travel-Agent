import React, { useEffect, useRef, useState } from 'react';
import './ChatWindow.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement;
  itinerary?: any;
  costBreakdown?: any;
  bookingConfirmation?: any;
  timestamp?: Date;
}

interface ChatWindowProps {
  messages: Message[];
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onScrollToTop, onScrollToBottom }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Enhanced scroll handling
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, autoScrollEnabled]);

  // Check scroll position
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show scroll to bottom button if not at bottom
    setShowScrollToBottom(scrollBottom > 100);
    
    // Check if we're at the bottom
    const atBottom = scrollBottom <= 50;
    setIsAtBottom(atBottom);
    
    // Enable auto-scroll if user scrolls to bottom
    if (atBottom) {
      setAutoScrollEnabled(true);
    }
  };

  // Scroll to bottom manually
  const scrollToBottom = () => {
    setAutoScrollEnabled(true);
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
    onScrollToBottom?.();
  };

  // Scroll to top
  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    onScrollToTop?.();
  };

  // Enhanced message content rendering
  const renderMessageContent = (content: string | React.ReactElement) => {
    if (React.isValidElement(content)) {
      return content;
    }
    
    // Format plain text with better styling
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

  // Format timestamp
  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      <div 
        className="enhanced-chat-window"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`enhanced-message-bubble ${
              message.sender === 'user' ? 'enhanced-user-message' : 'enhanced-ai-message'
            } ${index === messages.length - 1 ? 'message-highlight' : ''}`}
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
        
        {/* Scroll to bottom button */}
        <button
          className={`scroll-to-bottom-btn ${showScrollToBottom ? 'visible' : ''}`}
          onClick={scrollToBottom}
          title="Scroll to bottom"
        >
          <i className="fas fa-chevron-down"></i>
        </button>

        {/* New message indicator */}
        {showScrollToBottom && !isAtBottom && (
          <div 
            className="new-message-indicator visible"
            onClick={scrollToBottom}
          >
            New messages ↓
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWindow;