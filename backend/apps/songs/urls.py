from rest_framework_nested import routers

from .views import ChordAnnotationViewSet, LyricLineViewSet, SongViewSet

router = routers.DefaultRouter()
router.register(r'songs', SongViewSet, basename='song')

songs_router = routers.NestedSimpleRouter(router, r'songs', lookup='song')
songs_router.register(r'lines', LyricLineViewSet, basename='song-lyricline')

lines_router = routers.NestedSimpleRouter(songs_router, r'lines', lookup='lyricline')
lines_router.register(r'chords', ChordAnnotationViewSet, basename='lyricline-chord')

urlpatterns = router.urls + songs_router.urls + lines_router.urls
