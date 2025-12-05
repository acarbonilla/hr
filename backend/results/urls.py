from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterviewResultViewSet

router = DefaultRouter()
router.register(r'results', InterviewResultViewSet, basename='result')

urlpatterns = [
    path('', include(router.urls)),
]
