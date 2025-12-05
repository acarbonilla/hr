from rest_framework import serializers
from .models import Interview, InterviewQuestion, VideoResponse, AIAnalysis
from .type_serializers import PositionTypeSerializer, QuestionTypeSerializer
from applicants.serializers import ApplicantListSerializer


class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Serializer for interview questions"""
    
    question_type_detail = QuestionTypeSerializer(source='question_type', read_only=True)
    position_type_detail = PositionTypeSerializer(source='position_type', read_only=True)
    question_type_id = serializers.PrimaryKeyRelatedField(
        source='question_type',
        queryset=serializers.SerializerMethodField(),
        write_only=True,
        required=False
    )
    position_type_id = serializers.PrimaryKeyRelatedField(
        source='position_type',
        queryset=serializers.SerializerMethodField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'question_text', 'question_type', 'position_type',
            'question_type_detail', 'position_type_detail',
            'question_type_id', 'position_type_id', 'order'
        ]
    
    def get_fields(self):
        fields = super().get_fields()
        from .type_models import QuestionType, PositionType
        fields['question_type_id'].queryset = QuestionType.objects.filter(is_active=True)
        fields['position_type_id'].queryset = PositionType.objects.filter(is_active=True)
        return fields


class AIAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for AI analysis results"""
    
    class Meta:
        model = AIAnalysis
        fields = [
            'id',
            'transcript_text',
            'sentiment_score',
            'confidence_score',
            'body_language_analysis',
            'speech_clarity_score',
            'content_relevance_score',
            'overall_score',
            'recommendation',
            'langchain_analysis_data',
            'analyzed_at'
        ]
        read_only_fields = ['id', 'analyzed_at']


class VideoResponseSerializer(serializers.ModelSerializer):
    """Serializer for video responses"""
    
    question = InterviewQuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)
    ai_analysis = AIAnalysisSerializer(read_only=True)
    final_score = serializers.ReadOnlyField()
    hr_reviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoResponse
        fields = [
            'id',
            'question',
            'question_id',
            'video_file_path',
            'duration',
            'uploaded_at',
            'status',
            'transcript',
            'ai_score',
            'sentiment',
            'hr_override_score',
            'hr_comments',
            'hr_reviewed_at',
            'hr_reviewer',
            'hr_reviewer_name',
            'final_score',
            'script_reading_status',
            'script_reading_data',
            'processed',
            'ai_analysis'
        ]
        read_only_fields = [
            'id',
            'uploaded_at',
            'status',
            'transcript',
            'ai_score',
            'sentiment',
            'hr_reviewed_at',
            'hr_reviewer',
            'processed'
        ]
    
    def get_hr_reviewer_name(self, obj):
        """Get HR reviewer's name"""
        if obj.hr_reviewer:
            return f"{obj.hr_reviewer.first_name} {obj.hr_reviewer.last_name}"
        return None


class VideoResponseCreateSerializer(serializers.Serializer):
    """Serializer for creating video responses"""
    
    question_id = serializers.IntegerField(required=True)
    video_file_path = serializers.FileField(required=True)
    duration = serializers.DurationField(required=True)
    
    def validate_question_id(self, value):
        """Validate that question exists and is active"""
        try:
            question = InterviewQuestion.objects.get(id=value, is_active=True)
        except InterviewQuestion.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive question.")
        return value


class InterviewSerializer(serializers.ModelSerializer):
    """Serializer for interview model"""
    
    applicant = ApplicantListSerializer(read_only=True)
    video_responses = VideoResponseSerializer(many=True, read_only=True)
    questions = serializers.SerializerMethodField()
    position_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id',
            'applicant',
            'interview_type',
            'position_type',
            'status',
            'created_at',
            'submission_date',
            'completed_at',
            'authenticity_flag',
            'authenticity_status',
            'authenticity_notes',
            'questions',
            'video_responses'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'submission_date',
            'completed_at',
            'status',
            'authenticity_flag',
            'authenticity_status'
        ]
    
    def get_position_type(self, obj):
        """Return position type code as string"""
        if obj.position_type:
            return obj.position_type.code
        return None
    
    def get_questions(self, obj):
        """Get active questions for the interview"""
        questions = InterviewQuestion.objects.filter(is_active=True).order_by('order')
        return InterviewQuestionSerializer(questions, many=True).data


class InterviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating interviews"""
    
    applicant_id = serializers.IntegerField(write_only=True)
    position_type = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = Interview
        fields = ['applicant_id', 'interview_type', 'position_type']
    
    def validate_applicant_id(self, value):
        """Validate that applicant exists"""
        from applicants.models import Applicant
        try:
            Applicant.objects.get(id=value)
        except Applicant.DoesNotExist:
            raise serializers.ValidationError("Applicant not found.")
        return value
    
    def validate_position_type(self, value):
        """Validate and convert position_type code to PositionType instance"""
        if not value:
            return None
            
        from .type_models import PositionType
        
        # If it's already an integer (ID), get the instance
        if isinstance(value, int):
            try:
                return PositionType.objects.get(id=value, is_active=True)
            except PositionType.DoesNotExist:
                raise serializers.ValidationError(f"Position type with ID {value} not found.")
        
        # If it's a string (code), look it up by code
        try:
            return PositionType.objects.get(code=value, is_active=True)
        except PositionType.DoesNotExist:
            raise serializers.ValidationError(f"Position type '{value}' not found.")
    
    def create(self, validated_data):
        """Create interview with pending status"""
        from applicants.models import Applicant
        applicant_id = validated_data.pop('applicant_id')
        applicant = Applicant.objects.get(id=applicant_id)
        
        validated_data['applicant'] = applicant
        validated_data['status'] = 'pending'
        
        interview = super().create(validated_data)
        
        # Update applicant status
        applicant.status = 'in_review'
        applicant.save()
        
        # Create processing queue entry
        from processing.models import ProcessingQueue
        ProcessingQueue.objects.create(
            interview=interview,
            status='queued'
        )
        
        return interview



class InterviewAnalysisSerializer(serializers.Serializer):
    """Serializer for interview analysis results"""
    
    interview_id = serializers.IntegerField()
    applicant_name = serializers.CharField()
    overall_score = serializers.FloatField()
    sentiment_score = serializers.FloatField()
    confidence_score = serializers.FloatField()
    speech_clarity_score = serializers.FloatField()
    content_relevance_score = serializers.FloatField()
    total_questions = serializers.IntegerField()
    answered_questions = serializers.IntegerField()
    recommendation = serializers.CharField()
    video_responses = VideoResponseSerializer(many=True)
    
    def to_representation(self, instance):
        """Custom representation for analysis data"""
        video_responses = instance.video_responses.all()
        
        # Calculate average scores across all AI analyses
        total_overall = 0
        total_sentiment = 0
        total_confidence = 0
        total_clarity = 0
        total_content = 0
        count = 0
        
        for response in video_responses:
            if hasattr(response, 'ai_analysis'):
                ai = response.ai_analysis
                total_overall += ai.overall_score
                total_sentiment += ai.sentiment_score
                total_confidence += ai.confidence_score
                total_clarity += ai.speech_clarity_score
                total_content += ai.content_relevance_score
                count += 1
        
        if count > 0:
            avg_overall = total_overall / count
            avg_sentiment = total_sentiment / count
            avg_confidence = total_confidence / count
            avg_clarity = total_clarity / count
            avg_content = total_content / count
        else:
            avg_overall = avg_sentiment = avg_confidence = avg_clarity = avg_content = 0
        
        # Determine recommendation based on overall score
        if avg_overall >= 70:
            recommendation = 'pass'
        elif avg_overall >= 50:
            recommendation = 'review'
        else:
            recommendation = 'fail'
        
        # Total questions = number of questions actually answered in this interview
        answered_count = video_responses.count()
        
        return {
            'interview_id': instance.id,
            'applicant_name': instance.applicant.full_name,
            'overall_score': round(avg_overall, 2),
            'sentiment_score': round(avg_sentiment, 2),
            'confidence_score': round(avg_confidence, 2),
            'speech_clarity_score': round(avg_clarity, 2),
            'content_relevance_score': round(avg_content, 2),
            'total_questions': answered_count,
            'answered_questions': answered_count,
            'recommendation': recommendation,
            'video_responses': VideoResponseSerializer(video_responses, many=True).data
        }


# New serializers for bulk processing approach


class VideoResponseUploadSerializer(serializers.ModelSerializer):
    """Simplified serializer for video upload WITHOUT immediate analysis"""
    
    video_file = serializers.FileField(write_only=True, source='video_file_path')
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = VideoResponse
        fields = [
            'id',
            'question_id',
            'video_file',
            'duration',
            'uploaded_at',
            'status'
        ]
        read_only_fields = ['id', 'uploaded_at', 'status']


class InterviewSubmissionResponseSerializer(serializers.Serializer):
    """Response serializer for interview submission"""
    
    message = serializers.CharField()
    queue_id = serializers.IntegerField()
    status = serializers.CharField()
    estimated_completion = serializers.CharField()


class ProcessingProgressSerializer(serializers.Serializer):
    """Serializer for processing progress details"""
    
    total_videos = serializers.IntegerField()
    processed = serializers.IntegerField()
    remaining = serializers.IntegerField()


class ProcessingStatusResponseSerializer(serializers.Serializer):
    """Response serializer for processing status"""
    
    status = serializers.CharField()
    progress = ProcessingProgressSerializer()
    estimated_time_remaining = serializers.CharField()
    message = serializers.CharField(required=False)
