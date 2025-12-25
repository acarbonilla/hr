import logging
import re

logger = logging.getLogger(__name__)

_BANNED_PATTERN = re.compile(r"(\d|%|score|rating|ai|model|algorithm)", re.IGNORECASE)


CATEGORY_FOCUS = {
    "network": {
        "pass": ["Troubleshooting approach", "Technical reasoning clarity"],
        "review": ["Communication clarity", "Problem explanation structure"],
        "fail": ["Structured troubleshooting", "Clear problem explanation"],
    },
    "it_support": {
        "pass": ["Customer empathy", "Issue triage discipline"],
        "review": ["Clear communication", "Problem explanation structure"],
        "fail": ["Communication clarity", "Customer handling under pressure"],
    },
    "customer_service": {
        "pass": ["Customer empathy", "Clear communication"],
        "review": ["De-escalation structure", "Problem explanation"],
        "fail": ["Communication clarity", "Customer handling under pressure"],
    },
}

DEFAULT_FOCUS = {
    "pass": ["Communication clarity", "Problem explanation structure"],
    "review": ["Structured responses", "Clear problem explanation"],
    "fail": ["Communication clarity", "Structured troubleshooting"],
}

SUMMARY_TEMPLATES = {
    "pass": (
        "You demonstrated strong alignment with the role and communicated your approach with confidence. "
        "To keep growing, focus on reinforcing your problem explanation and maintaining clear structure as you respond."
    ),
    "review": (
        "Your interview shows promising alignment with the role, with room to strengthen consistency. "
        "Prioritize clear structure and concise problem explanation to improve clarity across responses."
    ),
    "fail": (
        "Thank you for the effort you put into the interview. "
        "To improve alignment for similar roles, focus on building a clearer structure in your responses and "
        "strengthening how you explain your approach."
    ),
}

FALLBACK_SUMMARY = (
    "Thank you for completing the interview. "
    "We encourage you to keep strengthening clear communication and structured problem explanation."
)


def _sanitize_text(text):
    if not text:
        return ""
    if _BANNED_PATTERN.search(text):
        return ""
    return text


def _sanitize_list(items):
    safe = []
    for item in items or []:
        cleaned = _sanitize_text(item)
        if cleaned:
            safe.append(cleaned)
    return safe


def generate_developmental_feedback(decision, category_code=None, override_text=None):
    decision_key = (decision or "").strip().lower()
    if decision_key not in {"pass", "review", "fail"}:
        decision_key = "review"

    if override_text:
        cleaned_override = _sanitize_text(override_text)
        if cleaned_override:
            return cleaned_override, []
        logger.warning("Feedback override rejected due to unsafe content.")

    category_key = (category_code or "").strip().lower()
    focus_map = CATEGORY_FOCUS.get(category_key, DEFAULT_FOCUS)
    focus_items = _sanitize_list(focus_map.get(decision_key, DEFAULT_FOCUS["review"]))

    summary = _sanitize_text(SUMMARY_TEMPLATES.get(decision_key, FALLBACK_SUMMARY))
    if not summary:
        summary = FALLBACK_SUMMARY
    if not focus_items:
        focus_items = _sanitize_list(DEFAULT_FOCUS.get(decision_key, DEFAULT_FOCUS["review"]))

    return summary, focus_items
