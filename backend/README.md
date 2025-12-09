# AI Travel Agent - Backend

FastAPI-based backend service for the AI Travel Planning Agent with multi-agent system capabilities.

## Features

- **Multi-Agent Travel Planning**: Intelligent itinerary generation using specialized agents
- **Real-time API Integration**: Weather, activities, flights, and hotels data
- **AI-Powered Chat**: Interactive travel assistant with context awareness
- **Analytics Dashboard**: Travel trends and user behavior insights
- **Payment Processing**: Secure booking and payment handling

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp ../.env.example ../.env
   ```

3. **Run the Server**:
   ```bash
   python run.py
   ```

4. **Access the API**:
   - API Server: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Real-time Status: http://localhost:8000/api/realtime-status

## Project Structure

```
backend/
├── app.py                 # Main FastAPI application
├── run.py                 # Startup script
├── ai_chat.py            # AI chat system
├── analytics_dashboard.py # Analytics and metrics
├── database.py           # Database operations
├── models.py             # Data models
├── payment_system.py     # Payment processing
├── real_api_config.py    # Real-time API integrations
├── data/                 # Mock data files
├── myenv/                # Virtual environment
└── requirements.txt      # Python dependencies
```

## API Endpoints

### Core Travel Planning
- `POST /api/plan` - Generate travel itinerary
- `GET /api/destinations` - Get available destinations
- `GET /api/places/search` - Search destinations

### Real-time Data
- `POST /api/realtime/weather` - Get weather data
- `POST /api/realtime/activities` - Get activities
- `POST /api/realtime/flights` - Get flight options
- `POST /api/realtime/hotels` - Get hotel options

### Chat System
- `POST /api/chat/message` - Send chat message
- `POST /api/chat/session` - Create chat session
- `GET /api/chat/history/{user_id}` - Get chat history

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/realtime` - Real-time metrics

## Environment Variables

Required API keys for full functionality:
- `GOOGLE_PLACES_API_KEY` - Google Places API
- `OPENWEATHER_API_KEY` - OpenWeather API
- `GOOGLE_AI_API_KEY` - Google Gemini AI API

## Development

The backend uses:
- **FastAPI** for the web framework
- **Pydantic** for data validation
- **SQLite** for local database
- **LangGraph** for multi-agent workflows (optional)
- **Google APIs** for real-time data

## Testing

Run the health check:
```bash
curl http://localhost:8000/api/health
```

Check API connectivity:
```bash
curl http://localhost:8000/api/test-connectivity
```