"""
AI Travel Planning Agent - Simplified Database Models
Basic data models for core functionality
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
import uuid
import json

from database import Base

# Enums
class UserRole(str, Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"

class TripStatus(str, Enum):
    PLANNING = "planning"
    BOOKED = "booked"
    COMPLETED = "completed"

# Database Models
class User(Base):
    """Simplified User model"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class Trip(Base):
    """Simplified Trip model"""
    __tablename__ = "trips"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    destination = Column(String(255), nullable=False)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    budget = Column(Float)
    status = Column(String(20), default="planning")
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    """Simplified Chat Session model"""
    __tablename__ = "chat_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    trip_id = Column(String(36), ForeignKey("trips.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    """Simplified Chat Message model"""
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    sender = Column(String(10))  # 'user' or 'ai'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic models for API
class UserCreate(BaseModel):
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class TripCreate(BaseModel):
    destination: str
    start_date: datetime
    end_date: datetime
    budget: float

class ChatMessageCreate(BaseModel):
    content: str
    sender: str