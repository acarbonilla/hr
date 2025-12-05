"""
Serializers for Token Usage Monitoring API
"""

from rest_framework import serializers
from .models import TokenUsage, DailyTokenSummary


class TokenUsageSerializer(serializers.ModelSerializer):
    """Detailed token usage record"""
    
    interview_id = serializers.IntegerField(source='interview.id', read_only=True)
    video_response_id = serializers.IntegerField(source='video_response.id', read_only=True)
    operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    
    class Meta:
        model = TokenUsage
        fields = [
            'id',
            'operation_type',
            'operation_type_display',
            'interview_id',
            'video_response_id',
            'input_tokens',
            'output_tokens',
            'total_tokens',
            'model_name',
            'api_response_time',
            'estimated_cost',
            'prompt_length',
            'response_length',
            'success',
            'error_message',
            'created_at'
        ]


class DailyTokenSummarySerializer(serializers.ModelSerializer):
    """Daily aggregated token usage"""
    
    class Meta:
        model = DailyTokenSummary
        fields = [
            'id',
            'date',
            'total_requests',
            'total_input_tokens',
            'total_output_tokens',
            'total_tokens',
            'total_cost',
            'transcription_requests',
            'transcription_tokens',
            'transcription_cost',
            'analysis_requests',
            'analysis_tokens',
            'analysis_cost',
            'avg_response_time',
            'success_rate',
            'created_at',
            'updated_at'
        ]


class TokenUsageStatsSerializer(serializers.Serializer):
    """Overall token usage statistics"""
    
    total_requests = serializers.IntegerField()
    total_tokens = serializers.IntegerField()
    total_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    today_requests = serializers.IntegerField()
    today_tokens = serializers.IntegerField()
    today_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    this_month_requests = serializers.IntegerField()
    this_month_tokens = serializers.IntegerField()
    this_month_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    avg_tokens_per_transcription = serializers.FloatField()
    avg_tokens_per_analysis = serializers.FloatField()
    avg_cost_per_interview = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    success_rate = serializers.FloatField()
    avg_response_time = serializers.FloatField()
