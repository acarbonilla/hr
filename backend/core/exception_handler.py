from rest_framework.response import Response
from rest_framework.views import exception_handler


def json_exception_handler(exc, context):
    """
    Ensure API errors always return JSON, even for unhandled exceptions.
    """
    response = exception_handler(exc, context)
    if response is not None:
        return response
    return Response({"detail": "Server error."}, status=500)
