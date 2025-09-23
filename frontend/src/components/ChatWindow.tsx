import React, { useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement; // Allow content to be a string or a React.ReactElement
  // Optional fields for structured content
  itinerary?: any;
  costBreakdown?: any;
  bookingConfirmation?: any;
}

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div key={message.id} className={`chat-message ${message.sender}`}>
          <div className="message-content">{message.content}</div>
        </div>
      ))}
      {/* This invisible div acts as the scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
