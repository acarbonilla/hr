from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0001_initial"),
        ("interviews", "0025_interview_decision_email_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="DecisionEmailLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("decision", models.CharField(max_length=10)),
                ("sent_at", models.DateTimeField(auto_now_add=True)),
                (
                    "applicant",
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="decision_email_logs", to="applicants.applicant"),
                ),
                (
                    "email_sent_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="decision_email_logs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "interview",
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="decision_email_logs", to="interviews.interview"),
                ),
            ],
            options={
                "verbose_name": "Decision Email Log",
                "verbose_name_plural": "Decision Email Logs",
                "db_table": "decision_email_logs",
                "ordering": ["-sent_at"],
            },
        ),
    ]
