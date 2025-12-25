from django.core.management.base import BaseCommand
from interviews.models import Interview
from interviews.ai_service import AIInterviewService


class Command(BaseCommand):
    help = 'Manually process interview AI analysis (when Redis/Celery not available)'

    def add_arguments(self, parser):
        parser.add_argument('interview_id', type=int, help='Interview ID to process')

    def handle(self, *args, **options):
        interview_id = options['interview_id']
        
        try:
            interview = Interview.objects.get(id=interview_id)
        except Interview.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Interview {interview_id} not found'))
            return
        
        # Check if interview has video responses
        video_responses = interview.video_responses.all()
        if not video_responses.exists():
            self.stdout.write(self.style.ERROR(f'No video responses found for interview {interview_id}'))
            return
        
        self.stdout.write(f'Processing interview {interview_id}...')
        self.stdout.write(f'Found {video_responses.count()} video responses')
        
        # Process each video response
        from interviews.ai_service import get_ai_service
        from interviews.models import AIAnalysis
        
        ai_service = get_ai_service()
        processed_count = 0
        
        for video_response in video_responses:
            self.stdout.write(f'\nProcessing video response {video_response.id} for question: {video_response.question.question_text[:50]}...')
            
            try:
                # Step 1: Transcribe video
                self.stdout.write('  Transcribing video...')
                transcript = ai_service.transcribe_video(video_response.video_file_path.path)
                self.stdout.write(f'  Transcribed: {transcript[:100]}...')
                
                # Step 2: Analyze transcript
                self.stdout.write('  Analyzing transcript...')
                role = video_response.interview.position_type if hasattr(video_response, "interview") else None
                role_name = role.name if role else None
                role_code = role.code if role else None
                role_context = role.description_context or role.description if role else None
                from interviews.scoring import get_role_prompt_context

                prompt_context = get_role_prompt_context(role_code)
                core_competencies = prompt_context.get("core_competencies") or None
                role_profile = prompt_context.get("role_profile") or None

                analysis_result = ai_service.analyze_transcript(
                    transcript_text=transcript,
                    question_text=video_response.question.question_text,
                    question_type=video_response.question.question_type,
                    role_name=role_name,
                    role_code=role_code,
                    role_context=role_context,
                    question_competency=video_response.question.competency,
                    role_profile=role_profile,
                    core_competencies=core_competencies,
                )
                
                # Step 3: Save AI analysis
                AIAnalysis.objects.create(
                    video_response=video_response,
                    transcript_text=transcript,  # Correct field name
                    sentiment_score=analysis_result.get('sentiment_score', 50.0),
                    confidence_score=analysis_result.get('confidence_score', 50.0),
                    speech_clarity_score=analysis_result.get('speech_clarity_score', 50.0),
                    content_relevance_score=analysis_result.get('content_relevance_score', 50.0),
                    overall_score=analysis_result.get('overall_score', 50.0),
                    recommendation=analysis_result.get('recommendation', 'review'),
                    body_language_analysis={},  # Placeholder
                    langchain_analysis_data={
                        'analysis_summary': analysis_result.get('analysis_summary', ''),
                        'raw_scores': analysis_result
                    }
                )
                
                # Mark as processed
                video_response.processed = True
                video_response.save()
                
                processed_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Processed video response {video_response.id} - Score: {analysis_result.get("overall_score", 0)}'))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error processing video {video_response.id}: {str(e)}'))
        
        # Update interview status
        if processed_count == video_responses.count():
            interview.status = 'completed'
            interview.save()
            self.stdout.write(self.style.SUCCESS(f'\n✓ All {processed_count} videos processed successfully!'))
            self.stdout.write(self.style.SUCCESS(f'✓ Interview {interview_id} marked as completed'))
        else:
            self.stdout.write(self.style.WARNING(f'\n⚠ Processed {processed_count} of {video_responses.count()} videos'))
