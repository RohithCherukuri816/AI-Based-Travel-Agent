import React from 'react';
import '../App.css';

interface ChatHeaderProps {
  onNewChat: () => void;
  onDeleteChat: () => void; // Add onDeleteChat prop
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onDeleteChat }) => {
  return (
    <div className="chat-header">
      <h2>AI Travel Agent Chat</h2>
      <p>Your intelligent assistant for travel planning.</p>
      <div> {/* Group buttons together for better alignment */}
        <button className="new-chat-button" onClick={onNewChat}>New Chat</button>
        <button className="delete-chat-button" onClick={onDeleteChat}>Delete Chat</button> {/* Add Delete Chat button */}
      </div>
    </div>
  );
};

export default ChatHeader;
