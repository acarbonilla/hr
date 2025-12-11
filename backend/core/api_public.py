from rest_framework.routers import DefaultRouter
from interviews.public.views import PublicPositionTypeViewSet

public_router = DefaultRouter()
public_router.register(r'position-types', PublicPositionTypeViewSet, basename='public-position-types')
