from django.core.management.base import BaseCommand
from applicants.models import Applicant
from interviews.models import Interview
from results.models import InterviewResult


class Command(BaseCommand):
    help = 'Check Test Applicant interview data'

    def handle(self, *args, **options):
        # Find Test Applicant
        applicant = Applicant.objects.filter(email='test.applicant@example.com').first()

        if applicant:
            self.stdout.write(f"Applicant: {applicant.full_name}")
            self.stdout.write(f"Status: {applicant.status}")
            
            # Get interview
            interview = Interview.objects.filter(applicant=applicant).first()
            if interview:
                self.stdout.write(f"\nInterview ID: {interview.id}")
                self.stdout.write(f"Interview Status: {interview.status}")
                self.stdout.write(f"Position Type: {interview.position_type}")
                
                # Get video responses
                videos = interview.video_responses.all()
                self.stdout.write(f"\nVideo Responses: {videos.count()}")
                
                for vr in videos[:5]:
                    self.stdout.write(f"\n  Video {vr.id}:")
                    self.stdout.write(f"    Question: {vr.question.question_text[:50]}...")
                    self.stdout.write(f"    Transcript length: {len(vr.transcript) if vr.transcript else 0}")
                    self.stdout.write(f"    AI Score: {vr.ai_score}")
                    self.stdout.write(f"    Sentiment: {vr.sentiment}")
                    self.stdout.write(f"    Processed: {vr.processed}")
                    
                    # Check if AI analysis exists
                    if hasattr(vr, 'ai_analysis'):
                        ai = vr.ai_analysis
                        self.stdout.write(f"    AI Analysis exists: Yes")
                        self.stdout.write(f"      Overall Score: {ai.overall_score}")
                        self.stdout.write(f"      Sentiment Score: {ai.sentiment_score}")
                        self.stdout.write(f"      Confidence Score: {ai.confidence_score}")
                    else:
                        self.stdout.write(f"    AI Analysis exists: No")
                
                # Check result
                result = InterviewResult.objects.filter(interview=interview).first()
                if result:
                    self.stdout.write(f"\nInterview Result:")
                    self.stdout.write(f"  Final Score: {result.final_score}")
                    self.stdout.write(f"  Passed: {result.passed}")
                else:
                    self.stdout.write(f"\nNo Interview Result found")
            else:
                self.stdout.write("No interview found")
        else:
            self.stdout.write("Applicant not found")
