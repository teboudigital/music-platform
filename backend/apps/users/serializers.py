"""
Serializers per CustomUser e Profile.
Gestiscono registrazione, visualizzazione profilo e aggiornamento dati utente.
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CustomUser, Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer per il profilo utente: lingua preferita, bio, avatar."""
    class Meta:
        model = Profile
        fields = ['id', 'bio', 'preferred_language', 'avatar', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer per visualizzare e aggiornare i dati dell'utente autenticato.
    Include il profilo annidato in sola lettura.
    """
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer per la registrazione di un nuovo utente.
    - `password` e `password2` sono write_only: non vengono mai restituiti nelle risposte API.
    - `validate_password` applica le regole di complessità password di Django.
    - `create` crea l'utente e il profilo collegato in un'unica operazione.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        """Verifica che le due password coincidano prima di creare l'utente."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Le password non coincidono.'})
        return attrs

    def create(self, validated_data):
        """Crea l'utente con password hashata e genera il profilo automaticamente."""
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user
