#!/usr/bin/env python3
"""
Simple script to run both frontend and backend
"""

import subprocess
import sys
import time
import webbrowser
from pathlib import Path

def run_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    try:
        backend_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn",
            "main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return backend_process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def run_frontend():
    """Start the frontend server"""
    print("🌐 Starting frontend server...")
    try:
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "3000"
        ], cwd="frontend/build", stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return frontend_process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def main():
    print("🎯 AI Travel Agent - Starting Application")
    print("=" * 50)
    
    # Start backend
    backend_process = run_backend()
    if not backend_process:
        print("❌ Backend failed to start")
        return
    
    # Wait for backend to start
    print("⏳ Waiting for backend to initialize...")
    time.sleep(3)
    
    # Start frontend
    frontend_process = run_frontend()
    if not frontend_process:
        print("❌ Frontend failed to start")
        backend_process.terminate()
        return
    
    print("✅ Both servers started successfully!")
    print("📍 Backend: http://localhost:8000")
    print("📍 Frontend: http://localhost:3000")
    print("📚 API Docs: http://localhost:8000/docs")
    
    # Open browser
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:3000")
    except:
        pass
    
    print("\n💡 Press Ctrl+C to stop all servers")
    
    try:
        # Keep running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("👋 Application stopped successfully!")

if __name__ == "__main__":
    main()