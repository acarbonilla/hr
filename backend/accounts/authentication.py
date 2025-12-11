import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from applicants.models import Applicant
from datetime import datetime, timedelta


APPLICANT_SECRET = getattr(settings, "APPLICANT_SECRET", settings.SECRET_KEY)
APPLICANT_TOKEN_EXPIRY_HOURS = getattr(settings, "APPLICANT_TOKEN_EXPIRY_HOURS", 12)


def generate_applicant_token(applicant_id, expiry_hours=None):
    expiry_hours = expiry_hours or APPLICANT_TOKEN_EXPIRY_HOURS
    exp = datetime.utcnow() + timedelta(hours=expiry_hours)
    payload = {
        "sub": "applicant",
        "applicant_id": applicant_id,
        "exp": exp,
        "type": "applicant",
    }
    return jwt.encode(payload, APPLICANT_SECRET, algorithm="HS256")


class ApplicantTokenAuthentication(BaseAuthentication):
    """
    Simple JWT auth for applicants only, using a dedicated secret.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization") or ""
        if not auth_header.startswith(f"{self.keyword} "):
            return None

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(token, APPLICANT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Applicant token expired")
        except jwt.InvalidTokenError:
            # slight delay to reduce brute force attempts
            import time
            time.sleep(1)
            raise AuthenticationFailed("Invalid applicant token")

        if payload.get("type") != "applicant":
            raise AuthenticationFailed("Invalid applicant token type")

        applicant_id = payload.get("applicant_id")
        if not applicant_id:
            raise AuthenticationFailed("Invalid applicant token payload")

        try:
            applicant = Applicant.objects.get(id=applicant_id)
        except Applicant.DoesNotExist:
            raise AuthenticationFailed("Applicant not found")

        # Mark as authenticated
        setattr(applicant, "is_authenticated", True)
        return (applicant, None)
