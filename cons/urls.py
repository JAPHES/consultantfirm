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
    path(
        "drilling-blasting-training/",
        views.drilling_blasting_training,
        name="drilling_blasting_training",
    ),
    path(
        "pit-design-mine-planning/",
        views.pit_design_mine_planning,
        name="pit_design_mine_planning",
    ),
    path(
        "technical-drawing-mining-software-training/",
        views.technical_drawing_training,
        name="technical_drawing_training",
    ),
    path(
        "crusher-maintenance-consultancy/",
        views.crusher_maintenance_consultancy,
        name="crusher_maintenance_consultancy",
    ),
    path("starter-page/", views.starter_page, name="starter_page"),
    path("starter-page.html", views.starter_page, name="starter_page_html"),
    path("privacy/", views.privacy, name="privacy"),
    path("privacy.html", views.privacy, name="privacy_html"),
    path("terms/", views.terms, name="terms"),
    path("terms.html", views.terms, name="terms_html"),
    path("404/", views.error_404, name="error_404"),
    path("404.html", views.error_404, name="error_404_html"),
    path("healthz/", views.healthz, name="healthz"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
    path("sitemap.xml", views.sitemap, name="sitemap"),
    path("forms/contact/", views.contact, name="contact"),
    path("forms/chatbot/", views.chatbot, name="chatbot"),
    path("forms/newsletter/", views.newsletter, name="newsletter"),
    path("forms/get-a-quote/", views.quote, name="quote"),
]
