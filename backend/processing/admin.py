from django.contrib import admin
from .models import ProcessingQueue, ProcessingLog


@admin.register(ProcessingQueue)
class ProcessingQueueAdmin(admin.ModelAdmin):
    list_display = ['interview', 'status', 'queued_at', 'started_at', 'completed_at']
    list_filter = ['status', 'queued_at']
    search_fields = ['interview__applicant__first_name', 'interview__applicant__last_name', 'celery_task_id']
    readonly_fields = ['queued_at', 'started_at', 'completed_at']


@admin.register(ProcessingLog)
class ProcessingLogAdmin(admin.ModelAdmin):
    list_display = ['queue_item', 'log_level', 'message', 'timestamp']
    list_filter = ['log_level', 'timestamp']
    search_fields = ['queue_item__interview__applicant__first_name', 'message']
    readonly_fields = ['timestamp']
