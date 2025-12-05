from django.contrib import admin
from .models import Applicant, ApplicantDocument


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'application_source', 'status', 'application_date']
    list_filter = ['application_source', 'status', 'application_date']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    readonly_fields = ['application_date', 'created_at', 'updated_at']


@admin.register(ApplicantDocument)
class ApplicantDocumentAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'document_type', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at']
    search_fields = ['applicant__first_name', 'applicant__last_name', 'applicant__email']
