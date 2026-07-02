from django.urls import path

from . import views


app_name = "cons"

urlpatterns = [
    path("", views.home, name="home"),
    path("index.html", views.home, name="home_html"),
    path("portfolio-details/", views.portfolio_details, name="portfolio_details"),
    path(
        "portfolio-details.html",
        views.portfolio_details,
        name="portfolio_details_html",
    ),
    path("service-details/", views.service_details, name="service_details"),
    path("service-details.html", views.service_details, name="service_details_html"),
    path("starter-page/", views.starter_page, name="starter_page"),
    path("starter-page.html", views.starter_page, name="starter_page_html"),
    path("privacy/", views.privacy, name="privacy"),
    path("privacy.html", views.privacy, name="privacy_html"),
    path("terms/", views.terms, name="terms"),
    path("terms.html", views.terms, name="terms_html"),
    path("404/", views.error_404, name="error_404"),
    path("404.html", views.error_404, name="error_404_html"),
    path("healthz/", views.healthz, name="healthz"),
    path("forms/contact/", views.contact, name="contact"),
    path("forms/newsletter/", views.newsletter, name="newsletter"),
    path("forms/get-a-quote/", views.quote, name="quote"),
]
