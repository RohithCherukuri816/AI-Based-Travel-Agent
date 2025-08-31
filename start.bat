@echo off
chcp 65001 >nul
title AI Travel Planning Agent - Startup

echo.
echo ========================================
echo    🚀 AI Travel Planning Agent
echo ========================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

echo 🚀 Starting AI Travel Planning Agent...
echo.
echo 📍 Backend: http://localhost:8000
echo 📍 Frontend: http://localhost:8001
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the servers
echo.

start "AI Travel Agent Backend" cmd /k "python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

start "AI Travel Agent Frontend" cmd /k "python -m http.server 8001"
timeout /t 2 /nobreak >nul

echo 🌐 Opening application in browser...
start http://localhost:8001

echo.
echo 🎉 AI Travel Planning Agent is running!
echo.
echo Both servers are now running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
