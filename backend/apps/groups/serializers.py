from rest_framework import serializers

from .models import Membership, MusicGroup


class MembershipSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Membership
        fields = ['id', 'user_id', 'user_email', 'user_full_name', 'role', 'joined_at']
        read_only_fields = ['id', 'user_id', 'user_email', 'user_full_name', 'joined_at']

    def get_user_full_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name or obj.user.email


class MusicGroupSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    owner_id = serializers.UUIDField(source='owner.id', read_only=True)
    memberships = MembershipSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    invite_token = serializers.UUIDField(read_only=True)

    class Meta:
        model = MusicGroup
        fields = [
            'id', 'name', 'description', 'owner', 'owner_id',
            'member_count', 'memberships', 'my_role', 'is_admin',
            'invite_token', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'owner_id', 'invite_token', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_my_role(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        m = obj.memberships.filter(user=request.user).first()
        return m.role if m else None

    def get_is_admin(self, obj):
        request = self.context.get('request')
        if not request:
            return False
        return obj.memberships.filter(user=request.user, role=Membership.Role.ADMIN).exists()


class MusicGroupListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    member_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = MusicGroup
        fields = ['id', 'name', 'description', 'owner', 'member_count', 'my_role', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_my_role(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        m = obj.memberships.filter(user=request.user).first()
        return m.role if m else None
