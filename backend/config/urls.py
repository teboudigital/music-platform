from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/', include('apps.songs.urls')),
    path('api/v1/', include('apps.groups.urls')),
    path('api/v1/', include('apps.setlists.urls')),
]
