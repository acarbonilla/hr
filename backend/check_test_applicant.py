from applicants.models import Applicant
from interviews.models import Interview, VideoResponse
from results.models import InterviewResult

# Find Test Applicant
applicant = Applicant.objects.filter(email='test.applicant@example.com').first()

if applicant:
    print(f"Applicant: {applicant.full_name}")
    print(f"Status: {applicant.status}")
    
    # Get interview
    interview = Interview.objects.filter(applicant=applicant).first()
    if interview:
        print(f"\nInterview ID: {interview.id}")
        print(f"Interview Status: {interview.status}")
        print(f"Position Type: {interview.position_type}")
        
        # Get video responses
        videos = interview.video_responses.all()
        print(f"\nVideo Responses: {videos.count()}")
        
        for vr in videos[:5]:
            print(f"\n  Video {vr.id}:")
            print(f"    Question: {vr.question.question_text[:50]}...")
            print(f"    Transcript length: {len(vr.transcript) if vr.transcript else 0}")
            print(f"    AI Score: {vr.ai_score}")
            print(f"    Sentiment: {vr.sentiment}")
            print(f"    Processed: {vr.processed}")
            
            # Check if AI analysis exists
            if hasattr(vr, 'ai_analysis'):
                ai = vr.ai_analysis
                print(f"    AI Analysis exists: Yes")
                print(f"      Overall Score: {ai.overall_score}")
                print(f"      Sentiment Score: {ai.sentiment_score}")
                print(f"      Confidence Score: {ai.confidence_score}")
            else:
                print(f"    AI Analysis exists: No")
        
        # Check result
        result = InterviewResult.objects.filter(interview=interview).first()
        if result:
            print(f"\nInterview Result:")
            print(f"  Final Score: {result.final_score}")
            print(f"  Passed: {result.passed}")
        else:
            print(f"\nNo Interview Result found")
    else:
        print("No interview found")
else:
    print("Applicant not found")
