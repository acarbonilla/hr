from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingModuleViewSet, TrainingSessionViewSet

router = DefaultRouter()
router.register(r'modules', TrainingModuleViewSet)
router.register(r'sessions', TrainingSessionViewSet, basename='training-session')

urlpatterns = [
    path('', include(router.urls)),
]
