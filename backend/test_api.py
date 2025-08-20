"""
Test script for ANPR Backend API
Run this to verify all endpoints are working
"""

import requests
import json
import base64
from PIL import Image
import io

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_login():
    """Test user login"""
    try:
        login_data = {
            "username": "4231220075",
            "password": "Wattaddo020"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"✅ Login test: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"Token: {token_data['access_token'][:50]}...")
            return token_data['access_token']
        else:
            print(f"Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return None

def test_plate_recognition(token):
    """Test plate recognition with a sample image"""
    try:
        # Create a simple test image with text
        img = Image.new('RGB', (400, 200), color='white')
        img.save('test_plate.jpg')
        
        # Convert to base64
        with open('test_plate.jpg', 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode()
        
        headers = {"Authorization": f"Bearer {token}"}
        recognition_data = {
            "image_data": img_data,
            "user_id": "test-user"
        }
        
        response = requests.post(f"{BASE_URL}/plate-recognition", json=recognition_data, headers=headers)
        print(f"✅ Plate recognition test: {response.status_code}")
        print(f"Response: {response.json()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Plate recognition test failed: {e}")
        return False

def test_get_vehicle(token):
    """Test getting vehicle information"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        plate_number = "AB 1234 C"
        
        response = requests.get(f"{BASE_URL}/vehicles/{plate_number}", headers=headers)
        print(f"✅ Get vehicle test: {response.status_code}")
        
        if response.status_code == 200:
            vehicle_data = response.json()
            print(f"Vehicle: {vehicle_data['plate_number']} - {vehicle_data['owner_name']}")
        else:
            print(f"Vehicle not found: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Get vehicle test failed: {e}")
        return False

def test_get_violations(token):
    """Test getting violations"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/violations", headers=headers)
        print(f"✅ Get violations test: {response.status_code}")
        
        if response.status_code == 200:
            violations = response.json()
            print(f"Found {len(violations)} violations")
        else:
            print(f"Get violations failed: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Get violations test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing ANPR Backend API...")
    print("=" * 50)
    
    # Test health check
    if not test_health_check():
        print("❌ Health check failed. Is the server running?")
        return
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Login failed. Check credentials and database setup.")
        return
    
    print("\n" + "=" * 50)
    print("🔐 Authentication successful!")
    print("=" * 50)
    
    # Test API endpoints
    test_plate_recognition(token)
    test_get_vehicle(token)
    test_get_violations(token)
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("=" * 50)
    
    print("\n📋 Next steps:")
    print("1. Set up your Supabase database with the provided schemas")
    print("2. Update the .env file with your Supabase credentials")
    print("3. Run the frontend and connect it to this backend")
    print("4. Test the full ANPR workflow")

if __name__ == "__main__":
    main() 