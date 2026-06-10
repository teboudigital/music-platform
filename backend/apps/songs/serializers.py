"""
Serializers per Song, LyricLine e ChordAnnotation.
Un serializer converte oggetti Python/Django in JSON (e viceversa) per le API REST.
"""
from rest_framework import serializers

from .models import ChordAnnotation, LyricLine, Song


class ChordAnnotationSerializer(serializers.ModelSerializer):
    """Serializer per un singolo accordo. Usato annidato dentro LyricLineSerializer."""
    class Meta:
        model = ChordAnnotation
        fields = ['id', 'chord', 'position', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LyricLineSerializer(serializers.ModelSerializer):
    """
    Serializer per una riga testo.
    Include gli accordi come lista annidata (read-only):
    gli accordi si creano/modificano tramite il proprio endpoint dedicato.
    """
    chords = ChordAnnotationSerializer(many=True, read_only=True)

    class Meta:
        model = LyricLine
        fields = ['id', 'order', 'text', 'section', 'chords', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SongSerializer(serializers.ModelSerializer):
    """
    Serializer completo per una canzone (usato in GET dettaglio e POST/PUT).
    Contiene le righe testo annidate con i relativi accordi.
    `owner` è mostrato come stringa (email) e non modificabile dall'utente.
    """
    owner = serializers.StringRelatedField(read_only=True)
    lyric_lines = LyricLineSerializer(many=True, read_only=True)

    class Meta:
        model = Song
        fields = [
            'id', 'title', 'artist', 'key', 'mode', 'bpm',
            'time_signature', 'notes', 'owner', 'lyric_lines',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']


class SongListSerializer(serializers.ModelSerializer):
    """
    Serializer leggero per la lista canzoni (GET /songs/).
    Non include le righe testo per evitare risposte troppo pesanti.
    """
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'key', 'mode', 'bpm', 'song_number', 'topics', 'notes', 'owner', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']
