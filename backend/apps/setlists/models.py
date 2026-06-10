"""
Modelli per le scalette (setlist): Setlist e SetlistItem.
Una scaletta è un elenco ordinato di canzoni per un evento o concerto.
"""
from django.conf import settings
from django.db import models

from apps.common.models import AbstractBaseModel
from apps.groups.models import MusicGroup
from apps.songs.models import Song


class Setlist(AbstractBaseModel):
    """
    Scaletta musicale per un evento (concerto, prova, etc.).
    Può essere associata a un gruppo musicale (opzionale).
    `group` usa SET_NULL: se il gruppo viene eliminato, la scaletta rimane ma perde il collegamento.
    """
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='setlists',
    )
    # Gruppo opzionale: una scaletta può essere personale o condivisa col gruppo
    group = models.ForeignKey(
        MusicGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='setlists',
    )
    event_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'setlists_setlist'
        verbose_name = 'Scaletta'
        verbose_name_plural = 'Scalette'
        ordering = ['-event_date', 'title']  # eventi più recenti prima

    def __str__(self):
        return self.title


class SetlistItem(AbstractBaseModel):
    """
    Una canzone all'interno di una scaletta, con posizione e trasposizione.
    `transposition` indica di quanti semitoni spostare la tonalità (es. +2 = due semitoni su).
    `unique_together` impedisce numeri d'ordine duplicati nella stessa scaletta.
    """
    setlist = models.ForeignKey(Setlist, on_delete=models.CASCADE, related_name='items')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='setlist_items')
    order = models.PositiveIntegerField()
    transposition = models.SmallIntegerField(default=0)  # 0 = tonalità originale
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'setlists_setlistitem'
        verbose_name = 'Elemento scaletta'
        verbose_name_plural = 'Elementi scaletta'
        ordering = ['order']
        unique_together = ('setlist', 'order')

    def __str__(self):
        return f"{self.setlist.title} #{self.order}: {self.song.title}"
