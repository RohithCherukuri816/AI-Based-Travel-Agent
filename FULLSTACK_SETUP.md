# 🚀 Full-Stack AI Travel Agent - Setup Guide

## 📋 Overview

This guide will help you set up and run the complete full-stack AI Travel Agent application with proper frontend-backend connectivity.

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   React Frontend │ ◄─────────────► │  FastAPI Backend │
│   (Port 8001)    │                │   (Port 8000)    │
└─────────────────┘                └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                ┌─────────────────┐
│   Static Files   │                │   PostgreSQL     │
│   (Build)        │                │   Database       │
└─────────────────┘                └─────────────────┘
```

## 🔧 Prerequisites

- **Python 3.11+**
- **Node.js 16+**
- **npm** or **yarn**
- **Redis** (optional, for caching)
- **PostgreSQL** (optional, defaults to SQLite)

## 🚀 Quick Start

### 1. Start Everything at Once

```bash
# Clone and navigate to the project
cd AI-Based-Travel-Agent

# Start all services with one command
python start.py
```

This will:
- ✅ Check Python version and dependencies
- ✅ Install missing packages
- ✅ Create necessary directories
- ✅ Start Redis server
- ✅ Start FastAPI backend (port 8000)
- ✅ Start React frontend (port 8001)
- ✅ Open browser automatically
- ✅ Run health checks

### 2. Access the Application

- **Frontend**: http://localhost:8001
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Chat**: http://localhost:8001/#chat
- **Analytics**: http://localhost:8001/#analytics

## 🔗 API Endpoints

### Chat Endpoints
```http
POST /start_session?user_id={user_id}    # Start new chat session
POST /chat                               # Send message to AI
GET  /history/{user_id}                  # Get chat history
DELETE /delete_session?session_id={id}   # Delete session
```

### Travel Planning
```http
POST /api/plan                          # Plan complete trip
GET  /api/places/search?q={query}       # Search destinations
GET  /api/destinations                  # Get available destinations
```

### Analytics
```http
GET /api/analytics/dashboard            # Dashboard data
GET /api/analytics/realtime             # Real-time metrics
```

## 🧪 Testing Connectivity

Run the connection test to verify everything is working:

```bash
python test_connection.py
```

This will test:
- ✅ Backend health
- ✅ Chat session creation
- ✅ Message sending/receiving
- ✅ Travel planning
- ✅ Analytics endpoints

## 🔧 Manual Setup (Alternative)

If you prefer to start services manually:

### Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📁 Project Structure

```
AI-Based-Travel-Agent/
├── 📁 frontend/                    # React frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API service layer
│   │   └── App.tsx               # Main app component
│   └── package.json
├── 📁 data/                       # Mock data files
├── app.py                        # Main FastAPI app
├── main.py                       # Chat-focused FastAPI app
├── ai_chat.py                    # Chat functionality
├── analytics_dashboard.py        # Analytics features
├── models.py                     # Database models
├── config.py                     # Configuration
├── start.py                      # Startup script
└── test_connection.py            # Connection test
```

## 🔄 Frontend-Backend Integration

### API Service Layer
The frontend uses a centralized API service (`frontend/src/services/api.ts`) that handles:

- **Type Safety**: TypeScript interfaces for all API calls
- **Error Handling**: Consistent error handling across the app
- **Base URL Management**: Centralized API endpoint configuration
- **Request/Response Processing**: Automatic JSON parsing and validation

### Key Integration Points

1. **Chat System**: Real-time messaging between frontend and AI backend
2. **Travel Planning**: Form submission and itinerary generation
3. **Analytics**: Dashboard data fetching and real-time updates
4. **Session Management**: User session handling across components

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   netstat -an | findstr :8000
   netstat -an | findstr :8001
   ```

2. **CORS Issues**
   - Backend CORS is configured for development
   - Check `main.py` CORS settings if needed

3. **Dependencies Missing**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt
   cd frontend && npm install
   ```

4. **Backend Not Starting**
   ```bash
   # Check Python version
   python --version
   
   # Check for import errors
   python -c "import fastapi, uvicorn"
   ```

### Logs and Debugging

- **Backend logs**: Check terminal where `start.py` is running
- **Frontend logs**: Check browser developer console
- **Network issues**: Use browser Network tab to inspect API calls

## 🔒 Security Notes

- CORS is configured for development (allows all origins)
- In production, restrict CORS to specific domains
- API keys should be stored in environment variables
- Database credentials should be secured

## 📈 Performance

- **Backend**: FastAPI with async support for high performance
- **Frontend**: React with optimized rendering
- **Caching**: Redis integration for improved response times
- **Database**: Connection pooling for efficient queries

## 🚀 Deployment

For production deployment:

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure Environment**:
   - Set production database URL
   - Configure CORS for your domain
   - Set up proper API keys

3. **Deploy Backend**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## 📞 Support

If you encounter issues:

1. Run the connection test: `python test_connection.py`
2. Check the logs in your terminal
3. Verify all services are running on correct ports
4. Ensure all dependencies are installed

---

**🎉 You're all set! Your full-stack AI Travel Agent is ready to help users plan amazing trips!**
