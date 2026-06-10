"""
Permessi personalizzati riutilizzabili in tutte le app.
DRF chiama `has_object_permission` per ogni richiesta su un oggetto specifico (GET /{id}, PUT, DELETE).
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    """
    Permette l'accesso solo al proprietario dell'oggetto.
    Richiede che il modello abbia un campo `owner` (ForeignKey a CustomUser).
    """
    message = 'Non hai il permesso di modificare questo oggetto.'

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsOwnerOrReadOnly(BasePermission):
    """
    Lettura libera (GET, HEAD, OPTIONS) per tutti gli utenti autenticati.
    Scrittura (POST, PUT, PATCH, DELETE) solo al proprietario.
    """
    message = 'Solo il proprietario può modificare questo oggetto.'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user
