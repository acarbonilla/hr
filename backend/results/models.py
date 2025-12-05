from django.db import models
from django.conf import settings
from applicants.models import Applicant
from interviews.models import Interview


class InterviewResult(models.Model):
    """Model for final interview results"""
    
    FINAL_DECISION_CHOICES = [
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ]
    
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='result')
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='results')
    final_score = models.FloatField(help_text="Final aggregated score")
    passed = models.BooleanField(default=False)
    result_date = models.DateTimeField(auto_now_add=True)
    
    # HR Review and Final Decision fields
    final_decision = models.CharField(
        max_length=20, 
        choices=FINAL_DECISION_CHOICES, 
        null=True, 
        blank=True,
        help_text="Final hiring decision made by HR"
    )
    final_decision_date = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When HR made the final decision"
    )
    final_decision_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='final_decisions',
        help_text="HR person who made the final decision"
    )
    final_decision_notes = models.TextField(
        blank=True,
        help_text="HR notes about the final decision"
    )
    
    # Tracking for display and notifications
    hr_portal_displayed = models.BooleanField(default=False, help_text="Whether result is displayed in HR portal")
    email_notification_sent = models.BooleanField(default=False, help_text="Whether email notification was sent")
    
    class Meta:
        db_table = 'interview_results'
        verbose_name = 'Interview Result'
        verbose_name_plural = 'Interview Results'
        ordering = ['-result_date']
    
    def __str__(self):
        status = "PASSED" if self.passed else "FAILED"
        return f"{self.applicant.full_name} - {status} (Score: {self.final_score})"


class ReapplicationTracking(models.Model):
    """Model for tracking applicant reapplication eligibility"""
    
    applicant = models.OneToOneField(Applicant, on_delete=models.CASCADE, related_name='reapplication_tracking')
    last_application_date = models.DateField()
    can_reapply_after = models.DateField(help_text="Date when applicant can reapply (2-3 weeks from last application)")
    reapplication_count = models.IntegerField(default=0, help_text="Number of times applicant has reapplied")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reapplication_tracking'
        verbose_name = 'Reapplication Tracking'
        verbose_name_plural = 'Reapplication Tracking'
        ordering = ['-last_application_date']
    
    def __str__(self):
        return f"{self.applicant.full_name} - Can reapply after {self.can_reapply_after}"
    
    @property
    def is_eligible_to_reapply(self):
        """Check if applicant is eligible to reapply"""
        from datetime import date
        return date.today() >= self.can_reapply_after
