from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("interviews", "0026_interview_resume_retake_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="interview",
            name="email_last_error",
            field=models.TextField(blank=True, help_text="Last email delivery error, if any", null=True),
        ),
        migrations.AddField(
            model_name="interview",
            name="email_queued_at",
            field=models.DateTimeField(blank=True, help_text="Timestamp when email delivery was queued", null=True),
        ),
    ]
