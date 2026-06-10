"""
Throttle personalizzati.
LoginRateThrottle limita i tentativi di login per prevenire attacchi brute-force.
"""
from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Max 10 tentativi di login per ora per IP. Scope 'login' definito in settings."""
    scope = 'login'
