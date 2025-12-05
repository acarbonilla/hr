from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewViewSet,
    InterviewQuestionViewSet,
    PositionTypeViewSet,
    QuestionTypeViewSet
)

router = DefaultRouter()
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'questions', InterviewQuestionViewSet, basename='question')
router.register(r'position-types', PositionTypeViewSet, basename='position-type')
router.register(r'question-types', QuestionTypeViewSet, basename='question-type')

urlpatterns = [
    path('', include(router.urls)),
]
