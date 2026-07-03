"""URL configuration for consult project."""
from django.urls import include, path, re_path

from cons import views

urlpatterns = [
    re_path(r"^admin(?:/.*)?$", views.error_404, name="hidden_admin"),
    path("", include("cons.urls")),
]

handler404 = "cons.views.error_404"
