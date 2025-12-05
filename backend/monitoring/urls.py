"""
URLs for Token Usage Monitoring API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TokenUsageViewSet, DailyTokenSummaryViewSet

router = DefaultRouter()
router.register(r'token-usage', TokenUsageViewSet, basename='token-usage')
router.register(r'daily-summary', DailyTokenSummaryViewSet, basename='daily-summary')

urlpatterns = [
    path('', include(router.urls)),
]
