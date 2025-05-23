from rest_framework.routers import DefaultRouter
from management.views import ManagementViewSet

router = DefaultRouter()
router.register(r'', ManagementViewSet, basename='management')

urlpatterns = router.urls