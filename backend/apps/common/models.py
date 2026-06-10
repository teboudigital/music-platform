"""
Modelli base condivisi da tutte le app.
AuditLog registra azioni sensibili per tracciabilità e GDPR.
"""
import uuid
from django.conf import settings
from django.db import models


class AbstractBaseModel(models.Model):
    """Modello base con UUID come PK e timestamps automatici."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditLog(models.Model):
    """
    Registro delle azioni sensibili degli utenti (GDPR art. 30).
    Permette di sapere chi ha fatto cosa e quando.
    Non usa AbstractBaseModel perché non ha `updated_at`.
    """
    class Action(models.TextChoices):
        LOGIN = 'login', 'Login'
        LOGOUT = 'logout', 'Logout'
        REGISTER = 'register', 'Registrazione'
        DELETE_ACCOUNT = 'delete_account', 'Eliminazione account'
        EXPORT_DATA = 'export_data', 'Esportazione dati'
        PASSWORD_CHANGE = 'password_change', 'Cambio password'
        EMAIL_CHANGE = 'email_change', 'Cambio email'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    extra = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'common_auditlog'
        verbose_name = 'Log di audit'
        verbose_name_plural = 'Log di audit'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} — {self.action} @ {self.created_at:%Y-%m-%d %H:%M}"

    @classmethod
    def log(cls, user, action, request=None, **extra):
        """Helper per creare un log entry in una riga."""
        ip = None
        ua = ''
        if request:
            ip = request.META.get('REMOTE_ADDR')
            ua = request.META.get('HTTP_USER_AGENT', '')
        cls.objects.create(user=user, action=action, ip_address=ip, user_agent=ua, extra=extra)
