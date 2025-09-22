import React from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | React.ReactElement; // Allow content to be a string or a React.ReactElement
}

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="chat-window">
      {messages.map((message) => (
        <div key={message.id} className={`chat-message ${message.sender}`}>
          <div className="message-content">{message.content}</div>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
