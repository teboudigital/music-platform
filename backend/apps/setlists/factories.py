"""Factories per Setlist e SetlistItem."""
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory
from apps.songs.factories import SongFactory
from .models import Setlist, SetlistItem


class SetlistFactory(DjangoModelFactory):
    class Meta:
        model = Setlist

    title = factory.Faker('sentence', nb_words=4)
    owner = factory.SubFactory(UserFactory)


class SetlistItemFactory(DjangoModelFactory):
    class Meta:
        model = SetlistItem

    setlist = factory.SubFactory(SetlistFactory)
    song = factory.SubFactory(SongFactory)
    order = factory.Sequence(lambda n: n + 1)
    transposition = 0
