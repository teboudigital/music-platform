import os
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Crea il superuser di produzione se non esiste (idempotente).'

    def handle(self, *args, **options):
        from apps.users.models import CustomUser, Profile

        email = os.environ.get('SUPERUSER_EMAIL')
        password = os.environ.get('SUPERUSER_PASSWORD')
        username = os.environ.get('SUPERUSER_USERNAME', 'admin')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'SUPERUSER_EMAIL o SUPERUSER_PASSWORD non impostati — superuser non creato.'
            ))
            return

        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={'username': username, 'is_staff': True, 'is_superuser': True},
        )
        if created:
            user.set_password(password)
            user.save()
            Profile.objects.get_or_create(user=user)
            self.stdout.write(self.style.SUCCESS(f'Superuser creato: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Superuser già esistente: {email}'))
