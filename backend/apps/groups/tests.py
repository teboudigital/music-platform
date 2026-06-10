"""
Test per MusicGroup e Membership.
Verifica: isolamento dati, creazione automatica membership admin, protezione endpoint.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.factories import UserFactory
from .factories import MembershipFactory, MusicGroupFactory
from .models import Membership


def make_auth_client(user):
    client = APIClient()
    res = client.post(reverse('token_obtain_pair'), {'email': user.email, 'password': 'testpass123'})
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')
    return client


@pytest.mark.django_db
class TestMusicGroup:
    """Test CRUD dei gruppi musicali."""

    def test_crea_gruppo(self):
        """POST /groups/ → 201, il creatore diventa automaticamente admin."""
        user = UserFactory()
        client = make_auth_client(user)
        response = client.post(reverse('musicgroup-list'), {'name': 'I Nomadi', 'description': 'Band storica'})
        assert response.status_code == status.HTTP_201_CREATED
        # il creatore deve avere ruolo admin
        assert Membership.objects.filter(user=user, role=Membership.Role.ADMIN).exists()

    def test_vede_solo_propri_gruppi(self):
        """Un utente vede solo i gruppi di cui è membro."""
        user_a = UserFactory()
        user_b = UserFactory()
        group_a = MusicGroupFactory(owner=user_a)
        MembershipFactory(user=user_a, group=group_a, role=Membership.Role.ADMIN)
        MusicGroupFactory(owner=user_b)  # gruppo di B, non visibile ad A

        client_a = make_auth_client(user_a)
        response = client_a.get(reverse('musicgroup-list'))
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_non_membro_non_vede_gruppo(self):
        """Un utente non membro non può accedere al dettaglio del gruppo."""
        owner = UserFactory()
        altro = UserFactory()
        group = MusicGroupFactory(owner=owner)
        MembershipFactory(user=owner, group=group, role=Membership.Role.ADMIN)

        client = make_auth_client(altro)
        response = client.get(reverse('musicgroup-detail', kwargs={'pk': group.pk}))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_elimina_gruppo(self):
        """DELETE /groups/{id}/ → 204."""
        user = UserFactory()
        group = MusicGroupFactory(owner=user)
        MembershipFactory(user=user, group=group, role=Membership.Role.ADMIN)
        client = make_auth_client(user)
        response = client.delete(reverse('musicgroup-detail', kwargs={'pk': group.pk}))
        assert response.status_code == status.HTTP_204_NO_CONTENT
