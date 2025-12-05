from django.db import models


class Applicant(models.Model):
    """Model for job applicants"""
    
    APPLICATION_SOURCE_CHOICES = [
        ('walk_in', 'Walk-in'),
        ('online', 'Online Website'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_review', 'In Review'),
        ('passed', 'Passed - Interview'),
        ('failed', 'Failed - Interview'),
        ('hired', 'Hired'),
        ('failed_training', 'Failed - Training'),
        ('failed_onboarding', 'Failed - Onboarding'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    application_source = models.CharField(max_length=10, choices=APPLICATION_SOURCE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    application_date = models.DateTimeField(auto_now_add=True)
    reapplication_date = models.DateField(null=True, blank=True, help_text="Date when applicant can reapply")
    
    # Geolocation fields for tracking application location
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text="Applicant's latitude during application")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text="Applicant's longitude during application")
    distance_from_office = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Distance in meters from office")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applicants'
        verbose_name = 'Applicant'
        verbose_name_plural = 'Applicants'
        ordering = ['-application_date']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        """Override save to automatically set reapplication_date for failed and passed statuses"""
        from datetime import date, timedelta
        
        # Statuses that require waiting period before reapplication
        statuses_with_reapplication = ['failed', 'failed_training', 'failed_onboarding', 'passed']
        
        # Check if this is an update (pk exists) and status changed
        if self.pk:
            try:
                old_instance = Applicant.objects.get(pk=self.pk)
                # If status changed to a status that needs reapplication date
                if old_instance.status not in statuses_with_reapplication and self.status in statuses_with_reapplication:
                    # Different waiting periods for different statuses
                    if self.status == 'failed':  # Failed interview - 30 days
                        self.reapplication_date = date.today() + timedelta(days=30)
                    elif self.status == 'passed':  # Passed interview - 6 months (if they don't get hired)
                        self.reapplication_date = date.today() + timedelta(days=180)
                    elif self.status == 'failed_training':  # Failed training - 90 days
                        self.reapplication_date = date.today() + timedelta(days=90)
                    elif self.status == 'failed_onboarding':  # Failed onboarding - 180 days
                        self.reapplication_date = date.today() + timedelta(days=180)
            except Applicant.DoesNotExist:
                pass
        else:
            # New applicant being created with a status that needs reapplication date
            if self.status in statuses_with_reapplication:
                if self.status == 'failed':
                    self.reapplication_date = date.today() + timedelta(days=30)
                elif self.status == 'passed':
                    self.reapplication_date = date.today() + timedelta(days=180)
                elif self.status == 'failed_training':
                    self.reapplication_date = date.today() + timedelta(days=90)
                elif self.status == 'failed_onboarding':
                    self.reapplication_date = date.today() + timedelta(days=180)
        
        super().save(*args, **kwargs)


class ApplicantDocument(models.Model):
    """Model for storing applicant documents"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('resume', 'Resume'),
        ('cover_letter', 'Cover Letter'),
        ('id_document', 'ID Document'),
        ('certificate', 'Certificate'),
        ('other', 'Other'),
    ]
    
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file_path = models.FileField(upload_to='applicant_documents/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'applicant_documents'
        verbose_name = 'Applicant Document'
        verbose_name_plural = 'Applicant Documents'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.applicant.full_name} - {self.get_document_type_display()}"
