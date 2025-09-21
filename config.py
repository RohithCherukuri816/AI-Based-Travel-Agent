"""
AI Travel Planning Agent - Configuration Management
Centralized configuration for all features and integrations
"""

import os
from typing import Optional, List
from enum import Enum
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from dotenv import load_dotenv
load_dotenv()

class EnvironmentEnum(str, Enum):
    development = "development"
    test = "test"
    staging = "staging"
    production = "production"

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "AI Travel Planning Agent"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: EnvironmentEnum = Field(
        default=EnvironmentEnum.development, env="ENVIRONMENT"
    )

    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    WORKERS: int = Field(default=1, env="WORKERS")

    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://user:password@localhost/travel_agent",
        env="DATABASE_URL",
    )
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")

    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_SECRET: Optional[str] = Field(default=None, env="JWT_SECRET")

    GOOGLE_AI_API_KEY: Optional[str] = Field(default=None, env="GOOGLE_AI_API_KEY")

    OPENWEATHER_API_KEY: Optional[str] = Field(default=None, env="OPENWEATHER_API_KEY")
    GOOGLE_PLACES_API_KEY: Optional[str] = Field(default=None, env="GOOGLE_PLACES_API_KEY")
    AMADEUS_CLIENT_ID: Optional[str] = Field(default=None, env="AMADEUS_CLIENT_ID")
    AMADEUS_CLIENT_SECRET: Optional[str] = Field(default=None, env="AMADEUS_CLIENT_SECRET")
    BOOKING_API_KEY: Optional[str] = Field(default=None, env="BOOKING_API_KEY")
    EVENTBRITE_API_KEY: Optional[str] = Field(default=None, env="EVENTBRITE_API_KEY")
    WIKIPEDIA_BASE_URL: str = Field(default="https://en.wikipedia.org/api/rest_v1/", env="WIKIPEDIA_BASE_URL")

    STRIPE_SECRET_KEY: Optional[str] = Field(default=None, env="STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY: Optional[str] = Field(default=None, env="STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(default=None, env="STRIPE_WEBHOOK_SECRET")
    PAYPAL_CLIENT_ID: Optional[str] = Field(default=None, env="PAYPAL_CLIENT_ID")
    PAYPAL_CLIENT_SECRET: Optional[str] = Field(default=None, env="PAYPAL_CLIENT_SECRET")

    SENDGRID_API_KEY: Optional[str] = Field(default=None, env="SENDGRID_API_KEY")
    TWILIO_ACCOUNT_SID: Optional[str] = Field(default=None, env="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: Optional[str] = Field(default=None, env="TWILIO_AUTH_TOKEN")

    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    S3_BUCKET: Optional[str] = Field(default=None, env="S3_BUCKET")

    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    PROMETHEUS_PORT: int = Field(default=9090, env="PROMETHEUS_PORT")

    ENABLE_CHAT_AI: bool = Field(default=True, env="ENABLE_CHAT_AI")
    ENABLE_AI_CHAT: bool = Field(default=True, env="ENABLE_AI_CHAT")
    ENABLE_REAL_APIS: bool = Field(default=True, env="ENABLE_REAL_APIS")
    ENABLE_PAYMENTS: bool = Field(default=True, env="ENABLE_PAYMENTS")
    ENABLE_COLLABORATION: bool = Field(default=True, env="ENABLE_COLLABORATION")
    ENABLE_ANALYTICS: bool = Field(default=True, env="ENABLE_ANALYTICS")
    ENABLE_WEBSOCKETS: bool = Field(default=False, env="ENABLE_WEBSOCKETS")

    RATE_LIMIT_PER_MINUTE: int = Field(default=100, env="RATE_LIMIT_PER_MINUTE")
    RATE_LIMIT_PER_HOUR: int = Field(default=1000, env="RATE_LIMIT_PER_HOUR")

    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")
    CACHE_MAX_SIZE: int = Field(default=1000, env="CACHE_MAX_SIZE")

    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["image/jpeg", "image/png", "image/gif", "application/pdf"],
        env="ALLOWED_FILE_TYPES",
    )
    CORS_ORIGINS: Optional[str] = Field(default=None, env="CORS_ORIGINS")

    @field_validator("ALLOWED_FILE_TYPES", mode="before")
    def parse_csv(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(",")]
        return v

    AI_PROVIDER: str = Field(default="google", env="AI_PROVIDER")
    AI_MODEL_NAME: str = Field(default="gemini-1.5-flash", env="AI_MODEL_NAME")
    AI_MAX_TOKENS: int = Field(default=4000, env="AI_MAX_TOKENS")
    AI_TEMPERATURE: float = Field(default=0.7, env="AI_TEMPERATURE")

    MAX_TRIP_DURATION: int = Field(default=90, env="MAX_TRIP_DURATION")
    MAX_TRAVELERS: int = Field(default=20, env="MAX_TRAVELERS")
    MIN_BUDGET: float = Field(default=100, env="MIN_BUDGET")
    MAX_BUDGET: float = Field(default=100000, env="MAX_BUDGET")

    ENABLE_EMAIL_NOTIFICATIONS: bool = Field(default=True, env="ENABLE_EMAIL_NOTIFICATIONS")
    ENABLE_SMS_NOTIFICATIONS: bool = Field(default=False, env="ENABLE_SMS_NOTIFICATIONS")
    ENABLE_PUSH_NOTIFICATIONS: bool = Field(default=True, env="ENABLE_PUSH_NOTIFICATIONS")

settings = Settings()

def is_feature_enabled(feature: str) -> bool:
    """Check if a specific feature is enabled"""
    feature_map = {
        "chat_ai": settings.ENABLE_CHAT_AI or settings.ENABLE_AI_CHAT,
        "real_apis": settings.ENABLE_REAL_APIS,
        "payments": settings.ENABLE_PAYMENTS,
        "collaboration": settings.ENABLE_COLLABORATION,
        "analytics": settings.ENABLE_ANALYTICS,
    }
    return feature_map.get(feature, False)

def get_api_config() -> dict:
    """Get API configuration for external services"""
    return {
        "openweather": {
            "api_key": settings.OPENWEATHER_API_KEY,
            "base_url": "https://api.openweathermap.org/data/2.5",
            "enabled": bool(settings.OPENWEATHER_API_KEY),
        },
        "google_places": {
            "api_key": settings.GOOGLE_PLACES_API_KEY,
            "base_url": "https://maps.googleapis.com/maps/api/place",
            "enabled": bool(settings.GOOGLE_PLACES_API_KEY),
        },
        "amadeus": {
            "client_id": settings.AMADEUS_CLIENT_ID,
            "client_secret": settings.AMADEUS_CLIENT_SECRET,
            "base_url": "https://test.api.amadeus.com/v1",
            "enabled": bool(settings.AMADEUS_CLIENT_ID and settings.AMADEUS_CLIENT_SECRET),
        },
        "booking": {
            "api_key": settings.BOOKING_API_KEY,
            "base_url": "https://booking-com.p.rapidapi.com/v1",
            "enabled": bool(settings.BOOKING_API_KEY),
        },
        "eventbrite": {
            "api_key": settings.EVENTBRITE_API_KEY,
            "base_url": "https://www.eventbriteapi.com/v3",
            "enabled": bool(settings.EVENTBRITE_API_KEY),
        },
        "wikipedia": {
            "base_url": settings.WIKIPEDIA_BASE_URL,
            "enabled": True, # Wikipedia API usually doesn't require a key for basic access
        },
    }

def get_payment_config() -> dict:
    """Get payment configuration"""
    return {
        "stripe": {
            "secret_key": settings.STRIPE_SECRET_KEY,
            "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
            "enabled": bool(settings.STRIPE_SECRET_KEY),
        },
        "paypal": {
            "client_id": settings.PAYPAL_CLIENT_ID,
            "client_secret": settings.PAYPAL_CLIENT_SECRET,
            "enabled": bool(settings.PAYPAL_CLIENT_ID),
        },
    }

def get_ai_config() -> dict:
    """Get AI service configuration (Google is default)"""
    return {
        "google": {
            "api_key": settings.GOOGLE_AI_API_KEY,
            "model": settings.AI_MODEL_NAME,
            "max_tokens": settings.AI_MAX_TOKENS,
            "temperature": settings.AI_TEMPERATURE,
            "enabled": bool(settings.GOOGLE_AI_API_KEY),
        },
    }

def get_database_url() -> str:
    """Get database URL based on environment"""
    if settings.ENVIRONMENT == EnvironmentEnum.test:
        return "sqlite:///./test.db"
    return settings.DATABASE_URL

def get_cors_origins() -> List[str]:
    """Get CORS origins based on environment"""
    if settings.CORS_ORIGINS:
        return [x.strip() for x in settings.CORS_ORIGINS.split(",") if x.strip()]
    if settings.ENVIRONMENT == EnvironmentEnum.development:
        return [
            "http://localhost:3000",
            "http://localhost:8001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8001",
        ]
    elif settings.ENVIRONMENT == EnvironmentEnum.production:
        return [
            "https://yourdomain.com",
            "https://www.yourdomain.com",
        ]
    elif settings.ENVIRONMENT == EnvironmentEnum.staging:
        return ["https://staging.yourdomain.com"]
    return ["*"]

def validate_config() -> bool:
    """Validate critical configuration"""
    required_keys = ["SECRET_KEY", "DATABASE_URL", "REDIS_URL"]

    for key in required_keys:
        if not getattr(settings, key):
            print(f"❌ Missing required configuration: {key}")
            return False

    if settings.ENABLE_CHAT_AI and not settings.GOOGLE_AI_API_KEY:
        print("⚠️ Chat AI enabled but GOOGLE_AI_API_KEY missing")
    if settings.ENABLE_PAYMENTS and not settings.STRIPE_SECRET_KEY:
        print("⚠️ Payments enabled but STRIPE_SECRET_KEY missing")

    print("✅ Configuration validation passed")
    return True

if __name__ == "__main__":
    print("🔧 AI Travel Planning Agent Configuration")
    print("=" * 50)
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug: {settings.DEBUG}")
    print(f"Host: {settings.HOST}:{settings.PORT}")
    print(f"Database: {get_database_url()}")
    print(f"Redis: {settings.REDIS_URL}")
    print("Features Enabled:")
    for feature in ["chat_ai", "real_apis", "payments", "collaboration", "analytics"]:
        print(f"  - {feature}: {is_feature_enabled(feature)}")
    validate_config()