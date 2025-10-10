import React, { useEffect, useRef, useState } from 'react';

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
      <style>{`
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
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: rgba(102, 126, 234, 0.6) rgba(255, 255, 255, 0.1);
        }

        .enhanced-chat-window::-webkit-scrollbar {
          width: 8px;
        }

        .enhanced-chat-window::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .enhanced-chat-window::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
        }

        .enhanced-chat-window::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .enhanced-message-bubble {
          max-width: 75%;
          padding: 1.2rem 1.8rem;
          border-radius: 1.5rem;
          animation: messageSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          line-height: 1.6;
          word-wrap: break-word;
          position: relative;
          backdrop-filter: blur(10px);
          border: 1px solid transparent;
          transition: all 0.3s ease;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 0.5rem;
          box-shadow: 
            0 8px 25px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .enhanced-user-message:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 30px rgba(102, 126, 234, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .enhanced-ai-message {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          align-self: flex-start;
          border-bottom-left-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .enhanced-ai-message:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 30px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .enhanced-ai-message::before {
          content: '🤖';
          position: absolute;
          left: -45px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .enhanced-ai-message:hover::before {
          transform: translateY(-50%) scale(1.1);
        }

        .message-text-content {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-line {
          margin: 0.3rem 0;
        }

        .message-line:first-child {
          margin-top: 0;
        }

        .message-line:last-child {
          margin-bottom: 0;
        }

        .message-timestamp {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 0.8rem;
          text-align: right;
          font-weight: 400;
        }

        .scroll-to-bottom-btn {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          z-index: 10;
          opacity: 0;
          transform: translateY(20px);
        }

        .scroll-to-bottom-btn.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .scroll-to-bottom-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
        }

        .scroll-to-bottom-btn:active {
          transform: translateY(0) scale(0.95);
        }

        .new-message-indicator {
          position: absolute;
          bottom: 5rem;
          right: 2rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(247, 37, 133, 0.4);
          transition: all 0.3s ease;
          z-index: 10;
          opacity: 0;
          transform: translateY(20px);
        }

        .new-message-indicator.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .new-message-indicator:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(247, 37, 133, 0.6);
        }

        /* Loading animation for new messages */
        @keyframes messageHighlight {
          0% {
            background-color: rgba(102, 126, 234, 0.1);
          }
          100% {
            background-color: transparent;
          }
        }

        .message-highlight {
          animation: messageHighlight 2s ease-out;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .enhanced-chat-window {
            padding: 1.5rem;
          }
          
          .enhanced-message-bubble {
            max-width: 85%;
            padding: 1rem 1.2rem;
          }
          
          .enhanced-ai-message::before {
            left: -35px;
            font-size: 1.2rem;
          }
          
          .scroll-to-bottom-btn {
            bottom: 1rem;
            right: 1rem;
            width: 45px;
            height: 45px;
          }
          
          .new-message-indicator {
            bottom: 4rem;
            right: 1rem;
          }
        }

        @media (max-width: 480px) {
          .enhanced-chat-window {
            padding: 1rem;
          }
          
          .enhanced-message-bubble {
            max-width: 90%;
          }
          
          .enhanced-ai-message::before {
            left: -30px;
            font-size: 1rem;
          }
        }
      `}</style>

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