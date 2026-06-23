"""URL configuration for consult project."""
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("cons.urls")),
]

handler404 = "cons.views.error_404"
