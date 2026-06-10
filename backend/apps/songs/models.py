"""
Modelli del dominio musicale: Song, LyricLine, ChordAnnotation.
Struttura gerarchica: Song → LyricLine → ChordAnnotation.
"""
from django.conf import settings
from django.db import models

from apps.common.models import AbstractBaseModel
from apps.groups.models import MusicGroup


class Song(AbstractBaseModel):
    """
    Rappresenta una canzone con metadati musicali (tonalità, BPM, ritmo).
    Il campo `owner` lega la canzone all'utente che l'ha creata.
    """
    class Key(models.TextChoices):
        """Le 17 tonalità standard (es. C, C#, Db, D, ...)."""
        C = 'C', 'C'
        C_SHARP = 'C#', 'C#'
        D_FLAT = 'Db', 'Db'
        D = 'D', 'D'
        D_SHARP = 'D#', 'D#'
        E_FLAT = 'Eb', 'Eb'
        E = 'E', 'E'
        F = 'F', 'F'
        F_SHARP = 'F#', 'F#'
        G_FLAT = 'Gb', 'Gb'
        G = 'G', 'G'
        G_SHARP = 'G#', 'G#'
        A_FLAT = 'Ab', 'Ab'
        A = 'A', 'A'
        A_SHARP = 'A#', 'A#'
        B_FLAT = 'Bb', 'Bb'
        B = 'B', 'B'

    class Mode(models.TextChoices):
        """Modalità tonale: maggiore o minore."""
        MAJOR = 'major', 'Maggiore'
        MINOR = 'minor', 'Minore'

    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255, blank=True)
    key = models.CharField(max_length=3, choices=Key.choices, blank=True)
    mode = models.CharField(max_length=10, choices=Mode.choices, default=Mode.MAJOR)
    bpm = models.PositiveSmallIntegerField(null=True, blank=True)
    time_signature = models.CharField(max_length=10, default='4/4')
    notes = models.TextField(blank=True)
    song_number = models.PositiveIntegerField(null=True, blank=True, db_index=True)
    topics = models.JSONField(default=list, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='songs',
    )
    group = models.ForeignKey(
        MusicGroup,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='songs',
    )
    extra_groups = models.ManyToManyField(
        MusicGroup,
        blank=True,
        related_name='extra_songs',
    )

    class Meta:
        db_table = 'songs_song'
        verbose_name = 'Canzone'
        verbose_name_plural = 'Canzoni'
        ordering = ['title']

    def __str__(self):
        return f"{self.title} — {self.artist}" if self.artist else self.title


class LyricLine(AbstractBaseModel):
    """
    Una singola riga del testo di una canzone.
    `order` determina la posizione nella canzone (es. 1, 2, 3...).
    `section` indica la sezione (es. 'Strofa', 'Ritornello', 'Bridge').
    """
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='lyric_lines')
    order = models.PositiveIntegerField()
    text = models.TextField()
    section = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'songs_lyricline'
        verbose_name = 'Riga testo'
        verbose_name_plural = 'Righe testo'
        ordering = ['order']

    def __str__(self):
        return f"[{self.song.title}] L{self.order}: {self.text[:40]}"


class ChordAnnotation(AbstractBaseModel):
    """
    Un accordo posizionato sopra una riga di testo.
    `position` indica il carattere (colonna) della riga a cui l'accordo è ancorato.
    Es. posizione 5 = l'accordo suona sul 5° carattere della riga.
    """
    lyric_line = models.ForeignKey(LyricLine, on_delete=models.CASCADE, related_name='chords')
    chord = models.CharField(max_length=20)
    position = models.PositiveSmallIntegerField()

    class Meta:
        db_table = 'songs_chordannotation'
        verbose_name = 'Accordo'
        verbose_name_plural = 'Accordi'
        ordering = ['position']

    def __str__(self):
        return f"{self.chord} @{self.position}"
