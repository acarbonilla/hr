"""
Token Usage Monitoring Models
Tracks all API calls to Gemini for cost analysis and optimization
"""

from django.db import models
from django.conf import settings


class TokenUsage(models.Model):
    """Track token usage for each API call"""
    
    OPERATION_TYPES = [
        ('transcription', 'Video Transcription'),
        ('analysis', 'Transcript Analysis'),
        ('batch_analysis', 'Batch Analysis'),
        ('other', 'Other'),
    ]
    
    # Request Info
    operation_type = models.CharField(max_length=50, choices=OPERATION_TYPES)
    interview = models.ForeignKey('interviews.Interview', on_delete=models.CASCADE, null=True, blank=True, related_name='token_usage')
    video_response = models.ForeignKey('interviews.VideoResponse', on_delete=models.CASCADE, null=True, blank=True, related_name='token_usage')
    
    # Token Counts
    input_tokens = models.IntegerField(default=0, help_text="Tokens sent to API (prompt)")
    output_tokens = models.IntegerField(default=0, help_text="Tokens received from API (response)")
    total_tokens = models.IntegerField(default=0, help_text="Total tokens used")
    
    # API Details
    model_name = models.CharField(max_length=100, default='gemini-2.5-flash')
    api_response_time = models.FloatField(null=True, blank=True, help_text="Response time in seconds")
    
    # Cost Calculation (approximate)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0, help_text="Estimated cost in USD")
    
    # Metadata
    prompt_length = models.IntegerField(default=0, help_text="Character count of prompt")
    response_length = models.IntegerField(default=0, help_text="Character count of response")
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'monitoring_token_usage'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['operation_type']),
            models.Index(fields=['interview']),
        ]
    
    def save(self, *args, **kwargs):
        """Auto-calculate total tokens and estimated cost"""
        self.total_tokens = self.input_tokens + self.output_tokens
        
        # Gemini 2.5 Flash pricing (as of Nov 2024)
        # Input: $0.075 per 1M tokens
        # Output: $0.30 per 1M tokens
        input_cost = (self.input_tokens / 1_000_000) * 0.075
        output_cost = (self.output_tokens / 1_000_000) * 0.30
        self.estimated_cost = input_cost + output_cost
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.operation_type} - {self.total_tokens} tokens - ${self.estimated_cost}"


class DailyTokenSummary(models.Model):
    """Aggregate daily token usage statistics"""
    
    date = models.DateField(unique=True)
    
    # Totals
    total_requests = models.IntegerField(default=0)
    total_input_tokens = models.BigIntegerField(default=0)
    total_output_tokens = models.BigIntegerField(default=0)
    total_tokens = models.BigIntegerField(default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Breakdown by operation
    transcription_requests = models.IntegerField(default=0)
    transcription_tokens = models.BigIntegerField(default=0)
    transcription_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    analysis_requests = models.IntegerField(default=0)
    analysis_tokens = models.BigIntegerField(default=0)
    analysis_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Performance
    avg_response_time = models.FloatField(default=0, help_text="Average API response time in seconds")
    success_rate = models.FloatField(default=100, help_text="Percentage of successful requests")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'monitoring_daily_summary'
        ordering = ['-date']
        verbose_name_plural = 'Daily Token Summaries'
    
    def __str__(self):
        return f"{self.date} - {self.total_tokens:,} tokens - ${self.total_cost}"
