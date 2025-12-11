from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from accounts.authentication import generate_applicant_token, APPLICANT_SECRET
from applicants.models import Applicant
import jwt
import time
import logging
from accounts.permissions import RolePermission

logger = logging.getLogger(__name__)


class MagicLoginView(APIView):
    """
    Validate applicant magic link token and return minimal data.
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request, token):
        try:
            payload = jwt.decode(token, APPLICANT_SECRET, algorithms=["HS256"])
            if payload.get("type") != "applicant":
                raise jwt.InvalidTokenError("Invalid token type")
            applicant_id = payload.get("applicant_id")
            applicant = Applicant.objects.filter(id=applicant_id).first()
            if not applicant:
                raise jwt.InvalidTokenError("Applicant not found")

            logger.info(f"Applicant {applicant_id} accessed magic link from {request.META.get('REMOTE_ADDR')}")

            return Response(
                {
                    "valid": True,
                    "applicant_id": applicant_id,
                    "token": token,
                },
                status=status.HTTP_200_OK,
            )
        except jwt.ExpiredSignatureError:
            return Response({"valid": False, "reason": "expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError as e:
            time.sleep(1)
            return Response({"valid": False, "reason": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class RefreshApplicantTokenView(APIView):
    """
    Generate a fresh applicant token (for resend).
    """

    authentication_classes = []
    permission_classes = [RolePermission(required_roles=["HR", "ADMIN", "SUPERADMIN"])]

    def post(self, request):
        applicant_id = request.data.get("applicant_id")
        applicant = Applicant.objects.filter(id=applicant_id).first()
        if not applicant:
            return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

        token = generate_applicant_token(applicant.id)
        return Response(
            {
                "token": token,
                "redirect_url": f"/interview-login/{token}/",
            },
            status=status.HTTP_200_OK,
        )


class HRResendInterviewLinkView(APIView):
    """
    HR endpoint to generate and return a fresh magic login URL.
    """

    permission_classes = [RolePermission(required_roles=["HR", "ADMIN", "SUPERADMIN"])]

    def post(self, request, applicant_id):
        applicant = Applicant.objects.filter(id=applicant_id).first()
        if not applicant:
            return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

        token = generate_applicant_token(applicant.id)
        url = f"/interview-login/{token}/"
        return Response({"url": url}, status=status.HTTP_200_OK)
