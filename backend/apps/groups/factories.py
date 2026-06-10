"""Factories per MusicGroup e Membership."""
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory
from .models import Membership, MusicGroup


class MusicGroupFactory(DjangoModelFactory):
    class Meta:
        model = MusicGroup

    name = factory.Faker('company')
    description = factory.Faker('sentence')
    owner = factory.SubFactory(UserFactory)


class MembershipFactory(DjangoModelFactory):
    class Meta:
        model = Membership

    user = factory.SubFactory(UserFactory)
    group = factory.SubFactory(MusicGroupFactory)
    role = Membership.Role.MEMBER
