from django.db import models
from interviews.models import Interview


class ProcessingQueue(models.Model):
    """Model for managing async processing queue"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    PROCESSING_TYPE_CHOICES = [
        ('bulk_analysis', 'Bulk Analysis'),
        ('single_video', 'Single Video'),
        ('reprocessing', 'Reprocessing'),
    ]
    
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='processing_queues')
    processing_type = models.CharField(
        max_length=20, 
        choices=PROCESSING_TYPE_CHOICES, 
        default='bulk_analysis',
        help_text="Type of processing"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    celery_task_id = models.CharField(max_length=255, blank=True, help_text="Celery task ID for tracking")
    error_message = models.TextField(blank=True, help_text="Error message if processing failed")
    
    created_at = models.DateTimeField(auto_now_add=True)
    queued_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'processing_queue'
        verbose_name = 'Processing Queue Item'
        verbose_name_plural = 'Processing Queue'
        ordering = ['queued_at']
    
    def __str__(self):
        return f"Queue: {self.interview.applicant.full_name} - {self.status}"


class ProcessingLog(models.Model):
    """Model for logging processing activities"""
    
    LOG_LEVEL_CHOICES = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    queue_item = models.ForeignKey(ProcessingQueue, on_delete=models.CASCADE, related_name='logs')
    log_level = models.CharField(max_length=10, choices=LOG_LEVEL_CHOICES, default='info')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'processing_logs'
        verbose_name = 'Processing Log'
        verbose_name_plural = 'Processing Logs'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"[{self.log_level.upper()}] {self.queue_item.interview.applicant.full_name} - {self.timestamp}"
