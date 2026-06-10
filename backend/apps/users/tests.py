"""
Test per registrazione, login, logout e profilo utente.
Ogni test è indipendente: il DB viene ricreato da zero per ogni classe (pytest-django).
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .factories import UserFactory


@pytest.fixture
def client():
    """Client API non autenticato."""
    return APIClient()


@pytest.fixture
def auth_client():
    """Client API con utente già autenticato tramite JWT."""
    user = UserFactory()
    client = APIClient()
    response = client.post(reverse('token_obtain_pair'), {
        'email': user.email,
        'password': 'testpass123',
    })
    token = response.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    client._user = user
    return client


@pytest.mark.django_db
class TestRegistrazione:
    """Verifica che la registrazione crei utente e profilo correttamente."""

    def test_registrazione_ok(self, client):
        """Registrazione con dati validi → 201, utente creato."""
        payload = {
            'email': 'nuovo@test.com',
            'username': 'nuovo',
            'password': 'Passw0rd!',
            'password2': 'Passw0rd!',
        }
        response = client.post(reverse('register'), payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'email' in response.data

    def test_registrazione_password_diverse(self, client):
        """Password non coincidenti → 400."""
        payload = {
            'email': 'x@test.com',
            'username': 'x',
            'password': 'Passw0rd!',
            'password2': 'Diversa!',
        }
        response = client.post(reverse('register'), payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_registrazione_email_duplicata(self, client):
        """Email già esistente → 400."""
        user = UserFactory()
        payload = {
            'email': user.email,
            'username': 'altro',
            'password': 'Passw0rd!',
            'password2': 'Passw0rd!',
        }
        response = client.post(reverse('register'), payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    """Verifica che il login JWT restituisca i token corretti."""

    def test_login_ok(self, client):
        """Credenziali corrette → access + refresh token."""
        user = UserFactory()
        response = client.post(reverse('token_obtain_pair'), {
            'email': user.email,
            'password': 'testpass123',
        })
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_password_errata(self, client):
        """Password sbagliata → 401."""
        user = UserFactory()
        response = client.post(reverse('token_obtain_pair'), {
            'email': user.email,
            'password': 'sbagliata',
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_autenticato(self, auth_client):
        """GET /me/ con token valido → dati utente."""
        response = auth_client.get(reverse('me'))
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == auth_client._user.email

    def test_me_non_autenticato(self, client):
        """GET /me/ senza token → 401."""
        response = client.get(reverse('me'))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
