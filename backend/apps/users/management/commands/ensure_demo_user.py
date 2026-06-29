"""
Crea o aggiorna l'account demo condiviso.
Uso: python manage.py ensure_demo_user
"""
import os
from django.core.management.base import BaseCommand


DEMO_EMAIL    = os.environ.get('DEMO_EMAIL',    'demo@musicplatform.it')
DEMO_PASSWORD = os.environ.get('DEMO_PASSWORD', 'Demo1234!')
DEMO_NAME     = 'Account Demo'


class Command(BaseCommand):
    help = 'Crea o aggiorna l\'account demo condiviso.'

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user, created = User.objects.get_or_create(
            email=DEMO_EMAIL,
            defaults={
                'first_name': 'Demo',
                'last_name':  'Account',
                'is_active':  True,
                'is_demo':    True,
            }
        )

        user.set_password(DEMO_PASSWORD)
        if not created:
            user.is_active = True
        user.save()

        action = 'Creato' if created else 'Aggiornato'
        self.stdout.write(self.style.SUCCESS(
            f'{action} account demo: {DEMO_EMAIL} / {DEMO_PASSWORD}'
        ))
