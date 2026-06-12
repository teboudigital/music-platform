"""
ViewSet per MusicGroup con azioni per gestire membri, ruoli e link di invito.
"""
import uuid

from django.conf import settings
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Membership, MusicGroup
from .serializers import MembershipSerializer, MusicGroupListSerializer, MusicGroupSerializer


class MusicGroupViewSet(viewsets.ModelViewSet):
    """
    CRUD per i gruppi musicali.
    Un utente vede solo i gruppi di cui è membro.
    Alla creazione il creatore diventa automaticamente admin.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MusicGroup.objects.filter(
            memberships__user=self.request.user
        ).distinct().prefetch_related('memberships__user')

    def get_serializer_class(self):
        if self.action == 'list':
            return MusicGroupListSerializer
        return MusicGroupSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_guest:
            if Membership.objects.filter(user=user).count() >= 2:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Limite di 2 gruppi raggiunto. Registrati per continuare.')
        group = serializer.save(owner=user)
        Membership.objects.create(user=user, group=group, role=Membership.Role.ADMIN)

    def _is_admin(self, user, group):
        return Membership.objects.filter(user=user, group=group, role=Membership.Role.ADMIN).exists()

    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
        group = self.get_object()
        if not self._is_admin(request.user, group):
            return Response({'detail': 'Solo gli admin possono aggiungere membri.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = MembershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(group=group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='remove-member/(?P<user_pk>[^/.]+)')
    def remove_member(self, request, pk=None, user_pk=None):
        group = self.get_object()
        if not self._is_admin(request.user, group):
            return Response({'detail': 'Solo gli admin possono rimuovere membri.'}, status=status.HTTP_403_FORBIDDEN)
        Membership.objects.filter(user_id=user_pk, group=group).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='regenerate-invite')
    def regenerate_invite(self, request, pk=None):
        group = self.get_object()
        if not self._is_admin(request.user, group):
            return Response({'detail': 'Solo gli admin possono rigenerare il link.'}, status=status.HTTP_403_FORBIDDEN)
        group.invite_token = uuid.uuid4()
        group.save(update_fields=['invite_token'])
        return Response({'invite_token': str(group.invite_token)})

    @action(detail=True, methods=['patch'], url_path='set-role')
    def set_role(self, request, pk=None):
        group = self.get_object()
        if not self._is_admin(request.user, group):
            return Response({'detail': 'Solo gli admin possono cambiare i ruoli.'}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        if new_role not in (Membership.Role.ADMIN, Membership.Role.MEMBER):
            return Response({'detail': 'Ruolo non valido.'}, status=status.HTTP_400_BAD_REQUEST)
        if str(user_id) == str(group.owner_id):
            return Response({'detail': 'Non puoi cambiare il ruolo del creatore.'}, status=status.HTTP_400_BAD_REQUEST)
        updated = Membership.objects.filter(user_id=user_id, group=group).update(role=new_role)
        if not updated:
            return Response({'detail': 'Membro non trovato.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 'ok', 'role': new_role})

    @action(detail=True, methods=['delete'], url_path='leave')
    def leave(self, request, pk=None):
        group = self.get_object()
        if group.owner == request.user:
            return Response(
                {'detail': 'Il creatore non può abbandonare il gruppo. Elimina il gruppo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Membership.objects.filter(user=request.user, group=group).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class JoinGroupView(APIView):
    """
    GET  /api/v1/groups/join/<token>/  — anteprima del gruppo prima di unirsi
    POST /api/v1/groups/join/<token>/  — entra nel gruppo come membro
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, token):
        try:
            group = MusicGroup.objects.get(invite_token=token)
        except MusicGroup.DoesNotExist:
            return Response({'detail': 'Link di invito non valido.'}, status=status.HTTP_404_NOT_FOUND)
        already_member = Membership.objects.filter(user=request.user, group=group).exists()
        return Response({
            'group_id': str(group.id),
            'group_name': group.name,
            'description': group.description,
            'member_count': group.memberships.count(),
            'already_member': already_member,
        })

    def post(self, request, token):
        try:
            group = MusicGroup.objects.get(invite_token=token)
        except MusicGroup.DoesNotExist:
            return Response({'detail': 'Link di invito non valido.'}, status=status.HTTP_404_NOT_FOUND)
        if Membership.objects.filter(user=request.user, group=group).exists():
            return Response({'detail': 'Sei già membro.', 'group_id': str(group.id)}, status=status.HTTP_200_OK)
        Membership.objects.create(user=request.user, group=group, role=Membership.Role.MEMBER)
        return Response({'detail': 'Sei entrato nel gruppo.', 'group_id': str(group.id)}, status=status.HTTP_201_CREATED)
