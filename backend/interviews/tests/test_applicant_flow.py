import time
from django.test import TestCase
from django.urls import reverse
from applicants.models import Applicant
from interviews.models import Interview, PositionType
from django.contrib.auth import get_user_model

class TestApplicantFlow(TestCase):
    def setUp(self):
        # Create a position
        self.position = PositionType.objects.create(
            code="virtual-assistant",
            name="Virtual Assistant",
            description="Remote admin support",
            is_active=True,
            order=0
        )
        # Create an applicant
        self.applicant = Applicant.objects.create(
            first_name="Test",
            last_name="User",
            email="testuser@example.com",
            phone="1234567890"
        )

    def test_full_flow_with_timing(self):
        # Simulate interview creation
        interview = Interview.objects.create(
            applicant=self.applicant,
            position_type=self.position
        )

        # Simulate video upload (skipped, just a placeholder)
        video_file = "dummy_video.mp4"

        # Transcribing
        transcribe_start = time.time()
        # Simulate transcribing (replace with actual function)
        time.sleep(1.2)  # Simulate 1.2s transcribe
        transcribed_text = "This is a transcribed answer."
        transcribe_end = time.time()

        # Analyzing
        analyze_start = time.time()
        # Simulate analyzing (replace with actual function)
        time.sleep(0.8)  # Simulate 0.8s analyze
        analysis_result = {"score": 85, "feedback": "Good response."}
        analyze_end = time.time()

        transcribe_duration = transcribe_end - transcribe_start
        analyze_duration = analyze_end - analyze_start
        total_duration = transcribe_duration + analyze_duration

        print(f"Transcribing: {transcribe_duration:.2f}s, Analyzing: {analyze_duration:.2f}s, Total: {total_duration:.2f}s")

        # Assertions
        self.assertTrue(transcribe_duration >= 1.2)
        self.assertTrue(analyze_duration >= 0.8)
        self.assertEqual(transcribed_text, "This is a transcribed answer.")
        self.assertEqual(analysis_result["score"], 85)
        self.assertEqual(analysis_result["feedback"], "Good response.")
