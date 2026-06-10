from django.urls import path
from rest_framework_nested import routers

from .views import JoinGroupView, MusicGroupViewSet

router = routers.DefaultRouter()
router.register(r'groups', MusicGroupViewSet, basename='musicgroup')

# Il path standalone deve venire PRIMA degli url del router per evitare ambiguità
urlpatterns = [
    path('groups/join/<uuid:token>/', JoinGroupView.as_view(), name='join_group'),
] + router.urls
