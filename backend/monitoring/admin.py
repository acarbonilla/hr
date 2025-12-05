"""
Admin interface for Token Usage Monitoring
"""

from django.contrib import admin
from .models import TokenUsage, DailyTokenSummary


@admin.register(TokenUsage)
class TokenUsageAdmin(admin.ModelAdmin):
    list_display = ['id', 'operation_type', 'total_tokens', 'estimated_cost', 'success', 'created_at']
    list_filter = ['operation_type', 'success', 'created_at']
    search_fields = ['interview__id', 'video_response__id', 'error_message']
    readonly_fields = ['total_tokens', 'estimated_cost', 'created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Operation', {
            'fields': ('operation_type', 'interview', 'video_response', 'model_name')
        }),
        ('Token Usage', {
            'fields': ('input_tokens', 'output_tokens', 'total_tokens', 'estimated_cost')
        }),
        ('Performance', {
            'fields': ('api_response_time', 'success', 'error_message')
        }),
        ('Details', {
            'fields': ('prompt_length', 'response_length', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DailyTokenSummary)
class DailyTokenSummaryAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_requests', 'total_tokens', 'total_cost', 'success_rate', 'avg_response_time']
    list_filter = ['date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Summary', {
            'fields': ('date', 'total_requests', 'total_tokens', 'total_cost', 'success_rate', 'avg_response_time')
        }),
        ('Transcription', {
            'fields': ('transcription_requests', 'transcription_tokens', 'transcription_cost')
        }),
        ('Analysis', {
            'fields': ('analysis_requests', 'analysis_tokens', 'analysis_cost')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
