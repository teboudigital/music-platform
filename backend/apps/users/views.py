"""
Views per autenticazione e gestione profilo utente.
I token JWT (login/logout/refresh) sono gestiti direttamente da SimpleJWT in users/urls.py.
"""
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.models import AuditLog
from .models import CustomUser, Profile
from .serializers import ProfileSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Registra un nuovo utente. Non richiede autenticazione (AllowAny).
    Dopo la registrazione l'utente deve fare login per ottenere il token JWT.
    """
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """
    GET  /api/v1/auth/me/  → restituisce i dati dell'utente autenticato
    PATCH /api/v1/auth/me/ → aggiorna parzialmente i dati (es. solo first_name)
    Richiede il token JWT nell'header: Authorization: Bearer <token>
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Restituisce email, username, nome e profilo dell'utente corrente."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Aggiorna parzialmente i dati utente. `partial=True` permette di inviare solo i campi da modificare."""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DeleteAccountView(APIView):
    """
    DELETE /api/v1/auth/me/delete/
    Elimina definitivamente l'account (GDPR art. 17 — diritto all'oblio).
    Richiede conferma password nel body per prevenire eliminazioni accidentali.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        password = request.data.get('password')
        if not password or not request.user.check_password(password):
            return Response({'detail': 'Password non corretta.'}, status=status.HTTP_400_BAD_REQUEST)
        AuditLog.log(request.user, AuditLog.Action.DELETE_ACCOUNT, request)
        request.user.delete()
        return Response({'detail': 'Account eliminato.'}, status=status.HTTP_204_NO_CONTENT)


class ExportDataView(APIView):
    """
    GET /api/v1/auth/me/export/
    Esporta tutti i dati dell'utente in JSON (GDPR art. 20 — portabilità dei dati).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        AuditLog.log(user, AuditLog.Action.EXPORT_DATA, request)
        data = {
            'utente': {
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
            },
            'canzoni': list(user.songs.values('title', 'artist', 'key', 'mode', 'created_at')),
            'scalette': list(user.setlists.values('title', 'event_date', 'created_at')),
            'gruppi': list(user.music_groups.values('name', 'description')),
        }
        return Response(data)


class PasswordResetRequestView(APIView):
    """
    POST /api/v1/auth/password-reset/
    Invia email con link di reset. Risponde sempre 200 per evitare email enumeration.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        try:
            user = CustomUser.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            send_mail(
                subject='Reset della password — Music Platform',
                message=(
                    f"Ciao {user.first_name or user.email},\n\n"
                    f"Hai richiesto il reset della password.\n"
                    f"Clicca sul link per impostarne una nuova:\n\n"
                    f"{reset_url}\n\n"
                    f"Il link è valido per 24 ore.\n"
                    f"Se non hai richiesto il reset, ignora questa email."
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@musicplatform.local'),
                recipient_list=[user.email],
                fail_silently=True,
            )
        except CustomUser.DoesNotExist:
            pass
        return Response({'detail': "Se l'email è registrata, riceverai le istruzioni per il reset."})


class PasswordResetConfirmView(APIView):
    """
    POST /api/v1/auth/password-reset/confirm/
    Valida uid+token e imposta la nuova password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')
        new_password2 = request.data.get('new_password2', '')

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_pk)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({'detail': 'Link non valido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Link scaduto o non valido. Richiedi un nuovo reset.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password2:
            return Response({'new_password2': ['Le password non coincidono.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except DjangoValidationError as e:
            return Response({'new_password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        AuditLog.log(user, AuditLog.Action.PASSWORD_CHANGE, request)
        return Response({'detail': 'Password reimpostata. Ora puoi accedere.'})


class ChangePasswordView(APIView):
    """
    POST /api/v1/auth/me/change-password/
    Cambia la password. Richiede la password corrente per sicurezza.
    Valida la nuova password con le regole Django (lunghezza, complessità).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current = request.data.get('current_password', '')
        new_pwd = request.data.get('new_password', '')
        new_pwd2 = request.data.get('new_password2', '')

        if not request.user.check_password(current):
            return Response({'current_password': ['Password corrente non corretta.']}, status=status.HTTP_400_BAD_REQUEST)
        if new_pwd != new_pwd2:
            return Response({'new_password2': ['Le password non coincidono.']}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new_pwd, request.user)
        except DjangoValidationError as e:
            return Response({'new_password': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_pwd)
        request.user.save()
        AuditLog.log(request.user, AuditLog.Action.PASSWORD_CHANGE, request)
        return Response({'detail': 'Password aggiornata con successo.'})


class ChangeEmailView(APIView):
    """
    POST /api/v1/auth/me/change-email/
    Cambia l'email di login. Richiede conferma password e verifica unicità.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password', '')
        new_email = request.data.get('email', '').strip().lower()

        if not request.user.check_password(password):
            return Response({'password': ['Password non corretta.']}, status=status.HTTP_400_BAD_REQUEST)
        if not new_email:
            return Response({'email': ['Email obbligatoria.']}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(email=new_email).exclude(pk=request.user.pk).exists():
            return Response({'email': ['Questa email è già associata a un altro account.']}, status=status.HTTP_400_BAD_REQUEST)

        request.user.email = new_email
        request.user.save()
        AuditLog.log(request.user, AuditLog.Action.EMAIL_CHANGE, request)
        return Response({'detail': 'Email aggiornata con successo.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/auth/me/profile/ → legge il profilo (lingua, bio, avatar)
    PUT/PATCH /api/v1/auth/me/profile/ → aggiorna il profilo
    `get_or_create` garantisce che il profilo esista anche se non è stato creato alla registrazione.
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Recupera (o crea se mancante) il profilo dell'utente autenticato."""
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
