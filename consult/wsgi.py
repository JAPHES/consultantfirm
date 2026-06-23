"""WSGI config for consult project."""
import os

from django.core.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "consult.settings")

application = get_wsgi_application()
