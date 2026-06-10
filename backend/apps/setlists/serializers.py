from rest_framework import serializers

from apps.songs.serializers import SongListSerializer
from .models import Setlist, SetlistItem


class SetlistItemSerializer(serializers.ModelSerializer):
    song = SongListSerializer(read_only=True)
    song_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = SetlistItem
        fields = ['id', 'song', 'song_id', 'order', 'transposition', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SetlistSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    items = SetlistItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Setlist
        fields = [
            'id', 'title', 'description', 'owner', 'group',
            'event_date', 'item_count', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_item_count(self, obj):
        return obj.items.count()


class SetlistListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Setlist
        fields = ['id', 'title', 'owner', 'group', 'event_date', 'item_count', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']

    def get_item_count(self, obj):
        return obj.items.count()
