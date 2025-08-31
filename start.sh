#!/bin/bash

# AI Travel Planning Agent - Startup Script for Unix/Linux/Mac
# Make this file executable: chmod +x start.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "    🚀 AI Travel Planning Agent"
echo "========================================"
echo -e "${NC}"

# Check Python installation
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Error: Python is not installed${NC}"
        echo "Please install Python 3.8+ from https://python.org"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo -e "${GREEN}✅ Python found: $($PYTHON_CMD --version)${NC}"

# Check Python version
PYTHON_VERSION=$($PYTHON_CMD -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
    echo -e "${RED}❌ Error: Python 3.8+ is required${NC}"
    echo "Current version: $PYTHON_VERSION"
    exit 1
fi

echo -e "${GREEN}✅ Python version $PYTHON_VERSION is compatible${NC}"

# Install dependencies
echo ""
echo "Installing dependencies..."
if ! $PYTHON_CMD -m pip install -r requirements.txt; then
    echo -e "${RED}❌ Error: Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ Error: app.py not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting AI Travel Planning Agent...${NC}"
echo ""
echo -e "${YELLOW}📍 Backend: http://localhost:8000${NC}"
echo -e "${YELLOW}📍 Frontend: http://localhost:8001${NC}"
echo -e "${YELLOW}📚 API Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}Starting backend server...${NC}"
$PYTHON_CMD -m uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo -e "${BLUE}Starting frontend server...${NC}"
$PYTHON_CMD -m http.server 8001 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 2

# Open browser
echo -e "${BLUE}🌐 Opening application in browser...${NC}"
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:8001 &
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:8001 &
elif command -v start &> /dev/null; then
    # Windows (if running in WSL)
    start http://localhost:8001 &
else
    echo -e "${YELLOW}⚠️ Could not open browser automatically${NC}"
    echo -e "${YELLOW}Please open http://localhost:8001 in your browser manually${NC}"
fi

echo ""
echo -e "${GREEN}🎉 AI Travel Planning Agent is running!${NC}"
echo ""
echo -e "${BLUE}Both servers are now running in the background.${NC}"
echo -e "${BLUE}Backend PID: $BACKEND_PID${NC}"
echo -e "${BLUE}Frontend PID: $FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for user to stop
wait
