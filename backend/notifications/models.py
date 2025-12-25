from django.conf import settings
from django.db import models
from applicants.models import Applicant
from interviews.models import Interview


class EmailTemplate(models.Model):
    """Model for email templates"""
    
    TEMPLATE_TYPE_CHOICES = [
        ('application_received', 'Application Received'),
        ('interview_passed', 'Interview Passed'),
        ('interview_failed', 'Interview Failed'),
        ('reapplication_allowed', 'Reapplication Allowed'),
        ('reminder', 'Reminder'),
    ]
    
    template_name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPE_CHOICES)
    subject = models.CharField(max_length=200)
    body_html = models.TextField(help_text="HTML version of the email body")
    body_text = models.TextField(help_text="Plain text version of the email body")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'
        ordering = ['template_name']
    
    def __str__(self):
        return f"{self.template_name} - {self.get_template_type_display()}"


class Notification(models.Model):
    """Model for notifications sent to applicants"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPE_CHOICES, default='email')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    message_content = models.TextField()
    delivery_status = models.TextField(blank=True, help_text="Delivery status message from provider")
    
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_notification_type_display()} to {self.applicant.full_name} - {self.status}"


class DecisionEmailLog(models.Model):
    """Audit log for HR-sent decision emails"""

    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='decision_email_logs')
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='decision_email_logs')
    decision = models.CharField(max_length=10)
    email_sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='decision_email_logs',
    )
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'decision_email_logs'
        verbose_name = 'Decision Email Log'
        verbose_name_plural = 'Decision Email Logs'
        ordering = ['-sent_at']

    def __str__(self):
        return f"Decision email {self.decision} for {self.applicant.full_name} at {self.sent_at}"
