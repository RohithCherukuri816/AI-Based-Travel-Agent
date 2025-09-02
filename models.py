"""
AI Travel Planning Agent - Database Models
Comprehensive data models for all features
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, 
    ForeignKey, JSON, Enum as SQLEnum, Index, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from pydantic import BaseModel, Field, validator
import uuid

Base = declarative_base()


# Enums
class UserRole(str, Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"


class TripStatus(str, Enum):
    PLANNING = "planning"
    BOOKED = "booked"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"


# Database Models
class User(Base):
    """User model with authentication and profile information"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(String(500))
    phone_number = Column(String(20))
    date_of_birth = Column(DateTime)
    preferences = Column(JSON)  # Travel preferences, interests, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    trips = relationship("Trip", back_populates="owner")
    payments = relationship("Payment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    collaborations = relationship("Collaboration", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    analytics = relationship("UserAnalytics", back_populates="user")
    
    __table_args__ = (
        Index('idx_users_email', 'email'),
        Index('idx_users_username', 'username'),
        Index('idx_users_role', 'role'),
    )


class Trip(Base):
    """Trip model representing a complete travel plan"""
    __tablename__ = "trips"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    destination = Column(String(200), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # in days
    budget = Column(Float, nullable=False)
    actual_cost = Column(Float, default=0.0)
    status = Column(SQLEnum(TripStatus), default=TripStatus.PLANNING)
    travel_style = Column(String(50))  # luxury, budget, adventure, etc.
    travelers_count = Column(Integer, default=1)
    is_public = Column(Boolean, default=False)
    tags = Column(ARRAY(String))
    trip_metadata = Column(JSON)  # Additional trip data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="trips")
    itinerary = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="trip", cascade="all, delete-orphan")
    collaborations = relationship("Collaboration", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="trip", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_trips_owner', 'owner_id'),
        Index('idx_trips_destination', 'destination'),
        Index('idx_trips_status', 'status'),
        Index('idx_trips_dates', 'start_date', 'end_date'),
    )


class ItineraryDay(Base):
    """Daily itinerary for a trip"""
    __tablename__ = "itinerary_days"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    weather_forecast = Column(JSON)
    activities = Column(JSON)  # Structured activity data
    notes = Column(Text)
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="itinerary")
    
    __table_args__ = (
        Index('idx_itinerary_trip', 'trip_id'),
        Index('idx_itinerary_date', 'date'),
        UniqueConstraint('trip_id', 'day_number', name='uq_trip_day'),
    )


class Booking(Base):
    """Flight, hotel, and activity bookings"""
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    booking_type = Column(String(50), nullable=False)  # flight, hotel, activity, transport
    provider = Column(String(100), nullable=False)  # airline, hotel chain, etc.
    booking_reference = Column(String(100), unique=True)
    confirmation_number = Column(String(100))
    status = Column(String(50), default="confirmed")  # confirmed, pending, cancelled
    booking_date = Column(DateTime, nullable=False)
    travel_date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    details = Column(JSON)  # Booking-specific details
    cancellation_policy = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="bookings")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_bookings_trip', 'trip_id'),
        Index('idx_bookings_user', 'user_id'),
        Index('idx_bookings_type', 'booking_type'),
        Index('idx_bookings_date', 'travel_date'),
    )


class Payment(Base):
    """Payment transactions"""
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    payment_method = Column(String(50), nullable=False)  # stripe, paypal, etc.
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String(100), unique=True)
    gateway_response = Column(JSON)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    trip = relationship("Trip")
    
    __table_args__ = (
        Index('idx_payments_user', 'user_id'),
        Index('idx_payments_trip', 'trip_id'),
        Index('idx_payments_status', 'payment_status'),
        Index('idx_payments_method', 'payment_method'),
    )


class Collaboration(Base):
    """Collaborative trip planning"""
    __tablename__ = "collaborations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="collaborator")  # owner, collaborator, viewer
    permissions = Column(ARRAY(String))  # edit, view, book, etc.
    joined_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    trip = relationship("Trip", back_populates="collaborations")
    user = relationship("User", back_populates="collaborations")
    
    __table_args__ = (
        Index('idx_collaborations_trip', 'trip_id'),
        Index('idx_collaborations_user', 'user_id'),
        UniqueConstraint('trip_id', 'user_id', name='uq_trip_user'),
    )


class Expense(Base):
    """Trip expenses tracking"""
    __tablename__ = "expenses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)  # accommodation, food, transport, etc.
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    description = Column(Text)
    date = Column(DateTime, nullable=False)
    receipt_url = Column(String(500))
    is_shared = Column(Boolean, default=False)
    shared_with = Column(ARRAY(UUID(as_uuid=True)))  # User IDs to split with
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="expenses")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_expenses_trip', 'trip_id'),
        Index('idx_expenses_user', 'user_id'),
        Index('idx_expenses_category', 'category'),
        Index('idx_expenses_date', 'date'),
    )


class Review(Base):
    """Trip and destination reviews"""
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    destination = Column(String(200), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(200))
    content = Column(Text)
    photos = Column(ARRAY(String))  # Photo URLs
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    
    __table_args__ = (
        Index('idx_reviews_trip', 'trip_id'),
        Index('idx_reviews_user', 'user_id'),
        Index('idx_reviews_destination', 'destination'),
        Index('idx_reviews_rating', 'rating'),
    )


class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    data = Column(JSON)  # Additional notification data
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    __table_args__ = (
        Index('idx_notifications_user', 'user_id'),
        Index('idx_notifications_type', 'type'),
        Index('idx_notifications_read', 'is_read'),
        Index('idx_notifications_scheduled', 'scheduled_at'),
    )


class UserAnalytics(Base):
    """User behavior and analytics data"""
    __tablename__ = "user_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # page_view, search, booking, etc.
    event_data = Column(JSON)
    session_id = Column(String(100))
    user_agent = Column(Text)
    ip_address = Column(String(45))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="analytics")
    
    __table_args__ = (
        Index('idx_analytics_user', 'user_id'),
        Index('idx_analytics_event', 'event_type'),
        Index('idx_analytics_timestamp', 'timestamp'),
        Index('idx_analytics_session', 'session_id'),
    )


class ChatSession(Base):
    """AI chat sessions for travel planning"""
    __tablename__ = "chat_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"))
    session_title = Column(String(200))
    ai_model = Column(String(100))
    context = Column(JSON)  # Chat context and user preferences
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    trip = relationship("Trip")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_chat_user', 'user_id'),
        Index('idx_chat_trip', 'trip_id'),
        Index('idx_chat_active', 'is_active'),
    )


class ChatMessage(Base):
    """Individual chat messages"""
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    trip_metadata = Column(JSON)  # Message metadata, tokens, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")
    
    __table_args__ = (
        Index('idx_messages_session', 'session_id'),
        Index('idx_messages_role', 'role'),
        Index('idx_messages_timestamp', 'created_at'),
    )


# Pydantic Models for API
class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    username: str = Field(..., description="Unique username")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User password")


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    profile_picture: Optional[str] = None


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TripBase(BaseModel):
    title: str = Field(..., description="Trip title")
    description: Optional[str] = None
    destination: str = Field(..., description="Trip destination")
    start_date: datetime = Field(..., description="Trip start date")
    end_date: datetime = Field(..., description="Trip end date")
    budget: float = Field(..., gt=0, description="Trip budget")
    travel_style: Optional[str] = None
    travelers_count: int = Field(1, ge=1, le=50, description="Number of travelers")
    is_public: bool = False
    tags: Optional[List[str]] = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    travel_style: Optional[str] = None
    travelers_count: Optional[int] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None


class TripResponse(TripBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    duration: int
    actual_cost: float
    status: TripStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ItineraryDayBase(BaseModel):
    day_number: int = Field(..., ge=1, description="Day number in trip")
    date: datetime
    activities: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    estimated_cost: float = 0.0


class ItineraryDayCreate(ItineraryDayBase):
    pass


class ItineraryDayResponse(ItineraryDayBase):
    id: uuid.UUID
    trip_id: uuid.UUID
    weather_forecast: Optional[Dict[str, Any]] = None
    actual_cost: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BookingBase(BaseModel):
    booking_type: str = Field(..., description="Type of booking")
    provider: str = Field(..., description="Service provider")
    booking_date: datetime
    travel_date: datetime
    price: float = Field(..., gt=0)
    currency: str = "USD"
    details: Optional[Dict[str, Any]] = None


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: uuid.UUID
    trip_id: uuid.UUID
    user_id: uuid.UUID
    booking_reference: Optional[str] = None
    confirmation_number: Optional[str] = None
    status: str
    cancellation_policy: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    payment_method: str = Field(..., description="Payment method")
    description: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: uuid.UUID
    user_id: uuid.UUID
    trip_id: Optional[uuid.UUID] = None
    payment_status: PaymentStatus
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CollaborationBase(BaseModel):
    role: str = "collaborator"
    permissions: Optional[List[str]] = None


class CollaborationCreate(CollaborationBase):
    pass


class CollaborationResponse(CollaborationBase):
    id: uuid.UUID
    trip_id: uuid.UUID
    user_id: uuid.UUID
    joined_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


class ChatMessageBase(BaseModel):
    content: str = Field(..., description="Message content")
    role: str = Field(..., description="Message role")


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageResponse(ChatMessageBase):
    id: uuid.UUID
    session_id: uuid.UUID
    trip_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Utility functions
def calculate_trip_duration(start_date: datetime, end_date: datetime) -> int:
    """Calculate trip duration in days"""
    return (end_date - start_date).days + 1


def validate_trip_dates(start_date: datetime, end_date: datetime) -> bool:
    """Validate trip dates"""
    if start_date >= end_date:
        return False
    if start_date < datetime.utcnow():
        return False
    return True


def calculate_budget_per_person(total_budget: float, travelers: int) -> float:
    """Calculate budget per person"""
    return total_budget / travelers if travelers > 0 else 0.0
