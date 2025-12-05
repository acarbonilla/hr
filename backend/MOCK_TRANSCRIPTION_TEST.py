"""
QUICK FIX: Test the training module with mock transcription
This bypasses video transcription to test if the rest of the flow works
"""

# In training/views.py, temporarily replace the transcription with:

# MOCK TRANSCRIPTION (for testing)
transcript = f"This is a mock transcription for testing. The user was asked: '{question_text}'. They provided a verbal response discussing their approach to this question."

# Then the rest continues normally with AI feedback generation

print("✅ Using MOCK transcription for testing")
print(f"   Mock transcript: {transcript[:100]}...")
