"""
Factories per CustomUser e Profile usate nei test.
factory_boy crea oggetti realistici nel database di test senza ripetere codice di setup.
"""
import factory
from factory.django import DjangoModelFactory

from .models import CustomUser, Profile


class UserFactory(DjangoModelFactory):
    """
    Crea un utente con email e password valide.
    `Sequence` garantisce che ogni utente abbia un'email univoca (user0@test.com, user1@test.com...).
    """
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f'user{n}@test.com')
    username = factory.Sequence(lambda n: f'user{n}')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        """
        Imposta la password hashata e salva — con skip_postgeneration_save=True
        il salvataggio non avviene automaticamente dopo i post_generation hooks.
        """
        pwd = extracted or 'testpass123'
        obj.set_password(pwd)
        if create:
            obj.save(update_fields=['password'])


class ProfileFactory(DjangoModelFactory):
    """Crea un profilo collegato a un utente. Usato quando serve testare lingua/bio/avatar."""
    class Meta:
        model = Profile

    user = factory.SubFactory(UserFactory)
    preferred_language = 'it'
