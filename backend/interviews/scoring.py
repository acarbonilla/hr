from __future__ import annotations

from typing import Dict, Iterable, Tuple

ROLE_PROFILES: Dict[str, Dict[str, float]] = {
    "technical_core": {
        "troubleshooting": 0.35,
        "technical_reasoning": 0.35,
        "networking_concepts": 0.10,
        "problem_explanation": 0.10,
        "communication": 0.05,
        "customer_handling": 0.05,
        "sales_upselling": 0.00,
    },
    "communication_core": {
        "communication": 0.40,
        "customer_handling": 0.30,
        "problem_explanation": 0.15,
        "technical_reasoning": 0.10,
        "troubleshooting": 0.05,
        "sales_upselling": 0.00,
        "networking_concepts": 0.00,
    },
    "mixed_role": {
        "communication": 0.25,
        "problem_explanation": 0.20,
        "technical_reasoning": 0.20,
        "customer_handling": 0.15,
        "troubleshooting": 0.10,
        "networking_concepts": 0.05,
        "sales_upselling": 0.05,
    },
}

ROLE_PROFILE_BY_CODE: Dict[str, str] = {
    "network_engineer": "technical_core",
    "customer_service": "communication_core",
    "virtual_assistant": "mixed_role",
    "general": "mixed_role",
}


def normalize_role_code(code: str | None) -> str:
    if not code:
        return ""
    return code.strip().lower().replace("-", "_").replace(" ", "_")


def get_role_profile(role_code: str | None) -> str:
    normalized = normalize_role_code(role_code)
    return ROLE_PROFILE_BY_CODE.get(normalized, "")


def get_role_competency_weights(role_code: str | None, competencies: Iterable[str]) -> Dict[str, float]:
    role_profile = get_role_profile(role_code)
    base_weights = ROLE_PROFILES.get(role_profile)
    if base_weights is None:
        return {competency: 1.0 for competency in competencies}

    weights = {competency: float(base_weights.get(competency, 0.0)) for competency in competencies}
    total = sum(weights.values())
    if total <= 0:
        return {competency: 1.0 for competency in competencies}
    return {competency: value / total for competency, value in weights.items()}


def summarize_core_competencies(weights: Dict[str, float]) -> str:
    sorted_competencies = sorted(weights.items(), key=lambda item: item[1], reverse=True)
    return ", ".join([key for key, value in sorted_competencies if value > 0])


def get_role_prompt_context(role_code: str | None) -> Dict[str, str]:
    role_profile = get_role_profile(role_code)
    weights = ROLE_PROFILES.get(role_profile)
    if not weights:
        return {"role_profile": role_profile, "core_competencies": ""}

    core_competencies = summarize_core_competencies(weights)
    return {"role_profile": role_profile, "core_competencies": core_competencies}


def build_recommendation_explanation(
    raw_scores: Dict[str, float],
    weights_used: Dict[str, float],
    role_profile: str,
) -> str:
    if not raw_scores:
        return ""

    strongest = max(raw_scores.items(), key=lambda item: item[1])
    weakest = min(raw_scores.items(), key=lambda item: item[1])
    core_competencies = summarize_core_competencies(weights_used) if weights_used else ""
    role_label = role_profile or "balanced"
    return (
        f"Role profile '{role_label}' prioritizes {core_competencies or 'all competencies'}. "
        f"Strongest area: {strongest[0]} ({strongest[1]:.1f}). "
        f"Weakest area: {weakest[0]} ({weakest[1]:.1f})."
    )


def compute_competency_scores(
    scores_by_competency: Dict[str, Tuple[float, int]],
    role_code: str | None,
) -> Dict[str, object]:
    competencies = list(scores_by_competency.keys())
    weights = get_role_competency_weights(role_code, competencies)
    role_profile = get_role_profile(role_code)

    raw_scores: Dict[str, float] = {}
    weighted_scores: Dict[str, float] = {}
    total_weighted = 0.0
    total_weight = 0.0

    for competency, (total_score, count) in scores_by_competency.items():
        if count <= 0:
            continue
        average = total_score / count
        raw_scores[competency] = average
        weight = weights.get(competency, 0.0)
        weighted_scores[competency] = average * weight
        total_weighted += weighted_scores[competency]
        total_weight += weight

    final_weighted_score = (total_weighted / total_weight) if total_weight > 0 else 0.0

    explanation = build_recommendation_explanation(raw_scores, weights, role_profile)
    return {
        "raw_scores_per_competency": raw_scores,
        "weighted_scores_per_competency": weighted_scores,
        "final_weighted_score": final_weighted_score,
        "weights_used": weights,
        "role_profile": role_profile,
        "ai_recommendation_explanation": explanation,
    }
