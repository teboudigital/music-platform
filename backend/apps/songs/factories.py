"""Factories per Song, LyricLine e ChordAnnotation."""
import factory
from factory.django import DjangoModelFactory

from apps.users.factories import UserFactory
from .models import ChordAnnotation, LyricLine, Song


class SongFactory(DjangoModelFactory):
    class Meta:
        model = Song

    title = factory.Faker('sentence', nb_words=3)
    artist = factory.Faker('name')
    key = 'C'
    mode = Song.Mode.MAJOR
    owner = factory.SubFactory(UserFactory)


class LyricLineFactory(DjangoModelFactory):
    class Meta:
        model = LyricLine

    song = factory.SubFactory(SongFactory)
    order = factory.Sequence(lambda n: n + 1)
    text = factory.Faker('sentence')
    section = 'Strofa'


class ChordAnnotationFactory(DjangoModelFactory):
    class Meta:
        model = ChordAnnotation

    lyric_line = factory.SubFactory(LyricLineFactory)
    chord = 'Am'
    position = factory.Sequence(lambda n: n * 5)
