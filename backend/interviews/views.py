from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Interview, InterviewQuestion, VideoResponse
from .type_models import PositionType, QuestionType
from .serializers import (
    InterviewSerializer,
    InterviewCreateSerializer,
    VideoResponseSerializer,
    VideoResponseCreateSerializer,
    InterviewAnalysisSerializer,
    InterviewQuestionSerializer
)
from .type_serializers import PositionTypeSerializer, QuestionTypeSerializer


class PositionTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Position Types
    
    Endpoints:
    - GET /api/position-types/ - List all position types (public)
    - POST /api/position-types/ - Create new position type (auth required)
    - GET /api/position-types/{id}/ - Get position type details (public)
    - PUT/PATCH /api/position-types/{id}/ - Update position type (auth required)
    - DELETE /api/position-types/{id}/ - Delete position type (auth required)
    """
    
    queryset = PositionType.objects.all().order_by('order', 'name')
    serializer_class = PositionTypeSerializer
    
    def get_permissions(self):
        """
        Allow public access for list and retrieve (GET requests)
        Require authentication for create, update, delete
        """
        if self.action in ['list', 'retrieve']:
            return []
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter to active types only if requested"""
        queryset = super().get_queryset()
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            queryset = queryset.filter(is_active=True)
        return queryset


class QuestionTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Question Types
    
    Endpoints:
    - GET /api/question-types/ - List all question types
    - POST /api/question-types/ - Create new question type
    - GET /api/question-types/{id}/ - Get question type details
    - PUT/PATCH /api/question-types/{id}/ - Update question type
    - DELETE /api/question-types/{id}/ - Delete question type
    """
    
    queryset = QuestionType.objects.all().order_by('order', 'name')
    serializer_class = QuestionTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter to active types only if requested"""
        queryset = super().get_queryset()
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            queryset = queryset.filter(is_active=True)
        return queryset


class InterviewQuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interview Questions
    
    Endpoints:
    - GET /api/questions/ - List all active questions
    - POST /api/questions/ - Create new question
    - GET /api/questions/{id}/ - Get question details
    - PUT/PATCH /api/questions/{id}/ - Update question
    - DELETE /api/questions/{id}/ - Delete question
    - GET /api/questions/?position=<id> - Filter by position type ID
    - GET /api/questions/?type=<id> - Filter by question type ID
    """
    
    queryset = InterviewQuestion.objects.select_related('question_type', 'position_type').filter(is_active=True).order_by('order')
    serializer_class = InterviewQuestionSerializer
    
    def get_permissions(self):
        """Allow anyone to list/retrieve questions, but require auth for create/update/delete"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filter questions based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by position type (accepts ID or code)
        position = self.request.query_params.get('position', None)
        if position:
            # Try to filter by ID first, if that fails, filter by code
            if position.isdigit():
                queryset = queryset.filter(position_type_id=int(position))
            else:
                queryset = queryset.filter(position_type__code=position)
        
        # Filter by question type (accepts ID or code)
        question_type = self.request.query_params.get('type', None)
        if question_type:
            # Try to filter by ID first, if that fails, filter by code
            if question_type.isdigit():
                queryset = queryset.filter(question_type_id=int(question_type))
            else:
                queryset = queryset.filter(question_type__code=question_type)
        
        return queryset


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interview model
    
    Endpoints:
    - POST /api/interviews/ - Create new interview
    - GET /api/interviews/ - List all interviews
    - GET /api/interviews/{id}/ - Get interview details
    - POST /api/interviews/{id}/video-response/ - Upload video response
    - GET /api/interviews/{id}/analysis/ - Get interview analysis
    """
    
    queryset = Interview.objects.all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return InterviewCreateSerializer
        elif self.action == 'analysis':
            return InterviewAnalysisSerializer
        return InterviewSerializer
    
    def get_permissions(self):
        """Allow anyone to create interview and upload videos"""
        if self.action in ['create', 'video_response', 'list', 'retrieve', 'submit', 'analysis']:
            return [AllowAny()]
        return super().get_permissions()
    
    def get_queryset(self):
        """Filter interviews based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by applicant
        applicant_id = self.request.query_params.get('applicant', None)
        if applicant_id:
            queryset = queryset.filter(applicant_id=applicant_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset.select_related('applicant').prefetch_related('video_responses').order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create new interview"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        interview = serializer.save()
        
        # Return full interview data with questions
        response_serializer = InterviewSerializer(interview)
        return Response(
            {
                'message': 'Interview created successfully',
                'interview': response_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], url_path='video-response', permission_classes=[AllowAny])
    def video_response(self, request, pk=None):
        """
        Upload video response WITHOUT immediate analysis
        Analysis happens in bulk after interview submission
        
        POST /api/interviews/{id}/video-response/
        Body: {
            "question_id": 1,
            "video_file_path": <file>,
            "duration": "00:02:30"
        }
        """
        interview = self.get_object()
        
        print(f"\n=== VIDEO UPLOAD REQUEST ===")
        print(f"Interview ID: {interview.id}")
        print(f"Interview Status: {interview.status}")
        print(f"Request Data: {request.data}")
        print(f"Request Files: {request.FILES}")
        
        # Check if interview is in valid state
        if interview.status in ['submitted', 'processing', 'completed']:
            return Response(
                {'error': 'Interview already submitted or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update interview status to in_progress
        if interview.status == 'pending':
            interview.status = 'in_progress'
            interview.save()
        
        # Create video response
        serializer = VideoResponseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Serializer validation failed: {serializer.errors}")
            return Response(
                {'error': 'Invalid data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer.is_valid(raise_exception=True)
        
        question_id = serializer.validated_data.get('question_id')
        if not question_id:
            return Response(
                {'error': 'question_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question = get_object_or_404(InterviewQuestion, id=question_id, is_active=True)
        
        # Check if response already exists for this question
        existing_response = VideoResponse.objects.filter(
            interview=interview,
            question=question
        ).first()
        
        if existing_response:
            return Response(
                {'error': 'A response for this question already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create video response with 'uploaded' status (NO analysis yet)
        video_response = VideoResponse.objects.create(
            interview=interview,
            question=question,
            video_file_path=serializer.validated_data['video_file_path'],
            duration=serializer.validated_data['duration'],
            status='uploaded'  # Just uploaded, not analyzed yet
        )
        
        response_data = VideoResponseSerializer(video_response).data
        
        return Response(
            {
                'message': 'Video uploaded successfully. Analysis will begin after interview submission.',
                'video_response': response_data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'], url_path='analysis', permission_classes=[AllowAny])
    def analysis(self, request, pk=None):
        """
        Get AI analysis results for interview
        
        GET /api/interviews/{id}/analysis/
        """
        interview = self.get_object()
        
        # Check if interview has video responses
        if not interview.video_responses.exists():
            return Response(
                {'error': 'No video responses found for this interview'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check AI processing status
        total_videos = interview.video_responses.count()
        processed_videos = interview.video_responses.filter(processed=True).count()
        videos_with_ai = sum(1 for v in interview.video_responses.all() if hasattr(v, 'ai_analysis'))
        
        ai_processing_complete = (total_videos > 0 and videos_with_ai == total_videos)
        
        serializer = InterviewAnalysisSerializer(interview)
        
        return Response({
            'analysis': serializer.data,
            'ai_processing_complete': ai_processing_complete,
            'processing_stats': {
                'total_videos': total_videos,
                'processed_videos': processed_videos,
                'videos_with_ai_analysis': videos_with_ai
            }
        })
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit(self, request, pk=None):
        """
        Submit entire interview for BULK processing
        All videos should already be uploaded
        Analysis happens in background after submission
        
        POST /api/interviews/{id}/submit/
        """
        interview = self.get_object()
        
        print(f"\n=== INTERVIEW SUBMISSION REQUEST ===")
        print(f"Interview ID: {interview.id}")
        print(f"Interview Status: {interview.status}")
        print(f"Position Type: {interview.position_type}")
        
        # Get total responses
        total_responses = interview.video_responses.count()
        print(f"Total video responses: {total_responses}")
        
        # Validate we have at least some responses
        if total_responses == 0:
            print(f"❌ Validation failed: No questions answered")
            return Response({
                'error': 'No questions have been answered',
                'answered': 0
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the question IDs that were answered
        answered_question_ids = list(interview.video_responses.values_list('question_id', flat=True))
        print(f"Answered question IDs: {answered_question_ids}")
        
        # Check if all answered questions are valid and active
        valid_questions = InterviewQuestion.objects.filter(
            id__in=answered_question_ids,
            is_active=True
        ).count()
        print(f"Valid questions: {valid_questions} of {total_responses}")
        
        if valid_questions != total_responses:
            print(f"❌ Validation failed: Some invalid questions")
            return Response({
                'error': 'Some responses are for invalid questions',
                'answered': total_responses,
                'valid': valid_questions
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate minimum questions answered (at least 5 for position-based interviews)
        MINIMUM_QUESTIONS_REQUIRED = 5
        
        if interview.position_type:
            print(f"Checking minimum questions: {total_responses} >= {MINIMUM_QUESTIONS_REQUIRED}?")
            if total_responses < MINIMUM_QUESTIONS_REQUIRED:
                print(f"❌ Validation failed: Not enough questions answered")
                return Response({
                    'error': f'Please answer at least {MINIMUM_QUESTIONS_REQUIRED} questions',
                    'answered': total_responses,
                    'required': MINIMUM_QUESTIONS_REQUIRED,
                    'position': interview.get_position_type_display()
                }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ All validations passed!")
        
        # Mark interview as submitted and start processing
        from django.utils import timezone
        interview.status = 'submitted'
        interview.submission_date = timezone.now()
        interview.save()
        
        # Create processing queue entry
        from processing.models import ProcessingQueue
        queue_entry = ProcessingQueue.objects.create(
            interview=interview,
            processing_type='bulk_analysis',
            status='pending'
        )
        
        # Try async processing first (Redis/Celery), fall back to synchronous
        processing_started = False
        try:
            from .tasks import process_complete_interview
            process_complete_interview.delay(interview.id)
            processing_started = True
            print(f"✓ Celery task queued for interview {interview.id}")
        except Exception as e:
            print(f"⚠ Redis/Celery not available, starting synchronous processing: {e}")
            
            # Process synchronously in background thread (non-blocking)
            import threading
            def process_in_background():
                try:
                    from .ai_service import get_ai_service
                    from .models import AIAnalysis
                    print(f"Starting OPTIMIZED parallel AI processing for interview {interview.id}...")
                    
                    interview.status = 'processing'
                    interview.save()
                    
                    ai_service = get_ai_service()
                    video_responses = list(interview.video_responses.all())
                    
                    # Prepare data for batch processing
                    videos_data = [
                        {
                            'video_id': vr.id,
                            'video_file_path': vr.video_file_path.path,
                            'question_text': vr.question.question_text,
                            'question_type': vr.question.question_type.name if vr.question.question_type else 'general'
                        }
                        for vr in video_responses
                    ]
                    
                    # Process all videos in parallel with token tracking
                    results = ai_service.batch_transcribe_and_analyze(videos_data, interview_id=interview.id)
                    
                    # Save results to database
                    for video_response, result in zip(video_responses, results):
                        if result['success']:
                            transcript = result['transcript']
                            analysis_result = result['analysis']
                            
                            # Check if this is a technical issue (no audio)
                            is_technical_issue = analysis_result.get('technical_issue', False)
                            
                            if is_technical_issue:
                                # For technical issues, don't create AI analysis, just flag the video
                                video_response.transcript = transcript
                                video_response.ai_score = None  # None instead of 0
                                video_response.sentiment = None
                                video_response.processed = True
                                video_response.status = 'analyzed'  # Mark as analyzed but with issue
                                video_response.save()
                                print(f"⚠️ Video {video_response.id} flagged as technical issue (no audio)")
                            else:
                                # Normal processing with valid scores
                                # Save AI analysis
                                AIAnalysis.objects.create(
                                    video_response=video_response,
                                    transcript_text=transcript,
                                    sentiment_score=analysis_result.get('sentiment_score', 50.0),
                                    confidence_score=analysis_result.get('confidence_score', 50.0),
                                    speech_clarity_score=analysis_result.get('speech_clarity_score', 50.0),
                                    content_relevance_score=analysis_result.get('content_relevance_score', 50.0),
                                    overall_score=analysis_result.get('overall_score', 50.0),
                                    recommendation=analysis_result.get('recommendation', 'review'),
                                    body_language_analysis={},
                                    langchain_analysis_data={
                                        'analysis_summary': analysis_result.get('analysis_summary', ''),
                                        'raw_scores': analysis_result
                                    }
                                )
                                
                                # Update video_response
                                video_response.transcript = transcript
                                video_response.ai_score = analysis_result.get('overall_score', 50.0)
                                video_response.sentiment = analysis_result.get('sentiment_score', 50.0)
                                video_response.processed = True
                                video_response.save()
                                print(f"✓ Saved results for video {video_response.id}")
                        else:
                            print(f"✗ Failed to process video {video_response.id}: {result.get('error', 'Unknown error')}")
                    
                    interview.status = 'completed'
                    interview.completed_at = timezone.now()
                    interview.save()
                    
                    # Auto-create InterviewResult after interview completion
                    from results.models import InterviewResult
                    from django.db.models import Avg
                    
                    # Calculate average score from all video responses
                    avg_score = interview.video_responses.aggregate(avg=Avg('ai_score'))['avg']
                    
                    if avg_score is not None:
                        # Determine if passed based on scoring thresholds (75+ = hire, 50-74.9 = review, <50 = reject)
                        passed = avg_score >= 75.0
                        
                        # Create result record
                        result, created = InterviewResult.objects.get_or_create(
                            interview=interview,
                            defaults={
                                'applicant': interview.applicant,
                                'final_score': round(avg_score, 2),
                                'passed': passed
                            }
                        )
                        if created:
                            print(f"✓ Created InterviewResult {result.id} with score {result.final_score}")
                        else:
                            # Update existing result
                            result.final_score = round(avg_score, 2)
                            result.passed = passed
                            result.save()
                            print(f"✓ Updated InterviewResult {result.id} with score {result.final_score}")
                        
                        # Update applicant status based on score
                        applicant = interview.applicant
                        if avg_score < 50:
                            # Failed: score below 50
                            applicant.status = 'failed'
                            applicant.save()
                            print(f"✓ Updated applicant {applicant.id} status to 'failed' (score: {avg_score})")
                        elif avg_score >= 75:
                            # Passed: score 75 or above
                            applicant.status = 'passed'
                            applicant.save()
                            print(f"✓ Updated applicant {applicant.id} status to 'passed' (score: {avg_score})")
                        else:
                            # In review: score 50-74.9
                            applicant.status = 'in_review'
                            applicant.save()
                            print(f"✓ Updated applicant {applicant.id} status to 'in_review' (score: {avg_score})")
                    
                    queue_entry.status = 'completed'
                    queue_entry.save()
                    
                    print(f"✓ Interview {interview.id} processed successfully!")
                except Exception as process_error:
                    import traceback
                    error_msg = f"{str(process_error)}\n{traceback.format_exc()}"
                    print(f"✗ Error processing interview {interview.id}: {error_msg}")
                    interview.status = 'failed'
                    interview.error_message = error_msg
                    interview.save()
                    queue_entry.status = 'failed'
                    queue_entry.error_message = error_msg
                    queue_entry.save()
            
            # Start processing in background thread
            thread = threading.Thread(target=process_in_background)
            thread.daemon = True
            thread.start()
            processing_started = True
            print(f"✓ Background processing thread started for interview {interview.id}")
        
        return Response({
            'message': 'Interview submitted successfully. AI analysis in progress.',
            'queue_id': queue_entry.id,
            'status': 'processing',
            'estimated_completion_minutes': 5
        })
    
    @action(detail=True, methods=['get'], url_path='processing-status')
    def processing_status(self, request, pk=None):
        """
        Check bulk processing status
        
        GET /api/interviews/{id}/processing-status/
        """
        interview = self.get_object()
        
        # Get processing queue entry
        from processing.models import ProcessingQueue
        try:
            queue_entry = ProcessingQueue.objects.filter(
                interview=interview,
                processing_type='bulk_analysis'
            ).latest('created_at')
        except ProcessingQueue.DoesNotExist:
            return Response({
                'error': 'No processing queue found for this interview'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate progress
        total_videos = interview.video_responses.count()
        processed_videos = interview.video_responses.filter(status='analyzed').count()
        remaining = total_videos - processed_videos
        
        # Estimate time remaining (assume 10 seconds per video)
        estimated_seconds = remaining * 10
        
        if estimated_seconds < 60:
            estimated_time = f"{estimated_seconds} seconds"
        else:
            estimated_minutes = estimated_seconds // 60
            estimated_time = f"{estimated_minutes} minute{'s' if estimated_minutes > 1 else ''}"
        
        response_data = {
            'status': queue_entry.status,
            'progress': {
                'total_videos': total_videos,
                'processed': processed_videos,
                'remaining': remaining
            },
            'estimated_time_remaining': estimated_time
        }
        
        if queue_entry.status == 'completed':
            response_data['message'] = 'Processing complete! Redirecting to results...'
        elif queue_entry.status == 'failed':
            response_data['message'] = 'Processing failed. Please contact support.'
            response_data['error'] = queue_entry.error_message
        
        return Response(response_data)
    
    @action(detail=True, methods=['get'], url_path='video-responses')
    def list_video_responses(self, request, pk=None):
        """List all video responses for an interview"""
        interview = self.get_object()
        video_responses = interview.video_responses.all()
        serializer = VideoResponseSerializer(video_responses, many=True)
        
        return Response(serializer.data)
