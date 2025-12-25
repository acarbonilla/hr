"""
Management command to reprocess old video responses that don't have AI analysis
"""
from django.core.management.base import BaseCommand
from interviews.models import VideoResponse, AIAnalysis
from interviews.ai_service import get_ai_service
import traceback


class Command(BaseCommand):
    help = 'Reprocess video responses that are missing AI analysis'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interview-id',
            type=int,
            help='Only process videos for specific interview ID',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Reprocess even if AI analysis already exists',
        )

    def handle(self, *args, **options):
        interview_id = options.get('interview_id')
        force = options.get('force', False)

        # Get video responses to process
        if interview_id:
            videos = VideoResponse.objects.filter(interview_id=interview_id)
            self.stdout.write(f"Processing videos for interview {interview_id}...")
        else:
            videos = VideoResponse.objects.all()
            self.stdout.write("Processing all video responses...")

        # Filter out videos that already have AI analysis unless force=True
        if not force:
            videos = videos.filter(ai_analysis__isnull=True)

        total = videos.count()
        self.stdout.write(f"Found {total} video(s) to process\n")

        if total == 0:
            self.stdout.write(self.style.WARNING("No videos to process!"))
            return

        # Initialize AI service
        try:
            ai_service = get_ai_service()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to initialize AI service: {e}"))
            return

        # Process each video
        success_count = 0
        error_count = 0

        for i, video in enumerate(videos, 1):
            self.stdout.write(f"\n[{i}/{total}] Processing video {video.id}...")
            
            try:
                # Get full file path
                video_path = video.video_file_path.path
                self.stdout.write(f"  Video path: {video_path}")

                # Transcribe video
                self.stdout.write("  Transcribing...")
                transcript = ai_service.transcribe_video(video_path)
                self.stdout.write(f"  Transcript: {transcript[:100]}...")

                # Analyze transcript
                self.stdout.write("  Analyzing...")
                role = video.interview.position_type if hasattr(video, "interview") else None
                role_name = role.name if role else None
                role_code = role.code if role else None
                role_context = role.description_context or role.description if role else None
                from interviews.scoring import get_role_prompt_context

                prompt_context = get_role_prompt_context(role_code)
                core_competencies = prompt_context.get("core_competencies") or None
                role_profile = prompt_context.get("role_profile") or None

                analysis_result = ai_service.analyze_transcript(
                    transcript_text=transcript,
                    question_text=video.question.question_text,
                    question_type=video.question.question_type,
                    role_name=role_name,
                    role_code=role_code,
                    role_context=role_context,
                    question_competency=video.question.competency,
                    role_profile=role_profile,
                    core_competencies=core_competencies,
                )

                # Delete old analysis if force=True
                if force and hasattr(video, 'ai_analysis'):
                    video.ai_analysis.delete()

                # Create AI analysis
                ai_analysis = AIAnalysis.objects.create(
                    video_response=video,
                    transcript_text=transcript,
                    sentiment_score=analysis_result.get('sentiment_score', 50.0),
                    confidence_score=analysis_result.get('confidence_score', 50.0),
                    speech_clarity_score=analysis_result.get('speech_clarity_score', 50.0),
                    content_relevance_score=analysis_result.get('content_relevance_score', 50.0),
                    overall_score=analysis_result.get('overall_score', 50.0),
                    recommendation=analysis_result.get('recommendation', 'review'),
                    body_language_analysis={},
                    langchain_analysis_data=analysis_result
                )

                video.processed = True
                video.save()

                self.stdout.write(self.style.SUCCESS(
                    f"  ✓ Success! Overall score: {ai_analysis.overall_score}"
                ))
                success_count += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ✗ Error: {str(e)}"))
                self.stdout.write(traceback.format_exc())
                error_count += 1

        # Summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS(f"Successfully processed: {success_count}"))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f"Failed: {error_count}"))
        self.stdout.write("="*50)
