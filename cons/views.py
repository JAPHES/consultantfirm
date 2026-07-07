import json
import logging
import os

from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.http import require_POST

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


logger = logging.getLogger(__name__)


SITEMAP_ROUTES = [
    ("cons:home", "daily", "1.0"),
    ("cons:drilling_blasting_training", "monthly", "0.9"),
    ("cons:pit_design_mine_planning", "monthly", "0.9"),
    ("cons:technical_drawing_training", "monthly", "0.9"),
    ("cons:crusher_maintenance_consultancy", "monthly", "0.8"),
    ("cons:service_details", "monthly", "0.8"),
    ("cons:portfolio_details", "monthly", "0.7"),
]

CHATBOT_CONTEXT = """
JEA Consultancy Firm is led by Jared Etaba, a Mining and Mineral Processing
Engineer. Jared also serves as CEO at UPPA. The firm provides mining and
mineral processing engineering consultancy including crushing plant design,
pit design and optimization, crusher maintenance, production improvement,
technical drawing, engineering design, and professional mining training.

Training packages:
- Technical Drawing, Engineering Design and Mining Software: KSh 2,000.
  Covers engineering drawing, AutoCAD 2D and 3D, Autodesk Inventor, Surpac
  mine design, quarry layouts, plant layouts, and practical design projects.
- Mine Pit Design and Mine Planning: KSh 2,000. Covers pit geometry,
  benches, berms, haul roads, stockpiles, waste dumps, slope stability,
  scheduling, volume calculations, and final pit presentation.
- Drilling and Blasting Engineering: KSh 2,000. Covers drilling operations,
  blast design concepts, burden and spacing calculations, explosives,
  initiation systems, fragmentation, safety controls, reports, and quarry
  case studies.

Contact:
- WhatsApp: +254 798 736972.
- Visitors can also use the contact form on the website.
"""

CHATBOT_INSTRUCTIONS = """
You are JEA Assistant on the JEA Consultancy Firm website.
Answer only questions related to JEA Consultancy Firm, Jared Etaba, UPPA,
mining consultancy services, professional training packages, fees, equipment,
and contacting Jared.

Keep answers concise, warm, and professional. Do not invent credentials,
projects, availability, legal requirements, or exact site-specific engineering
recommendations. For blasting, slope stability, equipment maintenance,
or safety-critical decisions, explain the general topic briefly and tell the
visitor to contact Jared for a site-specific professional review.

If the selected language is Swahili, answer in clear Swahili. If English,
answer in English. If the visitor asks about unrelated topics, politely guide
them back to JEA services or contacting Jared.
"""

CHATBOT_LANGUAGES = {
    "en": "English",
    "sw": "Swahili",
}

CHATBOT_FALLBACKS = {
    "not_configured": {
        "en": (
            "The AI assistant is not fully configured yet. Please contact "
            "Jared on WhatsApp at +254 798 736972 or use the contact form."
        ),
        "sw": (
            "Msaidizi wa AI bado hajaunganishwa kikamilifu. Tafadhali wasiliana "
            "na Jared kupitia WhatsApp +254 798 736972 au tumia fomu ya mawasiliano."
        ),
    },
    "service_error": {
        "en": (
            "I could not connect to the AI service right now. Please try again "
            "shortly or contact Jared on WhatsApp at +254 798 736972."
        ),
        "sw": (
            "Sijaweza kuunganishwa na huduma ya AI kwa sasa. Tafadhali jaribu "
            "tena baadaye au wasiliana na Jared kupitia WhatsApp +254 798 736972."
        ),
    },
    "empty_answer": {
        "en": "Please contact Jared for a detailed answer to this question.",
        "sw": "Tafadhali wasiliana na Jared kwa jibu la kina kuhusu swali hili.",
    },
}


def home(request):
    return render(request, "cons/index.html")


def portfolio_details(request):
    return render(request, "cons/portfolio-details.html")


def service_details(request):
    return render(request, "cons/service-details.html")


def drilling_blasting_training(request):
    return render(request, "cons/drilling-blasting-training.html")


def pit_design_mine_planning(request):
    return render(request, "cons/pit-design-mine-planning.html")


def technical_drawing_training(request):
    return render(request, "cons/technical-drawing-mining-software-training.html")


def crusher_maintenance_consultancy(request):
    return render(request, "cons/crusher-maintenance-consultancy.html")


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
def chatbot(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"answer": "Invalid chat request."}, status=400)
    if not isinstance(payload, dict):
        return JsonResponse({"answer": "Invalid chat request."}, status=400)

    question = str(payload.get("question", "")).strip()
    language = str(payload.get("language", "en")).strip().lower()
    if language not in CHATBOT_LANGUAGES:
        language = "en"
    language_name = CHATBOT_LANGUAGES.get(language, CHATBOT_LANGUAGES["en"])

    if not question:
        return JsonResponse({"answer": "Please type or speak a question."}, status=400)

    if len(question) > 1000:
        return JsonResponse(
            {"answer": "Please keep your question shorter so I can help clearly."},
            status=400,
        )

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        return JsonResponse(
            {"answer": CHATBOT_FALLBACKS["not_configured"][language]},
            status=503,
        )

    client = OpenAI(api_key=api_key)
    model = os.environ.get("OPENAI_MODEL", "gpt-5.5")

    try:
        response = client.responses.create(
            model=model,
            reasoning={"effort": "low"},
            input=[
                {
                    "role": "developer",
                    "content": (
                        f"{CHATBOT_INSTRUCTIONS}\n\nSelected language: "
                        f"{language_name}.\n\nWebsite context:\n{CHATBOT_CONTEXT}"
                    ),
                },
                {"role": "user", "content": question},
            ],
        )
    except Exception:
        logger.exception(
            "OpenAI chatbot request failed for language=%s model=%s",
            language,
            model,
        )
        return JsonResponse(
            {"answer": CHATBOT_FALLBACKS["service_error"][language]},
            status=502,
        )

    answer = getattr(response, "output_text", "").strip()
    if not answer:
        answer = CHATBOT_FALLBACKS["empty_answer"][language]

    return JsonResponse({"answer": answer, "language": language})


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
