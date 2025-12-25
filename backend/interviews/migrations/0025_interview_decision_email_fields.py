from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("interviews", "0024_interview_selected_question_metadata"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="interview",
            name="final_decision",
            field=models.CharField(
                blank=True,
                choices=[("pass", "Pass"), ("review", "Review"), ("fail", "Fail")],
                help_text="HR decision outcome for applicant notification (pass/review/fail)",
                max_length=10,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="decision_set_by",
            field=models.ForeignKey(
                blank=True,
                help_text="HR user who set the final decision",
                null=True,
                on_delete=models.SET_NULL,
                related_name="interview_decisions",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="decision_set_at",
            field=models.DateTimeField(
                blank=True,
                help_text="Timestamp when HR set the final decision",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="email_sent",
            field=models.BooleanField(
                default=False,
                help_text="Whether the decision email has been sent",
            ),
        ),
        migrations.AddField(
            model_name="interview",
            name="email_sent_at",
            field=models.DateTimeField(
                blank=True,
                help_text="Timestamp when decision email was sent",
                null=True,
            ),
        ),
    ]
