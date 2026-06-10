"""
Registrazione dei modelli Song, LyricLine e ChordAnnotation nell'interfaccia Django Admin.
Gli Inline permettono di gestire le entità figlie direttamente dalla pagina del genitore.
"""
from django.contrib import admin

from .models import ChordAnnotation, LyricLine, Song


class ChordInline(admin.TabularInline):
    """Mostra gli accordi di una riga testo direttamente nella pagina LyricLine."""
    model = ChordAnnotation
    extra = 0  # nessuna riga vuota aggiuntiva


class LyricLineInline(admin.TabularInline):
    """Mostra le righe di testo di una canzone direttamente nella pagina Song."""
    model = LyricLine
    extra = 0
    show_change_link = True  # link per aprire la riga in dettaglio


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    """Admin per le canzoni: include le righe testo inline e filtri per tonalità/modo."""
    inlines = [LyricLineInline]
    list_display = ['title', 'artist', 'key', 'mode', 'bpm', 'owner', 'created_at']
    list_filter = ['key', 'mode']
    search_fields = ['title', 'artist']
    ordering = ['title']


@admin.register(LyricLine)
class LyricLineAdmin(admin.ModelAdmin):
    """Admin per le righe testo: include gli accordi inline."""
    inlines = [ChordInline]
    list_display = ['song', 'order', 'section', 'text']
    list_filter = ['section']
    search_fields = ['song__title', 'text']


@admin.register(ChordAnnotation)
class ChordAnnotationAdmin(admin.ModelAdmin):
    """Admin per gli accordi: visualizza accordo, posizione e riga associata."""
    list_display = ['chord', 'position', 'lyric_line']
    search_fields = ['chord']
