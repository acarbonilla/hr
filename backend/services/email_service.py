from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import escape

from interviews.models import Interview
from notifications.feedback import generate_developmental_feedback
from notifications.models import DecisionEmailLog


DECISION_TEMPLATE_MAP = {
    "pass": ("notifications/pass_email.txt", "notifications/pass_email.html", "Interview Update: Next Steps"),
    "review": ("notifications/review_email.txt", "notifications/review_email.html", "Interview Update: Under Review"),
    "fail": ("notifications/fail_email.txt", "notifications/fail_email.html", "Interview Update"),
}


def _append_custom_message(text_body, html_body, custom_message):
    cleaned = (custom_message or "").strip()
    if not cleaned:
        return text_body, html_body

    text_body = f"{text_body}\n\nAdditional notes from HR:\n{cleaned}\n"
    html_body = f"{html_body}\n<hr>\n<p><strong>Additional notes from HR:</strong></p>\n<p>{escape(cleaned)}</p>\n"
    return text_body, html_body


def send_decision_email(
    interview_id,
    custom_message=None,
    sent_by=None,
    include_feedback=True,
    feedback_override=None,
):
    interview = (
        Interview.objects.select_related("applicant", "position_type")
        .only("id", "final_decision", "email_sent", "applicant__email", "applicant__first_name", "applicant__last_name", "position_type__code")
        .get(id=interview_id)
    )

    if interview.email_sent:
        raise ValueError("Decision email has already been sent.")

    decision = (interview.final_decision or "").lower()
    if decision not in DECISION_TEMPLATE_MAP:
        raise ValueError("Final decision must be set before sending email.")

    applicant = interview.applicant
    if not applicant or not applicant.email:
        raise ValueError("Applicant email is missing.")

    text_template, html_template, subject = DECISION_TEMPLATE_MAP[decision]
    feedback_summary = ""
    feedback_focus_items = []
    if include_feedback:
        position_code = getattr(interview.position_type, "code", None) or ""
        feedback_summary, feedback_focus_items = generate_developmental_feedback(
            decision=decision,
            category_code=position_code,
            override_text=feedback_override,
        )
    first_name = getattr(applicant, "first_name", "") or ""
    last_name = getattr(applicant, "last_name", "") or ""
    full_name = f"{first_name} {last_name}".strip()
    context = {
        "applicant_name": full_name or first_name or "Applicant",
        "position_code": getattr(interview.position_type, "code", None) or "",
        "feedback_summary": feedback_summary,
        "feedback_focus_items": feedback_focus_items,
    }
    text_body = render_to_string(text_template, context).strip()
    html_body = render_to_string(html_template, context).strip()

    text_body, html_body = _append_custom_message(text_body, html_body, custom_message)

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        to=[applicant.email],
    )
    if html_body:
        message.attach_alternative(html_body, "text/html")
    message.send()

    interview.email_sent = True
    interview.email_sent_at = timezone.now()
    interview.save(update_fields=["email_sent", "email_sent_at"])

    DecisionEmailLog.objects.create(
        interview=interview,
        applicant=applicant,
        decision=decision,
        email_sent_by=sent_by,
    )
