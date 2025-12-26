from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("interviews", "0025_interview_decision_email_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="interview",
            name="attempt_number",
            field=models.PositiveIntegerField(default=1, help_text="Interview attempt number for the applicant"),
        ),
        migrations.AddField(
            model_name="interview",
            name="archived",
            field=models.BooleanField(
                default=False, help_text="Archived interviews are retired after HR-approved retake"
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="current_question_index",
            field=models.PositiveIntegerField(
                default=0, help_text="0-based index for next question when resuming an in-progress interview"
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="last_activity_at",
            field=models.DateTimeField(blank=True, help_text="Timestamp of the last applicant activity", null=True),
        ),
        migrations.AddField(
            model_name="interview",
            name="resumed_count",
            field=models.PositiveIntegerField(default=0, help_text="Number of times HR resent the interview link"),
        ),
        migrations.CreateModel(
            name="InterviewAuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event_type", models.CharField(choices=[("resume_access", "Resume Access"), ("resume_resend", "Resume Resend"), ("retake_approved", "Retake Approved")], max_length=30)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(blank=True, help_text="HR user who triggered the event (null for applicant access)", null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="interview_audit_logs", to=settings.AUTH_USER_MODEL)),
                ("interview", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="audit_logs", to="interviews.interview")),
            ],
            options={
                "db_table": "interview_audit_logs",
                "ordering": ["-created_at"],
            },
        ),
    ]
