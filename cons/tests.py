from django.test import SimpleTestCase
from django.urls import resolve, reverse

from . import views


class PageTests(SimpleTestCase):
    def test_home_route_resolves(self):
        match = resolve(reverse("cons:home"))

        self.assertEqual(match.func, views.home)

    def test_healthz_returns_ok(self):
        response = self.client.get(reverse("cons:healthz"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"OK")

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
