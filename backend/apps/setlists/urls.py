from rest_framework_nested import routers

from .views import SetlistItemViewSet, SetlistViewSet

router = routers.DefaultRouter()
router.register(r'setlists', SetlistViewSet, basename='setlist')

setlists_router = routers.NestedSimpleRouter(router, r'setlists', lookup='setlist')
setlists_router.register(r'items', SetlistItemViewSet, basename='setlist-item')

urlpatterns = router.urls + setlists_router.urls
