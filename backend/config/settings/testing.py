from .base import *

DEBUG = False
SECRET_KEY = 'test-secret-key-not-for-production'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Password validation disabilitata nei test per creare utenti con password semplici
AUTH_PASSWORD_VALIDATORS = []

# Nessuna email reale nei test
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Throttling con rate altissime nei test per evitare 429 su login ripetuti
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10000/day',
        'user': '10000/day',
        'login': '10000/day',
    },
}
