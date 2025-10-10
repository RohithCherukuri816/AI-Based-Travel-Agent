#!/usr/bin/env python3
"""
AI Travel Planning Agent - Enhanced Startup Script
Next-level startup with all advanced features
"""

import os
import sys
import time
import subprocess
import webbrowser
import platform
import json
from pathlib import Path

import dotenv # Import dotenv library

def print_banner():
    """Print startup banner"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                 🚀 AI Travel Planning Agent                  ║
    ║                       NEXT LEVEL STARTUP                     ║
    ║                                                              ║
    ║  ✨ Multi-Agent AI System     💬 Natural Language Chat       ║
    ║  📊 Advanced Analytics      💳 Payment Integration           ║
    ║  🌐 Real API Integrations    📱 Progressive Web App          ║
    ║  🔒 Enterprise Security     📈 Business Intelligence         ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def check_python_version():
    """Check Python version compatibility"""
    print("🔍 Checking Python version...")
    
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required. Current version:", sys.version)
        return False

    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def check_dependencies():
    """Check and install required dependencies"""
    print("\n📦 Checking dependencies...")
    
    requirements_file = "requirements.txt"
    if not os.path.exists(requirements_file):
        print("❌ requirements.txt not found")
        return False
    
    try:
        # Check if a key package is already installed
        # This is a lightweight check to avoid running pip install every time
        import fastapi
        print("✅ Dependencies already installed. Skipping installation.")
        return True
    except ImportError:
        print("⚠️  Dependencies not found. Installing now...")

    try:
        # Install dependencies
        print("📥 Installing Python dependencies...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ], check=True, text=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_env_file():
    """Create environment configuration file"""
    print("\n⚙️ Creating environment configuration...")

    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env file already exists. Skipping creation.")
        print("⚠️  Please update your API keys in the existing .env file.")
        return

    env_config = {
        "APP_NAME": "AI Travel Planning Agent",
        "APP_VERSION": "2.0.0",
        "DEBUG": "true",
        "ENVIRONMENT": "development",
        
        # Server Configuration
        "HOST": "0.0.0.0",
        "PORT": "8000",
        "WORKERS": "1",
        
        # Database Configuration
        "DATABASE_URL": "sqlite:///./travel_agent.db",
        "REDIS_URL": "redis://localhost:6379",
        
        # AI Configuration
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "ANTHROPIC_API_KEY": "your_anthropic_api_key_here",
        "GOOGLE_AI_API_KEY": "your_google_api_key_here",
        
        # Payment Configuration
        "STRIPE_SECRET_KEY": "sk_test_your_stripe_secret_key",
        "STRIPE_PUBLISHABLE_KEY": "pk_test_your_stripe_publishable_key",
        "STRIPE_WEBHOOK_SECRET": "whsec_your_webhook_secret",
        "PAYPAL_CLIENT_ID": "your_paypal_client_id",
        "PAYPAL_CLIENT_SECRET": "your_paypal_client_secret",
        
        # API Configuration
        "OPENWEATHER_API_KEY": "your_openweather_api_key",
        "AMADEUS_CLIENT_ID": "your_amadeus_client_id",
        "AMADEUS_CLIENT_SECRET": "your_amadeus_client_secret",
        "BOOKING_API_KEY": "your_booking_api_key",
        
        # Security Configuration
        "SECRET_KEY": "your_secret_key_here",
        "JWT_SECRET": "your_jwt_secret_here",
        "CORS_ORIGINS": "http://localhost:8001,http://127.0.0.1:8001",
        
        # Feature Flags
        "ENABLE_AI_CHAT": "true",
        "ENABLE_ANALYTICS": "true",
        "ENABLE_PAYMENTS": "true",
        "ENABLE_REAL_APIS": "true",
        "ENABLE_WEBSOCKETS": "true"
    }
    
    # Create .env file
    with open(env_file, "w") as f:
        for key, value in env_config.items():
            f.write(f"{key}={value}\n")
    
    print("✅ Environment configuration created (.env)")
    print("⚠️  Please update API keys in .env file before production use")

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directory structure...")
    
    directories = [
        "data",
        "logs",
        "uploads",
        "exports",
        "temp",
        "backups",
        "config"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def start_backend():
    """Start the FastAPI backend server"""
    print("\n🚀 Starting AI Travel Agent Backend...")
    
    try:
        # Start backend with enhanced configuration
        backend_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn",
            "app:app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--workers", "1",
            "--log-level", "info"
        ], stdout=None, stderr=None)
        
        print("✅ Backend server started on http://localhost:8000")
        print("📊 API Documentation: http://localhost:8000/docs")
        print("🔍 Interactive API: http://localhost:8000/redoc")
        
        return backend_process
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend server"""
    print("\n🌐 Starting AI Travel Agent Frontend...")
    
    try:
        # Start frontend server
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "8001"
        ], stdout=None, stderr=None)
        
        print("✅ Frontend server started on http://localhost:8001")
        return frontend_process
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def start_redis():
    """Start Redis server for caching and sessions"""
    print("\n🔴 Starting Redis server...")
    
    try:
        if platform.system() == "Windows":
            # Windows Redis
            redis_process = subprocess.Popen([
                "redis-server.exe"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        else:
            # Unix/Linux/Mac Redis
            redis_process = subprocess.Popen([
                "redis-server"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        print("✅ Redis server started")
        return redis_process
        
    except Exception as e:
        print(f"⚠️  Redis not available: {e}")
        print("   Continuing without Redis (some features may be limited)")
        return None

def open_browser():
    """Open the application in the default browser"""
    print("\n🌍 Opening application in browser...")
    
    try:
        # Wait a moment for servers to start
        time.sleep(3)
        
        # Open main application
        webbrowser.open("http://localhost:8001")
        
        # Open backend API docs
        webbrowser.open("http://localhost:8000/docs")
        
        print("✅ Browser opened successfully")
        
    except Exception as e:
        print(f"⚠️  Failed to open browser: {e}")

def show_status():
    """Show application status"""
    print("\n" + "="*60)
    print("🎯 AI Travel Planning Agent - STATUS")
    print("="*60)
    print("📍 Frontend: http://localhost:8001")
    print("🔧 Backend API: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔍 Interactive API: http://localhost:8000/redoc")
    print("💬 AI Chat: http://localhost:8001/#chat")
    print("📊 Analytics: http://localhost:8001/#analytics")
    print("="*60)
    print("🚀 Your startup is ready!")
    print("💡 Press Ctrl+C to stop all services")
    print("="*60)

def wait_for_backend(max_attempts=30, delay=1):
    """Wait for backend to be ready"""
    import requests
    
    print("🔍 Checking backend availability...")
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/", timeout=2)
            if response.status_code == 200:
                print("✅ Backend is ready!")
                return True
        except Exception:
            pass
        
        if attempt < max_attempts - 1:
            print(f"⏳ Waiting for backend... (attempt {attempt + 1}/{max_attempts})")
            time.sleep(delay)
    
    print("❌ Backend failed to start within timeout period")
    return False

def run_health_check():
    """Run health check on all services"""
    print("\n🏥 Running health check...")
    
    import requests
    import time
    
    services = [
        ("Frontend", "http://localhost:8001"),
        ("Backend API", "http://localhost:8000/api/health"),
        ("Analytics", "http://localhost:8000/api/analytics/health"),
        ("Chat", "http://localhost:8000/api/chat/health")
    ]
    
    for service_name, url in services:
        success = False
        last_error = None
        for attempt in range(5):  # up to 5 retries with backoff
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✅ {service_name}: Healthy")
                    success = True
                    break
                else:
                    last_error = f"Status {response.status_code}"
            except Exception as e:
                last_error = e
            time.sleep(1 + attempt)  # incremental backoff
        if not success:
            print(f"❌ {service_name}: Unavailable - {last_error}")
    
    print("🏥 Health check completed")

def main():
    """Main startup function"""
    # Load environment variables first
    dotenv.load_dotenv()
    print_banner()
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_dependencies():
        print("❌ Dependency check failed. Exiting.")
        sys.exit(1)
    
    # Setup environment
    create_env_file()
    create_directories()
    
    # Start services
    processes = []
    
    # Start Redis
    redis_process = start_redis()
    if redis_process:
        processes.append(("Redis", redis_process))
    
    # Start backend
    backend_process = start_backend()
    if backend_process:
        processes.append(("Backend", backend_process))
    else:
        print("❌ Backend startup failed. Exiting.")
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend()
    if frontend_process:
        processes.append(("Frontend", frontend_process))
    else:
        print("❌ Frontend startup failed. Exiting.")
        sys.exit(1)
    
    # Wait for backend to be ready
    print("\n⏳ Waiting for backend to initialize...")
    backend_ready = wait_for_backend()
    if not backend_ready:
        print("❌ Backend failed to start properly. Exiting.")
        sys.exit(1)
    
    # Wait a bit more for frontend
    print("⏳ Starting frontend...")
    time.sleep(2)
    
    # Show status
    show_status()
    
    # Open browser
    open_browser()
    
    # Run health check
    time.sleep(2)
    run_health_check()
    
    try:
        # Keep the script running
        print("\n🔄 All services are running. Press Ctrl+C to stop...")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down services...")
        
        # Stop all processes
        for service_name, process in processes:
            try:
                print(f"🛑 Stopping {service_name}...")
                process.terminate()
                process.wait(timeout=5)
                print(f"✅ {service_name} stopped")
            except subprocess.TimeoutExpired:
                print(f"⚠️  {service_name} didn't stop gracefully, forcing...")
                process.kill()
            except Exception as e:
                print(f"⚠️  Error stopping {service_name}: {e}")
        
        print("\n👋 AI Travel Planning Agent stopped successfully!")
        print("   Thank you for using our next-level travel planning solution!")

if __name__ == "__main__":
    main()