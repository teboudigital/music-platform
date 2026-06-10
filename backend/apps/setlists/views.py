"""
ViewSets per Setlist e SetlistItem.
Le scalette sono private: ogni utente vede solo le proprie.
Gli elementi sono annidati sotto la scaletta: /api/v1/setlists/{id}/items/
"""
from rest_framework import permissions, viewsets

from apps.common.permissions import IsOwner
from .models import Setlist, SetlistItem
from .serializers import SetlistItemSerializer, SetlistListSerializer, SetlistSerializer


class SetlistViewSet(viewsets.ModelViewSet):
    """
    CRUD per le scalette dell'utente autenticato.
    `prefetch_related('items__song')` carica canzoni e items in un'unica query
    per evitare il problema N+1 (una query per ogni item).
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        """Restituisce solo le scalette dell'utente autenticato."""
        return Setlist.objects.filter(owner=self.request.user).prefetch_related(
            'items__song'
        )

    def get_serializer_class(self):
        """Lista leggera (senza items), dettaglio completo."""
        if self.action == 'list':
            return SetlistListSerializer
        return SetlistSerializer

    def perform_create(self, serializer):
        """Assegna automaticamente l'utente autenticato come owner della scaletta."""
        serializer.save(owner=self.request.user)


class SetlistItemViewSet(viewsets.ModelViewSet):
    """
    CRUD per gli elementi (canzoni) di una scaletta specifica.
    URL annidata: /api/v1/setlists/{setlist_pk}/items/
    `select_related('song')` esegue un JOIN SQL per caricare la canzone in un'unica query.
    """
    serializer_class = SetlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtra gli item per scaletta (setlist_pk dalla URL) e verifica ownership."""
        return SetlistItem.objects.filter(
            setlist__owner=self.request.user,
            setlist_id=self.kwargs['setlist_pk'],
        ).select_related('song')

    def perform_create(self, serializer):
        """Collega il nuovo item alla scaletta specificata nella URL."""
        setlist = Setlist.objects.get(pk=self.kwargs['setlist_pk'], owner=self.request.user)
        serializer.save(setlist=setlist)
