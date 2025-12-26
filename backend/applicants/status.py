from typing import Optional

from django.db.models import Case, CharField, Q, Value, When

ACTIVE_INTERVIEW_STATUSES = ["pending", "in_progress", "submitted", "processing"]
COMPLETED_INTERVIEW_STATUSES = ["completed", "failed"]

PENDING_HR_DECISIONS = ["pending", "pending_hr_review", ""]
PENDING_REVIEW_DECISIONS = ["pending", "pending_hr_review", "hold", "on_hold", ""]
REJECTED_HR_DECISIONS = ["reject", "rejected", "failed"]
HIRED_HR_DECISIONS = ["hire", "hired"]
HOLD_HR_DECISIONS = ["hold", "on_hold"]


def build_pending_decision_q(field_name: str) -> Q:
    return Q(**{f"{field_name}__isnull": True}) | Q(**{f"{field_name}__in": PENDING_HR_DECISIONS})


def build_pending_review_q(field_name: str) -> Q:
    return Q(**{f"{field_name}__isnull": True}) | Q(**{f"{field_name}__in": PENDING_REVIEW_DECISIONS})


def build_applicant_status_case(
    latest_decision_field: str = "latest_interview_decision",
    latest_status_field: str = "latest_interview_status",
    has_interview_field: str = "has_interview",
    has_active_interview_field: str = "has_active_interview",
    status_field: str = "status",
    reapplication_date_field: str = "reapplication_date",
    result_decision_field: Optional[str] = None,
    result_exists_field: Optional[str] = None,
    today_value=None,
):
    result_exists_q = Q()
    if result_decision_field and result_exists_field:
        result_exists_q = Q(**{result_exists_field: True})

    pending_decision_q = build_pending_decision_q(latest_decision_field)
    failed_pending_q = Q(**{latest_status_field: "failed"}) & pending_decision_q
    result_pending_q = (
        build_pending_decision_q(result_decision_field) if result_decision_field else Q()
    )

    failed_reapply_q = Q(**{f"{status_field}__in": ["failed", "failed_training", "failed_onboarding"]})
    if today_value is not None:
        failed_cooldown_q = failed_reapply_q & Q(**{f"{reapplication_date_field}__gt": today_value})
        eligible_reapply_q = failed_reapply_q & (
            Q(**{f"{reapplication_date_field}__lte": today_value}) | Q(**{f"{reapplication_date_field}__isnull": True})
        )
    else:
        failed_cooldown_q = failed_reapply_q
        eligible_reapply_q = failed_reapply_q

    whens = [When(Q(**{has_interview_field: False}), then=Value("no_interview"))]
    if result_decision_field and result_exists_field:
        whens.extend(
            [
                When(
                    result_exists_q & Q(**{f"{result_decision_field}__in": REJECTED_HR_DECISIONS}),
                    then=Value("failed_cooldown"),
                ),
                When(
                    result_exists_q & Q(**{f"{result_decision_field}__in": HIRED_HR_DECISIONS}),
                    then=Value("hired"),
                ),
                When(
                    result_exists_q & Q(**{f"{result_decision_field}__in": HOLD_HR_DECISIONS}),
                    then=Value("on_hold"),
                ),
                When(result_exists_q & result_pending_q, then=Value("pending_hr_decision")),
            ]
        )

    whens.extend(
        [
            When(
                Q(**{f"{latest_decision_field}__in": REJECTED_HR_DECISIONS}) | failed_pending_q,
                then=Value("failed_cooldown"),
            ),
            When(Q(**{f"{latest_decision_field}__in": HIRED_HR_DECISIONS}), then=Value("hired")),
            When(Q(**{f"{latest_decision_field}__in": HOLD_HR_DECISIONS}), then=Value("on_hold")),
            When(Q(**{has_active_interview_field: True}), then=Value("interview_in_progress")),
            When(
                Q(**{f"{latest_status_field}__in": COMPLETED_INTERVIEW_STATUSES}) & pending_decision_q,
                then=Value("pending_hr_decision"),
            ),
            When(Q(**{status_field: "hired"}), then=Value("hired")),
            When(failed_cooldown_q, then=Value("failed_cooldown")),
            When(eligible_reapply_q, then=Value("eligible_reapply")),
        ]
    )

    return Case(
        *whens,
        default=Value("interview_in_progress"),
        output_field=CharField(),
    )


def get_applicant_status_label(status_key: Optional[str]) -> str:
    labels = {
        "no_interview": "No Interview",
        "interview_in_progress": "Interview In Progress",
        "pending_hr_decision": "Pending HR Decision",
        "failed_cooldown": "Failed (Cooldown)",
        "eligible_reapply": "Eligible to Reapply",
        "hired": "Hired",
        "on_hold": "On Hold",
    }
    return labels.get(status_key or "", "Interview In Progress")
