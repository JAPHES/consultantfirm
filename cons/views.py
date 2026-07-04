from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.http import require_POST


SITEMAP_ROUTES = [
    ("cons:home", "daily", "1.0"),
    ("cons:service_details", "monthly", "0.8"),
    ("cons:portfolio_details", "monthly", "0.7"),
    ("cons:privacy", "yearly", "0.3"),
    ("cons:terms", "yearly", "0.3"),
]


def home(request):
    return render(request, "cons/index.html")


def portfolio_details(request):
    return render(request, "cons/portfolio-details.html")


def service_details(request):
    return render(request, "cons/service-details.html")


def starter_page(request):
    return render(request, "cons/starter-page.html")


def privacy(request):
    return render(request, "cons/privacy.html")


def terms(request):
    return render(request, "cons/terms.html")


def error_404(request, exception=None):
    return render(request, "cons/404.html", status=404)


def healthz(request):
    return HttpResponse("OK", content_type="text/plain")


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "Disallow: /forms/",
        "Disallow: /healthz/",
        "",
        f"Sitemap: {request.build_absolute_uri(reverse('cons:sitemap'))}",
        "",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def sitemap(request):
    url_items = []
    for route_name, changefreq, priority in SITEMAP_ROUTES:
        url_items.append(
            "\n".join(
                [
                    "  <url>",
                    f"    <loc>{request.build_absolute_uri(reverse(route_name))}</loc>",
                    f"    <changefreq>{changefreq}</changefreq>",
                    f"    <priority>{priority}</priority>",
                    "  </url>",
                ]
            )
        )

    xml = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            *url_items,
            "</urlset>",
            "",
        ]
    )
    return HttpResponse(xml, content_type="application/xml")


@require_POST
def contact(request):
    required_fields = ["email", "phone", "message"]
    missing_fields = [field for field in required_fields if not request.POST.get(field)]
    if missing_fields:
        return HttpResponseBadRequest(
            "Missing required fields: " + ", ".join(missing_fields)
        )

    if not _valid_email(request.POST["email"]):
        return HttpResponseBadRequest("Enter a valid email address.")

    # The original template expects exactly "OK" from AJAX form submissions.
    return HttpResponse("OK", content_type="text/plain")


@require_POST
def newsletter(request):
    email = request.POST.get("email", "")
    if not email:
        return HttpResponseBadRequest("Missing required field: email")

    if not _valid_email(email):
        return HttpResponseBadRequest("Enter a valid email address.")

    return HttpResponse("OK", content_type="text/plain")


@require_POST
def quote(request):
    if not request.POST:
        return HttpResponseBadRequest("Missing form data.")

    email = request.POST.get("email")
    if email and not _valid_email(email):
        return HttpResponseBadRequest("Enter a valid email address.")

    return HttpResponse("OK", content_type="text/plain")


def _valid_email(email):
    try:
        validate_email(email)
    except ValidationError:
        return False
    return True
