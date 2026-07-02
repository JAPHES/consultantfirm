from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.http import require_POST


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
