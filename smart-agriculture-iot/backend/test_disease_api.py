#!/usr/bin/env python3
"""
Test script to check the disease detection API directly
"""
import requests
import json

def test_ml_server():
    """Test the ML server disease detection endpoint"""
    print("🔬 Testing ML Server Disease Detection API...")
    
    # Use a test image from our training dataset
    test_image_path = r"e:\Pera bots\Smart-agriculture-system\smart-agriculture-iot\ml_training\training_dataset\healthy\7-Herbs-that-Grow-in-Water-7-1200x900.jpg"
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post('http://localhost:5001/api/disease/detect', files=files)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! ML Server Response:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except FileNotFoundError:
        print(f"❌ Test image not found: {test_image_path}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to ML server. Is it running on localhost:5001?")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_backend_server():
    """Test the Node.js backend disease detection endpoint"""
    print("\n🌐 Testing Backend Server Disease Detection API...")
    
    # Use a test image from our training dataset
    test_image_path = r"e:\Pera bots\Smart-agriculture-system\smart-agriculture-iot\ml_training\training_dataset\healthy\7-Herbs-that-Grow-in-Water-7-1200x900.jpg"
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post('http://localhost:5000/api/disease/detect', files=files)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Backend Server Response:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except FileNotFoundError:
        print(f"❌ Test image not found: {test_image_path}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Is it running on localhost:5000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ml_server()
    test_backend_server()
