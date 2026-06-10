from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from apps.common.throttling import LoginRateThrottle
from .views import ChangeEmailView, ChangePasswordView, DeleteAccountView, ExportDataView, MeView, PasswordResetConfirmView, PasswordResetRequestView, ProfileView, RegisterView


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """TokenObtainPairView con throttle anti brute-force sul login."""
    throttle_classes = [LoginRateThrottle]


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', MeView.as_view(), name='me'),
    path('me/profile/', ProfileView.as_view(), name='profile'),
    path('me/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('me/change-email/', ChangeEmailView.as_view(), name='change_email'),
    path('me/delete/', DeleteAccountView.as_view(), name='delete_account'),
    path('me/export/', ExportDataView.as_view(), name='export_data'),
]
