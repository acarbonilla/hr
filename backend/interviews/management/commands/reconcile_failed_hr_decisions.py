from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from interviews.models import Interview
from results.models import InterviewResult


class Command(BaseCommand):
    help = "Auto-reject pending HR decisions for failed interviews (and related results)."

    def handle(self, *args, **options):
        pending_states = ["pending", "pending_hr_review", ""]
        pending_filter = Q(hr_decision__isnull=True) | Q(hr_decision__in=pending_states)
        now = timezone.now()

        interview_qs = Interview.objects.filter(status="failed").filter(pending_filter)
        interview_count = interview_qs.count()
        interview_qs.update(hr_decision="reject", hr_decision_at=now)

        result_qs = InterviewResult.objects.filter(interview__status="failed").filter(pending_filter)
        result_count = result_qs.count()
        result_qs.update(hr_decision="reject", hr_decision_at=now)

        self.stdout.write(
            f"Updated {interview_count} interview(s) and {result_count} result(s) to hr_decision=reject."
        )
