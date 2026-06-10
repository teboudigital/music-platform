"""
Manager personalizzato per CustomUser.
Django usa il manager per creare utenti e superuser dalla shell e dai comandi di gestione.
"""
from django.contrib.auth.models import BaseUserManager


class CustomUserManager(BaseUserManager):
    """
    Sostituisce il manager Django predefinito perché il nostro modello
    usa l'email come campo di login invece dello username.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Crea un utente normale con email e password.
        `normalize_email` converte il dominio in minuscolo (es. User@GMAIL.COM → User@gmail.com).
        """
        if not email:
            raise ValueError('Email obbligatoria')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hash della password, mai salvare in chiaro
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crea un superuser con is_staff=True e is_superuser=True.
        Usato dal comando `python manage.py createsuperuser`.
        Se lo username non viene passato, lo genera dall'email (parte prima della @).
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if not extra_fields.get('username'):
            extra_fields['username'] = email.split('@')[0]
        return self.create_user(email, password, **extra_fields)
