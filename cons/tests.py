import json
import os
from unittest.mock import Mock, patch

from django.test import SimpleTestCase
from django.urls import resolve, reverse

from . import views


class PageTests(SimpleTestCase):
    def test_home_route_resolves(self):
        match = resolve(reverse("cons:home"))

        self.assertEqual(match.func, views.home)

    def test_seo_landing_routes_resolve(self):
        expected_routes = {
            "cons:drilling_blasting_training": views.drilling_blasting_training,
            "cons:pit_design_mine_planning": views.pit_design_mine_planning,
            "cons:technical_drawing_training": views.technical_drawing_training,
            "cons:crusher_maintenance_consultancy": (
                views.crusher_maintenance_consultancy
            ),
        }

        for route_name, view_func in expected_routes.items():
            with self.subTest(route_name=route_name):
                match = resolve(reverse(route_name))

                self.assertEqual(match.func, view_func)

    def test_healthz_returns_ok(self):
        response = self.client.get(reverse("cons:healthz"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"OK")

    def test_robots_txt_points_to_sitemap(self):
        response = self.client.get(reverse("cons:robots_txt"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/plain")
        self.assertContains(response, "User-agent: *")
        self.assertContains(response, "Sitemap: http://testserver/sitemap.xml")

    def test_sitemap_lists_public_pages(self):
        response = self.client.get(reverse("cons:sitemap"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/xml")
        self.assertContains(response, "<loc>http://testserver/</loc>")
        self.assertContains(
            response,
            "<loc>http://testserver/service-details/</loc>",
        )
        self.assertContains(
            response,
            "<loc>http://testserver/drilling-blasting-training/</loc>",
        )
        self.assertContains(
            response,
            "<loc>http://testserver/pit-design-mine-planning/</loc>",
        )
        self.assertContains(
            response,
            "<loc>http://testserver/technical-drawing-mining-software-training/</loc>",
        )
        self.assertContains(
            response,
            "<loc>http://testserver/crusher-maintenance-consultancy/</loc>",
        )

    def test_admin_route_resolves_to_404(self):
        match = resolve("/admin/")

        self.assertEqual(match.func, views.error_404)

    def test_admin_route_without_slash_resolves_to_404(self):
        match = resolve("/admin")

        self.assertEqual(match.func, views.error_404)

    def test_nested_admin_route_resolves_to_404(self):
        match = resolve("/admin/login/")

        self.assertEqual(match.func, views.error_404)

    def test_contact_form_returns_ok(self):
        response = self.client.post(
            reverse("cons:contact"),
            {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+254700000000",
                "message": "A short test message.",
            },
            HTTP_X_REQUESTED_WITH="XMLHttpRequest",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"OK")

    def test_chatbot_requires_question(self):
        response = self.client.post(
            reverse("cons:chatbot"),
            data=json.dumps({"question": "", "language": "en"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["answer"], "Please type or speak a question.")

    def test_chatbot_returns_swahili_fallback_without_api_key(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": ""}):
            response = self.client.post(
                reverse("cons:chatbot"),
                data=json.dumps({"question": "Mafunzo ni bei gani?", "language": "sw"}),
                content_type="application/json",
            )

        self.assertEqual(response.status_code, 503)
        self.assertIn("Msaidizi wa AI", response.json()["answer"])

    def test_chatbot_uses_openai_responses_api(self):
        with (
            patch.dict(
                os.environ,
                {"OPENAI_API_KEY": "test-key", "OPENAI_MODEL": "test-model"},
            ),
            patch("cons.views.OpenAI") as openai_class,
        ):
            openai_response = Mock(output_text="JEA can help with pit planning.")
            openai_class.return_value.responses.create.return_value = openai_response

            response = self.client.post(
                reverse("cons:chatbot"),
                data=json.dumps(
                    {"question": "Can you explain pit planning?", "language": "en"}
                ),
                content_type="application/json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["answer"], "JEA can help with pit planning.")
        openai_class.assert_called_once_with(api_key="test-key")
        create_call = openai_class.return_value.responses.create.call_args
        self.assertEqual(create_call.kwargs["model"], "test-model")
        self.assertIn(
            "Selected language: English",
            create_call.kwargs["input"][0]["content"],
        )
