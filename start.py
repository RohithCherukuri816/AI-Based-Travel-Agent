#!/usr/bin/env python3
"""
AI Travel Planning Agent - Startup Script
Simple script to start the backend server and optionally serve the frontend
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import langgraph
        print("✅ All required dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        sys.exit(1)

def install_dependencies():
    """Install dependencies if needed"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def start_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting AI Travel Planning Agent backend...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📚 API documentation: http://localhost:8000/docs")
    print("🔍 Health check: http://localhost:8000/api/health")
    print("\n" + "="*50)
    
    try:
        # Start the backend server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)

def serve_frontend():
    """Serve the frontend files"""
    print("🌐 Starting frontend server...")
    print("📍 Frontend will be available at: http://localhost:8001")
    
    try:
        subprocess.run([
            sys.executable, "-m", "http.server", "8001"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")

def open_browser():
    """Open the application in the default browser"""
    print("🌐 Opening application in browser...")
    time.sleep(2)  # Wait for servers to start
    
    try:
        webbrowser.open("http://localhost:8001")
    except Exception as e:
        print(f"⚠️ Could not open browser automatically: {e}")
        print("Please open http://localhost:8001 in your browser manually")

def main():
    """Main startup function"""
    print("🚀 AI Travel Planning Agent - Startup Script")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Check if we're in the right directory
    if not Path("app.py").exists():
        print("❌ Error: app.py not found")
        print("Please run this script from the project root directory")
        sys.exit(1)
    
    # Check dependencies
    try:
        check_dependencies()
    except ImportError:
        print("📦 Installing dependencies...")
        install_dependencies()
    
    print("\n🎯 Starting the AI Travel Planning Agent system...")
    print("Press Ctrl+C to stop all servers\n")
    
    # Start backend in a separate process
    try:
        # Start backend
        backend_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "app:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ])
        
        # Wait a moment for backend to start
        time.sleep(3)
        
        # Start frontend
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "8001"
        ])
        
        # Open browser
        open_browser()
        
        print("\n🎉 AI Travel Planning Agent is running!")
        print("📍 Backend: http://localhost:8000")
        print("📍 Frontend: http://localhost:8001")
        print("📚 API Docs: http://localhost:8000/docs")
        print("\nPress Ctrl+C to stop all servers")
        
        # Wait for user to stop
        try:
            backend_process.wait()
            frontend_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping servers...")
            backend_process.terminate()
            frontend_process.terminate()
            print("✅ Servers stopped")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
