"""
Modelli utente personalizzati: CustomUser e Profile.
Django richiede di definire AUTH_USER_MODEL prima di creare le migrazioni.
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import CustomUserManager


class CustomUser(AbstractUser):
    """
    Utente personalizzato che estende il modello Django standard.
    Differenze rispetto al default:
    - UUID come primary key (più sicuro degli integer ID nelle URL)
    - Login tramite email invece che username
    - Manager personalizzato per create_user/create_superuser
    - is_guest + guest_token per sessioni demo senza registrazione
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_guest = models.BooleanField(default=False)
    guest_token = models.UUIDField(default=uuid.uuid4, unique=True)

    # Django usa questo campo per il login
    USERNAME_FIELD = 'email'
    # Campi richiesti oltre email quando si crea un superuser da shell
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    class Meta:
        db_table = 'users_customuser'
        verbose_name = 'Utente'
        verbose_name_plural = 'Utenti'

    def __str__(self):
        return self.email


class Profile(models.Model):
    """
    Profilo esteso collegato 1:1 a ogni utente.
    Contiene preferenze personali (lingua) e dati non strettamente legati all'auth.
    Viene creato automaticamente alla registrazione (vedi RegisterSerializer).
    """
    class Language(models.TextChoices):
        """Lingue supportate dall'interfaccia utente della piattaforma."""
        ITALIAN = 'it', 'Italiano'
        FRENCH = 'fr', 'Français'
        ENGLISH = 'en', 'English'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    preferred_language = models.CharField(
        max_length=5,
        choices=Language.choices,
        default=Language.ITALIAN,
    )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users_profile'
        verbose_name = 'Profilo'
        verbose_name_plural = 'Profili'

    def __str__(self):
        return f"Profilo di {self.user.email}"
