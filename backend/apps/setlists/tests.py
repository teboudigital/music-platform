"""
Test per Setlist, SetlistItem e trasposizione accordi.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.factories import UserFactory
from apps.songs.factories import SongFactory, LyricLineFactory, ChordAnnotationFactory
from apps.songs.services import transpose_chord, transpose_song_chords
from .factories import SetlistFactory, SetlistItemFactory


def make_auth_client(user):
    client = APIClient()
    res = client.post(reverse('token_obtain_pair'), {'email': user.email, 'password': 'testpass123'})
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')
    return client


@pytest.mark.django_db
class TestSetlist:
    """Test CRUD per le scalette."""

    def test_crea_scaletta(self):
        """POST /setlists/ → 201."""
        user = UserFactory()
        client = make_auth_client(user)
        response = client.post(reverse('setlist-list'), {'title': 'Concerto Estate 2026'})
        assert response.status_code == status.HTTP_201_CREATED

    def test_scalette_isolate_per_utente(self):
        """Un utente vede solo le proprie scalette."""
        user_a = UserFactory()
        user_b = UserFactory()
        SetlistFactory(owner=user_a)
        SetlistFactory(owner=user_b)
        client = make_auth_client(user_a)
        response = client.get(reverse('setlist-list'))
        assert response.data['count'] == 1

    def test_aggiungi_canzone_a_scaletta(self):
        """POST /setlists/{id}/items/ → 201 con canzone e ordine."""
        user = UserFactory()
        setlist = SetlistFactory(owner=user)
        song = SongFactory(owner=user)
        client = make_auth_client(user)
        url = reverse('setlist-item-list', kwargs={'setlist_pk': setlist.pk})
        response = client.post(url, {'song_id': str(song.pk), 'order': 1, 'transposition': 0})
        assert response.status_code == status.HTTP_201_CREATED

    def test_scaletta_altro_utente_404(self):
        """Un utente non può accedere alla scaletta di un altro."""
        owner = UserFactory()
        altro = UserFactory()
        setlist = SetlistFactory(owner=owner)
        client = make_auth_client(altro)
        response = client.get(reverse('setlist-detail', kwargs={'pk': setlist.pk}))
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestTrasposizione:
    """
    Test unitari per la logica di trasposizione accordi.
    Non richiedono il database — testano solo la funzione Python pura.
    """

    def test_trasposizione_zero(self):
        """0 semitoni → accordo invariato."""
        assert transpose_chord('Am', 0) == 'Am'

    def test_trasposizione_su(self):
        """Am +2 semitoni → Bm."""
        assert transpose_chord('Am', 2) == 'Bm'

    def test_trasposizione_giu(self):
        """C -1 semitono → B."""
        assert transpose_chord('C', -1) == 'B'

    def test_diesis(self):
        """C# +1 → D."""
        assert transpose_chord('C#', 1) == 'D'

    def test_bemolle(self):
        """Bb +2 → C."""
        assert transpose_chord('Bb', 2) == 'C'

    def test_ottava_completa(self):
        """12 semitoni = un'ottava → accordo identico."""
        assert transpose_chord('G', 12) == 'G'

    def test_con_suffisso(self):
        """Il suffisso (7, maj9, dim, ecc.) viene preservato."""
        assert transpose_chord('Cmaj7', 2) == 'Dmaj7'
        assert transpose_chord('Am7', 3) == 'Cm7'

    def test_accordo_slash(self):
        """G/B trasposto di +2 → A/C#."""
        assert transpose_chord('G/B', 2) == 'A/C#'

    def test_accordo_sconosciuto(self):
        """Accordo non riconosciuto → restituito invariato."""
        assert transpose_chord('Xyzm', 5) == 'Xyzm'
