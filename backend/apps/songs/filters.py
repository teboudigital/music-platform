"""
FilterSet per Song: permette query più espressive rispetto ai filterset_fields base.
Esempi:
  ?key=C&mode=minor        → canzoni in Do minore
  ?bpm_min=80&bpm_max=120  → canzoni tra 80 e 120 BPM
  ?has_lyrics=true         → canzoni che hanno almeno una riga testo
"""
import django_filters

from .models import Song


class SongFilter(django_filters.FilterSet):
    # Range BPM: ?bpm_min=80&bpm_max=120
    bpm_min = django_filters.NumberFilter(field_name='bpm', lookup_expr='gte')
    bpm_max = django_filters.NumberFilter(field_name='bpm', lookup_expr='lte')

    # Ricerca parziale sull'artista (case-insensitive): ?artist=queen
    artist = django_filters.CharFilter(lookup_expr='icontains')

    # Filtra per argomento: ?topic=Adorazione
    topic = django_filters.CharFilter(method='filter_topic')

    # Filtra le canzoni che hanno (o non hanno) righe testo
    has_lyrics = django_filters.BooleanFilter(method='filter_has_lyrics')

    class Meta:
        model = Song
        fields = ['key', 'mode', 'time_signature']

    def filter_topic(self, queryset, name, value):
        """?topic=Adorazione → canti che hanno quell'argomento nella lista topics.
        Usa json_each() perché SQLite non supporta JSONField __contains.
        """
        return queryset.extra(
            where=["EXISTS (SELECT 1 FROM json_each(songs_song.topics) WHERE value = %s)"],
            params=[value],
        )

    def filter_has_lyrics(self, queryset, name, value):
        """
        `value=True`  → solo canzoni con almeno una riga testo
        `value=False` → solo canzoni senza testo
        """
        if value:
            return queryset.filter(lyric_lines__isnull=False).distinct()
        return queryset.filter(lyric_lines__isnull=True)
