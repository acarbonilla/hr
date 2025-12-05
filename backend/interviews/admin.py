from django.contrib import admin
from .models import Interview, InterviewQuestion, VideoResponse, AIAnalysis
from .type_models import PositionType, QuestionType


@admin.register(PositionType)
class PositionTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'code']
    list_editable = ['is_active', 'order']
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description')
        }),
        ('Settings', {
            'fields': ('is_active', 'order')
        }),
    )


@admin.register(QuestionType)
class QuestionTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'code']
    list_editable = ['is_active', 'order']
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description')
        }),
        ('Settings', {
            'fields': ('is_active', 'order')
        }),
    )


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'position_type', 'question_type', 'order', 'is_active', 'created_at']
    list_filter = ['position_type', 'question_type', 'is_active']
    search_fields = ['question_text']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('Question Details', {
            'fields': ('question_text', 'position_type', 'question_type', 'max_duration')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'interview_type', 'status', 'created_at', 'completed_at']
    list_filter = ['interview_type', 'status', 'created_at']
    search_fields = ['applicant__first_name', 'applicant__last_name', 'applicant__email']
    readonly_fields = ['created_at']


@admin.register(VideoResponse)
class VideoResponseAdmin(admin.ModelAdmin):
    list_display = ['interview', 'question', 'duration', 'processed', 'uploaded_at']
    list_filter = ['processed', 'uploaded_at']
    search_fields = ['interview__applicant__first_name', 'interview__applicant__last_name']


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['video_response', 'overall_score', 'recommendation', 'analyzed_at']
    list_filter = ['recommendation', 'analyzed_at']
    search_fields = ['video_response__interview__applicant__first_name', 
                     'video_response__interview__applicant__last_name']
    readonly_fields = ['analyzed_at']
