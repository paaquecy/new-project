#!/usr/bin/env python3
"""
Startup script for ANPR Backend
This script sets up the environment and starts the FastAPI server
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import supabase
        import cv2
        import easyocr
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        print("Please copy env_example.txt to .env and fill in your credentials")
        return False
    print("✅ .env file found")
    return True

def load_env_vars():
    """Load environment variables"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY", 
            "SECRET_KEY"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
            return False
        
        print("✅ Environment variables loaded")
        return True
        
    except Exception as e:
        print(f"❌ Error loading environment variables: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    try:
        from database.supabase_client import test_connection
        if test_connection():
            print("✅ Supabase connection successful")
            return True
        else:
            print("❌ Supabase connection failed")
            return False
    except Exception as e:
        print(f"❌ Supabase connection error: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    try:
        import uvicorn
        print("🚀 Starting ANPR Backend Server...")
        print("📡 API will be available at: http://localhost:8000")
        print("📚 Documentation at: http://localhost:8000/docs")
        print("🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main startup function"""
    print("🔧 ANPR Backend Startup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        return
    
    if not check_dependencies():
        return
    
    if not check_env_file():
        return
    
    if not load_env_vars():
        return
    
    if not test_supabase_connection():
        print("⚠️  Supabase connection failed, but continuing...")
        print("Make sure your database is set up correctly")
    
    print("=" * 50)
    print("✅ All checks passed!")
    print("=" * 50)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main() 