"""
Test per Song, LyricLine e ChordAnnotation.
Verifica isolamento dati (utente A non vede canzoni di utente B) e CRUD completo.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.factories import UserFactory
from .factories import LyricLineFactory, SongFactory


def make_auth_client(user):
    """Helper: restituisce un APIClient autenticato per l'utente dato."""
    client = APIClient()
    response = client.post(reverse('token_obtain_pair'), {
        'email': user.email,
        'password': 'testpass123',
    })
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')
    return client


@pytest.mark.django_db
class TestSongCRUD:
    """Test CRUD base per le canzoni."""

    def test_crea_canzone(self):
        """POST /songs/ → 201, la canzone viene salvata con owner corretto."""
        user = UserFactory()
        client = make_auth_client(user)
        payload = {'title': 'Bohemian Rhapsody', 'artist': 'Queen', 'key': 'Bb', 'mode': 'major'}
        response = client.post(reverse('song-list'), payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Bohemian Rhapsody'

    def test_lista_solo_proprie_canzoni(self):
        """Un utente vede solo le sue canzoni, non quelle degli altri."""
        user_a = UserFactory()
        user_b = UserFactory()
        SongFactory(owner=user_a)
        SongFactory(owner=user_b)

        client_a = make_auth_client(user_a)
        response = client_a.get(reverse('song-list'))
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1  # vede solo la sua

    def test_dettaglio_canzone(self):
        """GET /songs/{id}/ → 200 con i dati corretti."""
        user = UserFactory()
        song = SongFactory(owner=user)
        client = make_auth_client(user)
        response = client.get(reverse('song-detail', kwargs={'pk': song.pk}))
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == song.title

    def test_canzone_altro_utente_404(self):
        """Un utente non può accedere alle canzoni di un altro → 404."""
        owner = UserFactory()
        altro = UserFactory()
        song = SongFactory(owner=owner)
        client = make_auth_client(altro)
        response = client.get(reverse('song-detail', kwargs={'pk': song.pk}))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_elimina_canzone(self):
        """DELETE /songs/{id}/ → 204."""
        user = UserFactory()
        song = SongFactory(owner=user)
        client = make_auth_client(user)
        response = client.delete(reverse('song-detail', kwargs={'pk': song.pk}))
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_filtro_per_tonalita(self):
        """?key=C deve restituire solo canzoni in Do."""
        user = UserFactory()
        SongFactory(owner=user, key='C')
        SongFactory(owner=user, key='G')
        client = make_auth_client(user)
        response = client.get(reverse('song-list') + '?key=C')
        assert response.data['count'] == 1

    def test_ricerca_per_titolo(self):
        """?search=bohemian deve trovare la canzone per titolo."""
        user = UserFactory()
        SongFactory(owner=user, title='Bohemian Rhapsody', artist='Queen')
        SongFactory(owner=user, title='Stairway to Heaven', artist='Led Zeppelin')
        client = make_auth_client(user)
        response = client.get(reverse('song-list') + '?search=bohemian')
        assert response.data['count'] == 1


@pytest.mark.django_db
class TestLyricLine:
    """Test per le righe testo annidate sotto una canzone."""

    def test_crea_riga_testo(self):
        """POST /songs/{id}/lines/ → 201."""
        user = UserFactory()
        song = SongFactory(owner=user)
        client = make_auth_client(user)
        payload = {'order': 1, 'text': 'Is this the real life?', 'section': 'Strofa'}
        url = reverse('song-lyricline-list', kwargs={'song_pk': song.pk})
        response = client.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED

    def test_lista_righe_canzone(self):
        """GET /songs/{id}/lines/ → solo le righe di quella canzone."""
        user = UserFactory()
        song = SongFactory(owner=user)
        LyricLineFactory(song=song)
        LyricLineFactory(song=song)
        client = make_auth_client(user)
        url = reverse('song-lyricline-list', kwargs={'song_pk': song.pk})
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
