# 🚀 AI Travel Planning Agent

A sophisticated multi-agent AI system that creates personalized travel itineraries using LangGraph and FastAPI. This system orchestrates multiple specialized AI agents to plan complete travel experiences including flights, hotels, activities, and real-time optimization.

## ✨ Features

### 🧠 Multi-Agent Architecture
- **UserAgent**: Analyzes preferences and determines travel style
- **FlightAgent**: Optimizes flight routes and connections
- **HotelAgent**: Finds verified accommodations with safety checks
- **ActivityAgent**: Curates authentic local experiences
- **BudgetAgent**: Smart cost analysis and group trip optimization
- **SafetyAgent**: Health and safety recommendations
- **PlannerAgent**: Compiles day-by-day itineraries with dynamic scheduling

### 🎯 Smart Planning Capabilities
- **Real-time Optimization**: Weather, crowd patterns, and event adjustments
- **Hyper-personalization**: Based on user profile and preferences
- **Safety-First**: Verified accommodations and health-conscious recommendations
- **Authentic Experiences**: Local insights beyond tourist guides
- **Smart Budgeting**: Cost splitting for groups and budget optimization
- **Dynamic Scheduling**: Adapts to opening hours and seasonal variations

### 🖥️ Modern Frontend
- **Clean, Responsive Design**: Beautiful card-based UI with gradients and shadows
- **Real-time Validation**: Form validation with helpful error messages
- **Interactive Elements**: Smooth animations and hover effects
- **Mobile-First**: Responsive design for all devices
- **No Frameworks**: Pure HTML, CSS, and vanilla JavaScript

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ←→ FastAPI Backend ←→ LangGraph Agents
                                    ↓
                            Mock Datasets (JSON)
                            - Flights
                            - Hotels  
                            - Activities
                            - Weather/Events
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (optional, for development)
- Modern web browser

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI-Travel-Agent
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Backend
```bash
# Start the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open the Frontend
- Open `index.html` in your web browser
- Or serve it using a local server:
```bash
# Using Python
python -m http.server 8001

# Using Node.js
npx serve .
```

### 5. Test the System
- Fill out the travel planning form
- Submit to see the AI agents in action
- View your personalized itinerary

## 📁 Project Structure

```
AI-Travel-Agent/
├── app.py                 # FastAPI backend with LangGraph agents
├── index.html            # Frontend HTML interface
├── style.css             # Modern CSS styling
├── script.js             # Frontend JavaScript functionality
├── requirements.txt      # Python dependencies
├── README.md            # This file
└── data/                # Mock datasets
    ├── flights.json     # Flight options and pricing
    ├── hotels.json      # Hotel accommodations
    ├── activities.json  # Local activities and experiences
    └── weather.json     # Weather and event data
```

## 🔧 Configuration

### Backend Configuration
The backend runs on `http://localhost:8000` by default. You can modify this in `app.py`:

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Frontend Configuration
The frontend connects to the backend via the `API_BASE_URL` in `script.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## 🌐 API Endpoints

### POST `/api/plan`
Main endpoint for travel planning.

**Request Body:**
```json
{
  "destination": "London",
  "start_date": "2024-06-15",
  "duration": 7,
  "budget": 3000,
  "preferences": ["culture", "food", "history"],
  "travelers": 2,
  "travel_style": "balanced"
}
```

**Response:**
```json
{
  "itinerary": [...],
  "total_cost": 2850.50,
  "summary": "Your 7-day trip to London is planned!...",
  "recommendations": [...]
}
```

### GET `/api/health`
Health check endpoint.

### GET `/api/destinations`
Get available destinations from mock data.

## 🎨 Customization

### Adding New Destinations
1. Add destination data to `data/hotels.json`
2. Add corresponding activities to `data/activities.json`
3. Add weather data to `data/weather.json`

### Modifying Agent Behavior
Edit the agent functions in `app.py`:

```python
@tool
def find_hotel_options(destination: str, duration: int, budget: float, travelers: int, travel_style: str):
    # Customize hotel selection logic
    pass
```

### Styling Changes
Modify `style.css` to change colors, fonts, and layout:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #ffd700;
}
```

## 🚀 Deployment

### Local Development
```bash
# Backend
uvicorn app:app --reload

# Frontend (optional)
python -m http.server 8001
```

### Production Deployment
1. **Backend**: Deploy to cloud platforms (AWS, GCP, Azure)
2. **Frontend**: Deploy to static hosting (Netlify, Vercel, GitHub Pages)
3. **Update API URL**: Change `API_BASE_URL` in `script.js`

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Hugging Face Spaces
1. Create a new Space
2. Upload all project files
3. Set build command: `pip install -r requirements.txt`
4. Set run command: `uvicorn app:app --host 0.0.0.0 --port 7860`

## 🧪 Testing

### Backend Testing
```bash
# Test API endpoints
curl -X POST "http://localhost:8000/api/plan" \
  -H "Content-Type: application/json" \
  -d '{"destination":"London","start_date":"2024-06-15","duration":3,"budget":2000,"preferences":["culture"],"travelers":1,"travel_style":"balanced"}'
```

### Frontend Testing
- Open browser developer tools
- Test form validation
- Check API connectivity
- Verify responsive design

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version (3.8+ required)
- Install dependencies: `pip install -r requirements.txt`
- Check port availability

**Frontend can't connect to backend:**
- Verify backend is running on port 8000
- Check CORS settings in `app.py`
- Verify `API_BASE_URL` in `script.js`

**Mock data not loading:**
- Check file paths in `data/` directory
- Verify JSON file syntax
- Check file permissions

### Debug Mode
Enable debug logging in the browser console:

```javascript
// Test API connection
window.testAPI()

// View current itinerary
window.debugItinerary()
```

## 🚧 Future Enhancements

### Planned Features
- **Real API Integration**: Replace mock data with actual flight/hotel APIs
- **AI Chat Interface**: Natural language travel planning
- **Collaborative Planning**: Multiple users planning together
- **Export Options**: PDF, calendar integration
- **Real-time Updates**: Live pricing and availability
- **Mobile App**: Native mobile application

### Integration Possibilities
- **Booking APIs**: Expedia, Booking.com, Skyscanner
- **Weather APIs**: OpenWeatherMap, WeatherAPI
- **Translation**: Google Translate API
- **Maps**: Google Maps, Mapbox
- **Payment**: Stripe, PayPal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LangGraph**: Multi-agent orchestration framework
- **FastAPI**: Modern Python web framework
- **Font Awesome**: Beautiful icons
- **Inter Font**: Clean typography

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Happy Travel Planning! ✈️🌍**
