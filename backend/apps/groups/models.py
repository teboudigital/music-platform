"""
Modelli per i gruppi musicali: MusicGroup e Membership.
Un gruppo può avere più membri; ogni membro ha un ruolo (admin o member).
Nome `MusicGroup` invece di `Group` per evitare conflitto con `django.contrib.auth.models.Group`.
"""
import uuid as _uuid

from django.conf import settings
from django.db import models

from apps.common.models import AbstractBaseModel


class MusicGroup(AbstractBaseModel):
    """
    Rappresenta una band o un ensemble musicale.
    I membri vengono gestiti tramite la tabella intermedia `Membership`.
    `owner` è il creatore del gruppo e ha automaticamente ruolo admin.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    invite_token = models.UUIDField(default=_uuid.uuid4, unique=True, db_index=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_groups',
    )
    # ManyToMany via tabella intermedia Membership (permette di aggiungere il campo `role`)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='Membership',
        related_name='music_groups',
    )

    class Meta:
        db_table = 'groups_musicgroup'
        verbose_name = 'Gruppo musicale'
        verbose_name_plural = 'Gruppi musicali'
        ordering = ['name']

    def __str__(self):
        return self.name


class Membership(AbstractBaseModel):
    """
    Tabella intermedia tra utente e gruppo musicale.
    `unique_together` impedisce che lo stesso utente sia aggiunto due volte allo stesso gruppo.
    """
    class Role(models.TextChoices):
        """Ruoli possibili all'interno del gruppo."""
        ADMIN = 'admin', 'Amministratore'
        MEMBER = 'member', 'Membro'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    group = models.ForeignKey(MusicGroup, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'groups_membership'
        verbose_name = 'Membro'
        verbose_name_plural = 'Membri'
        unique_together = ('user', 'group')

    def __str__(self):
        return f"{self.user.email} → {self.group.name} ({self.role})"
