from django.db import models
from applicants.models import Applicant

class TrainingModule(models.Model):
    """
    Categories of training, e.g., 'General Communication', 'Technical Skills'
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['order']

class TrainingSession(models.Model):
    """
    A user's practice session.
    """
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]

    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='training_sessions')
    module = models.ForeignKey(TrainingModule, on_delete=models.SET_NULL, null=True, related_name='sessions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.applicant.full_name} - {self.module.name if self.module else 'General'} - {self.created_at.strftime('%Y-%m-%d')}"

class TrainingResponse(models.Model):
    """
    Individual video response in a session.
    """
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='responses')
    question_text = models.TextField()
    video_file = models.FileField(upload_to='training_videos/%Y/%m/%d/')
    transcript = models.TextField(blank=True)
    
    # AI Feedback stored as JSON
    # Structure: {
    #   "strengths": ["..."],
    #   "improvements": ["..."],
    #   "coaching_tips": ["..."],
    #   "example_phrasing": "..."
    # }
    ai_feedback = models.JSONField(default=dict, blank=True)
    
    # Scores stored as JSON
    # Structure: { "clarity": 85, "confidence": 70, "relevance": 90 }
    scores = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response for {self.session} - {self.created_at.strftime('%H:%M')}"
