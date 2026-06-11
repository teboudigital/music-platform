from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.permissions import IsAuthenticated

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/', include('apps.songs.urls')),
    path('api/v1/', include('apps.groups.urls')),
    path('api/v1/', include('apps.setlists.urls')),

    # API Docs — protetti da autenticazione JWT
    path('api/v1/schema/', SpectacularAPIView.as_view(permission_classes=[IsAuthenticated]), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[IsAuthenticated]), name='swagger-ui'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[IsAuthenticated]), name='redoc'),
]
