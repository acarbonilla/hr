from django.contrib import admin
from .models import Notification, EmailTemplate


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['template_name', 'template_type', 'subject', 'is_active', 'updated_at']
    list_filter = ['template_type', 'is_active', 'created_at']
    search_fields = ['template_name', 'subject']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'notification_type', 'status', 'sent_at', 'created_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['applicant__first_name', 'applicant__last_name', 'applicant__email']
    readonly_fields = ['created_at', 'sent_at']
