#!/usr/bin/env python3
"""
Dependency installation script for ANPR Backend
This script handles the installation of all required packages with proper error handling
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ is required. Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def install_core_dependencies():
    """Install core dependencies first"""
    core_packages = [
        "pip",
        "setuptools", 
        "wheel"
    ]
    
    for package in core_packages:
        if not run_command(f"pip install --upgrade {package}", f"Upgrading {package}"):
            return False
    return True

def install_fastapi_dependencies():
    """Install FastAPI and related packages"""
    fastapi_packages = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "python-multipart>=0.0.6"
    ]
    
    for package in fastapi_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def install_auth_dependencies():
    """Install authentication packages"""
    auth_packages = [
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-dotenv>=1.0.0"
    ]
    
    for package in auth_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def install_database_dependencies():
    """Install database packages"""
    db_packages = [
        "supabase>=2.0.0"
    ]
    
    for package in db_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def install_image_processing_dependencies():
    """Install image processing packages"""
    image_packages = [
        "opencv-python>=4.8.0",
        "pillow>=10.0.0"
    ]
    
    for package in image_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def install_ocr_dependencies():
    """Install OCR packages"""
    ocr_packages = [
        "easyocr>=1.7.0"
    ]
    
    for package in ocr_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            print("⚠️  OCR installation failed. This is optional for basic functionality.")
            return True  # Continue anyway
    return True

def install_data_processing_dependencies():
    """Install data processing packages"""
    data_packages = [
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "pydantic>=2.5.0",
        "httpx>=0.25.0"
    ]
    
    for package in data_packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    return True

def test_imports():
    """Test if all packages can be imported"""
    print("\n🧪 Testing imports...")
    
    test_imports = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "uvicorn"),
        ("supabase", "supabase"),
        ("cv2", "OpenCV"),
        ("PIL", "Pillow"),
        ("numpy", "NumPy"),
        ("pandas", "Pandas"),
        ("pydantic", "Pydantic")
    ]
    
    failed_imports = []
    
    for module, name in test_imports:
        try:
            __import__(module)
            print(f"✅ {name} imported successfully")
        except ImportError as e:
            print(f"❌ {name} import failed: {e}")
            failed_imports.append(name)
    
    if failed_imports:
        print(f"\n⚠️  Some imports failed: {', '.join(failed_imports)}")
        return False
    
    print("✅ All core imports successful!")
    return True

def main():
    """Main installation function"""
    print("🚀 ANPR Backend Dependency Installation")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install dependencies step by step
    steps = [
        ("Installing core dependencies", install_core_dependencies),
        ("Installing FastAPI dependencies", install_fastapi_dependencies),
        ("Installing authentication dependencies", install_auth_dependencies),
        ("Installing database dependencies", install_database_dependencies),
        ("Installing image processing dependencies", install_image_processing_dependencies),
        ("Installing OCR dependencies", install_ocr_dependencies),
        ("Installing data processing dependencies", install_data_processing_dependencies)
    ]
    
    for step_name, step_func in steps:
        print(f"\n📦 {step_name}...")
        if not step_func():
            print(f"❌ {step_name} failed. Stopping installation.")
            return
    
    # Test imports
    if not test_imports():
        print("❌ Import tests failed. Some packages may not be working correctly.")
        return
    
    print("\n" + "=" * 50)
    print("✅ Installation completed successfully!")
    print("=" * 50)
    
    print("\n📋 Next steps:")
    print("1. Set up your Supabase database")
    print("2. Copy env_example.txt to .env and fill in credentials")
    print("3. Run: python start.py")
    
    print("\n🎉 Your ANPR backend is ready to use!")

if __name__ == "__main__":
    main() 