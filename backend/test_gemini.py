"""
Quick test script to verify Gemini API key is working
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv('GEMINI_API_KEY')

print(f"🔑 API Key found: {api_key[:20]}..." if api_key else "❌ No API key found")

if api_key:
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Test with a simple prompt
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Say 'Hello, API is working!'")
        
        print(f"✅ Gemini API is working!")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        print(f"Error type: {type(e).__name__}")
else:
    print("❌ GEMINI_API_KEY not found in environment")
