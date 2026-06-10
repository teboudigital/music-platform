"""
ViewSets per Song, LyricLine e ChordAnnotation.
Un ViewSet raggruppa tutta la logica CRUD (list, create, retrieve, update, destroy)
in una sola classe. Il router DRF genera automaticamente le URL.
"""
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class SongPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

from apps.common.permissions import IsOwner
from .filters import SongFilter
from .models import ChordAnnotation, LyricLine, Song
from .serializers import (
    ChordAnnotationSerializer,
    LyricLineSerializer,
    SongListSerializer,
    SongSerializer,
)
from .services import transpose_song_chords


class SongViewSet(viewsets.ModelViewSet):
    """
    CRUD completo per le canzoni.
    Ogni utente vede e gestisce solo le proprie canzoni (filtro per owner).
    In lista usa SongListSerializer (leggero), in dettaglio SongSerializer (completo).
    Supporta filtro per key/mode e ricerca per title/artist.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    pagination_class = SongPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SongFilter
    search_fields = ['title', 'artist']
    ordering_fields = ['title', 'song_number', 'created_at', 'bpm']
    ordering = ['song_number']

    def get_queryset(self):
        from django.db.models import Q
        from apps.groups.models import Membership

        user = self.request.user
        group_id = self.request.query_params.get('group')

        if group_id:
            # Lista canti di un gruppo specifico
            is_member = Membership.objects.filter(group_id=group_id, user=user).exists()
            if not is_member:
                return Song.objects.none()
            return Song.objects.filter(group_id=group_id).prefetch_related('lyric_lines__chords')

        # Dettaglio / lista personale:
        # canti personali (owner=user, group=None) OPPURE canti dei gruppi di cui è membro
        user_group_ids = Membership.objects.filter(user=user).values_list('group_id', flat=True)
        return Song.objects.filter(
            Q(owner=user, group=None) | Q(group_id__in=user_group_ids)
        ).prefetch_related('lyric_lines__chords')

    def get_serializer_class(self):
        """Serializer leggero per la lista, completo per il dettaglio."""
        if self.action == 'list':
            return SongListSerializer
        return SongSerializer

    def perform_create(self, serializer):
        """Assegna automaticamente l'utente autenticato come owner della canzone."""
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='topics')
    def topics(self, request):
        """GET /api/v1/songs/topics/?group=<id> — lista argomenti disponibili."""
        qs = self.get_queryset()
        all_topics = set()
        for topics_list in qs.values_list('topics', flat=True):
            if topics_list:
                all_topics.update(topics_list)
        return Response(sorted(all_topics))

    @action(detail=True, methods=['get'], url_path='transpose')
    def transpose(self, request, pk=None):
        """
        GET /api/v1/songs/{id}/transpose/?semitones=2
        Restituisce il testo con gli accordi trasposti di N semitoni.
        Non modifica il database — è una vista di sola lettura.
        Parametro `semitones`: intero positivo (su) o negativo (giù), default 0.
        """
        song = self.get_object()
        try:
            semitones = int(request.query_params.get('semitones', 0))
        except ValueError:
            return Response({'detail': '`semitones` deve essere un intero.'}, status=status.HTTP_400_BAD_REQUEST)

        lyric_lines = song.lyric_lines.prefetch_related('chords').order_by('order')
        return Response({
            'song_id': str(song.id),
            'title': song.title,
            'original_key': song.key,
            'semitones': semitones,
            'lyric_lines': transpose_song_chords(lyric_lines, semitones),
        })


class LyricLineViewSet(viewsets.ModelViewSet):
    """
    CRUD per le righe testo di una canzone specifica.
    URL annidata: /api/v1/songs/{song_pk}/lines/
    `song_pk` viene dalla URL e garantisce che la riga appartenga alla canzone giusta.
    """
    serializer_class = LyricLineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtra le righe per canzone (song_pk dalla URL) e per owner."""
        return LyricLine.objects.filter(
            song__owner=self.request.user,
            song_id=self.kwargs['song_pk'],
        ).prefetch_related('chords')

    def perform_create(self, serializer):
        """Collega la nuova riga alla canzone specificata nella URL."""
        song = Song.objects.get(pk=self.kwargs['song_pk'], owner=self.request.user)
        serializer.save(song=song)


class ChordAnnotationViewSet(viewsets.ModelViewSet):
    """
    CRUD per gli accordi di una riga testo specifica.
    URL annidata: /api/v1/songs/{song_pk}/lines/{lyricline_pk}/chords/
    """
    serializer_class = ChordAnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtra gli accordi per riga testo (lyricline_pk dalla URL) e verifica owner."""
        return ChordAnnotation.objects.filter(
            lyric_line__song__owner=self.request.user,
            lyric_line_id=self.kwargs['lyricline_pk'],
        )

    def perform_create(self, serializer):
        """Collega il nuovo accordo alla riga testo specificata nella URL."""
        lyric_line = LyricLine.objects.get(
            pk=self.kwargs['lyricline_pk'],
            song__owner=self.request.user,
        )
        serializer.save(lyric_line=lyric_line)
