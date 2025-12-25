"""
Serializers for applicant history and comprehensive tracking
"""

from rest_framework import serializers
from applicants.models import Applicant
from interviews.models import Interview, VideoResponse
from results.models import InterviewResult
from processing.models import ProcessingQueue


class VideoResponseHistorySerializer(serializers.ModelSerializer):
    """Detailed video response for history view"""
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type.name', read_only=True)
    ai_analysis_summary = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoResponse
        fields = [
            'id',
            'question_text',
            'question_type',
            'video_file_path',
            'video_url',
            'transcript',
            'ai_score',
            'ai_analysis_summary',
            'sentiment',
            'hr_override_score',
            'hr_comments',
            'hr_reviewed_at',
            'status'
        ]
    
    def get_video_url(self, obj):
        """Get video file URL"""
        if obj.video_file_path:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file_path.url)
            return obj.video_file_path.url
        return None

    def get_ai_analysis_summary(self, obj):
        """Get AI analysis summary if available"""
        if hasattr(obj, 'ai_analysis') and obj.ai_analysis:
            analysis_data = obj.ai_analysis.langchain_analysis_data
            return analysis_data.get('analysis_summary', '') or analysis_data.get('raw_scores', {}).get('analysis_summary', '')
        return ''


class InterviewHistorySerializer(serializers.ModelSerializer):
    """Interview details for history view"""
    position = serializers.CharField(source='position_type.name', read_only=True)
    position_code = serializers.CharField(source='position_type.code', read_only=True)
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id',
            'position',
            'position_code',
            'status',
            'video_count',
            'created_at',
            'submission_date',
            'authenticity_flag',
            'authenticity_status'
        ]
    
    def get_video_count(self, obj):
        """Count of video responses"""
        return obj.video_responses.count()


class ApplicantHistorySerializer(serializers.ModelSerializer):
    """Comprehensive applicant history with all related data"""
    
    # Basic info
    full_name = serializers.CharField(read_only=True)
    
    # Interview info
    interview = serializers.SerializerMethodField()
    
    # Result info
    result = serializers.SerializerMethodField()
    
    # Processing info
    processing_status = serializers.SerializerMethodField()
    
    # Timeline
    days_since_application = serializers.SerializerMethodField()
    
    class Meta:
        model = Applicant
        fields = [
            'id',
            'full_name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'application_source',
            'status',
            'application_date',
            'reapplication_date',
            'latitude',
            'longitude',
            'distance_from_office',
            'interview',
            'result',
            'processing_status',
            'days_since_application',
            'created_at',
            'updated_at'
        ]
    
    def get_interview(self, obj):
        """Get interview details if exists"""
        try:
            interview = obj.interviews.first()
            if interview:
                return InterviewHistorySerializer(interview).data
        except:
            pass
        return None
    
    def get_result(self, obj):
        """Get result details if exists"""
        try:
            result = obj.results.first()
            if result:
                return {
                    'id': result.id,
                    'final_score': result.final_score,
                    'passed': result.passed,
                    'result_date': result.result_date,
                    'final_decision': result.final_decision,
                    'final_decision_date': result.final_decision_date,
                    'final_decision_by': result.final_decision_by.get_full_name() if result.final_decision_by else None,
                }
        except:
            pass
        return None
    
    def get_processing_status(self, obj):
        """Get processing queue status"""
        try:
            interview = obj.interviews.first()
            if interview:
                queue_entry = ProcessingQueue.objects.filter(interview=interview).first()
                if queue_entry:
                    return {
                        'status': queue_entry.status,
                        'queued_at': queue_entry.queued_at,
                        'started_at': queue_entry.started_at,
                        'completed_at': queue_entry.completed_at
                    }
        except:
            pass
        return None
    
    def get_days_since_application(self, obj):
        """Calculate days since application"""
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        delta = now - obj.application_date
        return delta.days


class ApplicantDetailHistorySerializer(serializers.ModelSerializer):
    """Full detailed history including all videos and analysis"""
    
    full_name = serializers.CharField(read_only=True)
    interview = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    video_responses = serializers.SerializerMethodField()
    processing_history = serializers.SerializerMethodField()
    
    class Meta:
        model = Applicant
        fields = [
            'id',
            'full_name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'application_source',
            'status',
            'application_date',
            'reapplication_date',
            'latitude',
            'longitude',
            'distance_from_office',
            'interview',
            'result',
            'video_responses',
            'processing_history',
            'created_at',
            'updated_at'
        ]
    
    def get_interview(self, obj):
        """Get full interview details"""
        try:
            interview = obj.interviews.first()
            if interview:
                return InterviewHistorySerializer(interview).data
        except:
            pass
        return None
    
    def get_result(self, obj):
        """Get full result details"""
        try:
            result = obj.results.first()
            if result:
                return {
                    'id': result.id,
                    'final_score': result.final_score,
                    'passed': result.passed,
                    'result_date': result.result_date,
                    'final_decision': result.final_decision,
                    'final_decision_date': result.final_decision_date,
                    'final_decision_by': result.final_decision_by.get_full_name() if result.final_decision_by else None,
                    'final_decision_notes': result.final_decision_notes,
                    'hr_portal_displayed': result.hr_portal_displayed,
                    'email_notification_sent': result.email_notification_sent
                }
        except:
            pass
        return None
    
    def get_video_responses(self, obj):
        """Get all video responses with full details"""
        try:
            interview = obj.interviews.first()
            if interview:
                video_responses = interview.video_responses.all().select_related('question', 'hr_reviewer', 'ai_analysis')
                return VideoResponseHistorySerializer(video_responses, many=True, context=self.context).data
        except:
            pass
        return []
    
    def get_processing_history(self, obj):
        """Get processing queue history"""
        try:
            interview = obj.interviews.first()
            if interview:
                queue_entries = ProcessingQueue.objects.filter(interview=interview).order_by('-queued_at')
                return [{
                    'id': entry.id,
                    'status': entry.status,
                    'added_at': entry.queued_at,
                    'started_at': entry.started_at,
                    'completed_at': entry.completed_at,
                    'error_message': entry.error_message
                } for entry in queue_entries]
        except:
            pass
        return []
