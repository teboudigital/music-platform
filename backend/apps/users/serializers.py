from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CustomUser, Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'bio', 'preferred_language', 'avatar', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'profile', 'is_guest']
        read_only_fields = ['id', 'is_guest']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    guest_token = serializers.UUIDField(required=False, write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password2', 'first_name', 'last_name', 'guest_token']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Le password non coincidono.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        guest_token = validated_data.pop('guest_token', None)

        if guest_token:
            # Converti account guest in account reale mantenendo tutti i dati
            try:
                user = CustomUser.objects.get(guest_token=guest_token, is_guest=True)
                new_email = validated_data['email']
                if CustomUser.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                    raise serializers.ValidationError({'email': 'Questa email è già in uso.'})
                user.email = new_email
                user.username = validated_data['username']
                user.set_password(validated_data['password'])
                user.first_name = validated_data.get('first_name', '')
                user.last_name = validated_data.get('last_name', '')
                user.is_guest = False
                user.save()
                return user
            except CustomUser.DoesNotExist:
                pass

        user = CustomUser.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user
