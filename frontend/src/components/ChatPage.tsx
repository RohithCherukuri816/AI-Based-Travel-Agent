import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiService from '../services/api';

// Ultra-Enhanced CSS with amazing animations and effects
const enhancedChatStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --warning-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  
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
  background: var(--dark-bg);
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(247, 37, 133, 0.12) 0%, transparent 60%),
    radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 60% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(1px);
}

/* Ultra-Advanced Background Elements */
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
  animation: float 8s ease-in-out infinite;
}

.chat-shape-1 { 
  width: 300px; 
  height: 300px; 
  top: 5%; 
  left: 3%; 
  animation-delay: 0s; 
  background: var(--primary-gradient);
}

.chat-shape-2 { 
  width: 200px; 
  height: 200px; 
  top: 65%; 
  right: 8%; 
  animation-delay: 3s; 
  background: var(--secondary-gradient);
}

.chat-shape-3 { 
  width: 150px; 
  height: 150px; 
  bottom: 15%; 
  left: 12%; 
  animation-delay: 6s; 
  background: var(--accent-gradient);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-30px) rotate(180deg) scale(1.1); }
}

/* Particle System */
.chat-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--accent-gradient);
  border-radius: 50%;
  opacity: 0;
  animation: particleFloat 15s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% {
    transform: translateY(-100px) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

/* Main Chat Container */
.chat-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Ultra-Enhanced Chat Card */
.chat-page-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 100%;
  max-width: 1000px;
  background: var(--card-bg);
  border-radius: 2.5rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(25px);
  box-shadow: 
    var(--shadow-card),
    var(--shadow-glow),
    0 0 60px rgba(102, 126, 234, 0.2);
  overflow: hidden;
  animation: slideUp 1s ease-out;
  position: relative;
}

.chat-page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    rgba(102, 126, 234, 0.03) 0%, 
    rgba(247, 37, 133, 0.03) 50%, 
    rgba(79, 172, 254, 0.03) 100%);
  pointer-events: none;
  z-index: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Ultra-Enhanced Chat Header */
.enhanced-chat-header {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.95), 
    rgba(118, 75, 162, 0.95),
    rgba(247, 37, 133, 0.95));
  color: white;
  padding: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.enhanced-chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.15), 
    transparent);
  transition: left 0.8s ease;
}

.enhanced-chat-header:hover::before {
  left: 100%;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.chat-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
  animation: pulse 3s ease-in-out infinite;
  position: relative;
}

.chat-avatar::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: var(--accent-gradient);
  opacity: 0.3;
  animation: ripple 2s ease-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.chat-header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
  to { text-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
}

.chat-header-text p {
  font-weight: 400;
  opacity: 0.9;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(16, 185, 129, 1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-gradient);
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.enhanced-header-actions {
  display: flex;
  gap: 1rem;
}

.enhanced-chat-btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  font-size: 0.95rem;
}

.enhanced-chat-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  transition: left 0.6s ease;
}

.enhanced-chat-btn:hover::before {
  left: 100%;
}

.new-chat-btn-enhanced {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.new-chat-btn-enhanced:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.delete-chat-btn-enhanced {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.delete-chat-btn-enhanced:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Ultra-Enhanced Chat Window */
.enhanced-chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: 
    radial-gradient(circle at 100% 100%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 0% 0%, rgba(247, 37, 133, 0.03) 0%, transparent 50%);
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.6) rgba(255, 255, 255, 0.1);
}

.enhanced-chat-window::-webkit-scrollbar {
  width: 8px;
}

.enhanced-chat-window::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.enhanced-chat-window::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.enhanced-chat-window::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* Ultra-Enhanced Message Bubbles */
.enhanced-message-bubble {
  max-width: 75%;
  padding: 1.5rem 2rem;
  border-radius: 2rem;
  animation: messageSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  line-height: 1.6;
  word-wrap: break-word;
  position: relative;
  backdrop-filter: blur(15px);
  border: 1px solid transparent;
  transition: all 0.4s ease;
}

.enhanced-message-bubble:hover {
  transform: translateY(-2px);
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9) rotateX(-10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

.enhanced-user-message {
  background: var(--primary-gradient);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0.8rem;
  box-shadow: 
    0 12px 30px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
}

.enhanced-user-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 50%);
  border-radius: inherit;
  pointer-events: none;
}

.enhanced-user-message:hover {
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.enhanced-ai-message {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  align-self: flex-start;
  border-bottom-left-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 12px 30px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
}

.enhanced-ai-message::before {
  content: '🤖';
  position: absolute;
  left: -50px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.9;
  transition: all 0.3s ease;
  animation: robotBounce 3s ease-in-out infinite;
}

@keyframes robotBounce {
  0%, 100% { transform: translateY(-50%) rotate(0deg); }
  25% { transform: translateY(-60%) rotate(5deg); }
  75% { transform: translateY(-40%) rotate(-5deg); }
}

.enhanced-ai-message:hover::before {
  transform: translateY(-50%) scale(1.2);
}

.enhanced-ai-message:hover {
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.message-text-content {
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
  z-index: 1;
}

.message-line {
  margin: 0.4rem 0;
  animation: textReveal 0.5s ease-out;
}

@keyframes textReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-line:first-child {
  margin-top: 0;
}

.message-line:last-child {
  margin-bottom: 0;
}

.message-timestamp {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 1rem;
  text-align: right;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

/* Ultra-Enhanced Input Area */
.enhanced-chat-input-container {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(25px);
  position: relative;
}

.enhanced-input-group {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 60px;
  padding: 0.8rem;
  backdrop-filter: blur(15px);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.enhanced-input-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(102, 126, 234, 0.1), 
    transparent);
  transition: left 0.8s ease;
}

.enhanced-input-group:focus-within {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  transform: translateY(-3px);
}

.enhanced-input-group:focus-within::before {
  left: 100%;
}

.enhanced-chat-input {
  flex-grow: 1;
  padding: 1.2rem 2rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1.1rem;
  outline: none;
  font-weight: 400;
}

.enhanced-chat-input::placeholder {
  color: var(--text-muted);
  font-weight: 300;
}

.enhanced-input-btn {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  position: relative;
  overflow: hidden;
}

.enhanced-input-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.mic-btn {
  background: var(--secondary-gradient);
  color: white;
}

.mic-btn:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 12px 25px rgba(247, 37, 133, 0.4);
}

.mic-btn:hover::before {
  background: rgba(255, 255, 255, 0.2);
}

.mic-btn.recording {
  background: var(--success-gradient);
  animation: pulse 1.5s infinite;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
}

.send-btn {
  background: var(--primary-gradient);
  color: white;
}

.send-btn:hover {
  transform: scale(1.15) rotate(-5deg);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.send-btn:hover::before {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Ultra-Enhanced Typing Indicator */
.enhanced-typing-indicator {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1.5rem 2.5rem;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 2rem;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  animation: typingSlideIn 0.5s ease-out;
}

@keyframes typingSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.typing-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  animation: avatarPulse 2s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.typing-dot {
  width: 12px;
  height: 12px;
  background: var(--accent-gradient);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.typing-dot:nth-child(2) { animation-delay: -0.32s; }
.typing-dot:nth-child(3) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% { 
    transform: scale(1.2);
    opacity: 1;
  }
}

.typing-text {
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

/* Scroll to Bottom Button */
.scroll-to-bottom-btn {
  position: absolute;
  bottom: 3rem;
  right: 3rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-gradient);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
  transition: all 0.4s ease;
  z-index: 10;
  opacity: 0;
  transform: translateY(30px) scale(0.8);
}

.scroll-to-bottom-btn.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.scroll-to-bottom-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.6);
}

/* New Message Indicator */
.new-message-indicator {
  position: absolute;
  bottom: 6rem;
  right: 3rem;
  background: var(--secondary-gradient);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(247, 37, 133, 0.4);
  transition: all 0.4s ease;
  z-index: 10;
  opacity: 0;
  transform: translateY(30px);
}

.new-message-indicator.visible {
  opacity: 1;
  transform: translateY(0);
}

.new-message-indicator:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(247, 37, 133, 0.6);
}

/* Message Highlight Animation */
@keyframes messageHighlight {
  0% {
    background-color: rgba(102, 126, 234, 0.1);
    transform: scale(1);
  }
  50% {
    background-color: rgba(102, 126, 234, 0.2);
    transform: scale(1.02);
  }
  100% {
    background-color: transparent;
    transform: scale(1);
  }
}

.message-highlight {
  animation: messageHighlight 2s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-content {
    padding: 1rem;
  }
  
  .chat-page-container {
    border-radius: 2rem;
    height: 95vh;
  }
  
  .enhanced-chat-header {
    padding: 2rem;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .chat-header-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .enhanced-header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .enhanced-message-bubble {
    max-width: 85%;
    padding: 1.2rem 1.5rem;
  }
  
  .enhanced-ai-message::before {
    left: -40px;
    font-size: 1.5rem;
  }
  
  .enhanced-chat-window {
    padding: 2rem;
  }
  
  .enhanced-chat-input-container {
    padding: 2rem;
  }
  
  .enhanced-input-group {
    gap: 1rem;
  }
  
  .enhanced-input-btn {
    width: 50px;
    height: 50px;
  }
  
  .scroll-to-bottom-btn {
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
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
    gap: 0.8rem;
  }
  
  .enhanced-chat-input {
    font-size: 1rem;
    padding: 1rem 1.5rem;
  }
}
`;

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
}> = ({ onNewChat, onDeleteChat }) => (
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
          className={`enhanced-input-btn mic-btn ${isListening ? 'recording' : ''}`}
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
  const [userId] = useState(() => `user_${Date.now()}`);
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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.log('Location access denied');
        }
      );
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
      <style>{enhancedChatStyles}</style>
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