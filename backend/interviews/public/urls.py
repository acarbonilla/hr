from django.urls import path
from .views import (
    PublicInterviewCreateView,
    PublicInterviewRetrieveView,
    PublicQuestionListView,
    PublicPositionTypeLookupView,
    PublicPositionTypeView,
    PublicPositionTypeViewSet,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'position-types', PublicPositionTypeViewSet, basename='public-position-types')

urlpatterns = [
    path("interviews/", PublicInterviewCreateView.as_view(), name="public-interview-create"),
    path("interviews/<int:pk>/", PublicInterviewRetrieveView.as_view(), name="public-interview-retrieve"),
    path("interviews/<int:pk>/questions/", PublicQuestionListView.as_view(), name="public-interview-questions"),
    path("position-types/", PublicPositionTypeView.as_view(), name="public-position-types"),
]

urlpatterns += router.urls
