# JEA Consultancy Firm

A Django website for **Jared Etaba Consultancy**, focused on mining and mineral processing services.

## Project Structure

- **Django project:** `consult`
- **Django app:** `cons`
- **Main static assets:** `assets/`
- **Templates:** `templates/cons/`

## Features

- Public marketing pages for consultancy services
- OpenAI-backed JEA Assistant with English/Swahili responses
- Browser voice input and spoken chatbot replies where supported
- Contact/newsletter/quote form endpoints
- Custom 404 page handling

## Tech Stack

- Python 3
- Django 5 (`Django>=5.0,<6.0`)
- SQLite (default local database)

## Getting Started

1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the development server:
   ```bash
   python manage.py runserver
   ```
5. Open:
   - `http://127.0.0.1:8000/`

## Forms Endpoints

- `POST /forms/contact/`
- `POST /forms/chatbot/`
- `POST /forms/newsletter/`
- `POST /forms/get-a-quote/`

The contact, newsletter, and quote endpoints return plain text `"OK"` on
successful validation. The chatbot endpoint returns JSON and keeps the OpenAI
API key on the server.

## Deploying to Vercel

This project is prepared for Vercel's Python runtime and Django framework
detection:

- `vercel.json` configures the Django function.
- `manage.py` and `WSGI_APPLICATION` let Vercel detect the Django entrypoint.
- `.python-version` pins the app to Python 3.12.
- `STATIC_ROOT` is configured, so Vercel can collect and serve static files.

Recommended Vercel flow:

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, create a new project and import the repository.
3. Use the detected Django/Python settings.
4. Leave Build Command and Output Directory as Vercel defaults.
5. Add the environment variables below.
6. Deploy and open the generated `.vercel.app` URL.
7. After the Vercel site works, add the custom subdomain in Vercel and update DNS at Name.com.

Required Vercel environment variables:

- `DJANGO_SECRET_KEY=<generated Django secret key>`
- `DEBUG=False`
- `OPENAI_API_KEY=<your OpenAI API key>`
- `OPENAI_MODEL=gpt-5.5`

Optional environment variables:

- `DATABASE_URL=<PostgreSQL connection string>` if a persistent database is added later.
- `ALLOWED_HOSTS=<extra domains>` if deploying to another custom domain.
- `CSRF_TRUSTED_ORIGINS=<extra https origins>` if deploying to another custom domain.

## Notes

- Local development uses SQLite when `DATABASE_URL` is not set.
- On Vercel, public forms currently validate and respond without storing submissions in a database.
- The chatbot uses OpenAI for text answers. Voice listening and speaking use the visitor's browser speech features, so support can vary by browser and device.
- Add future custom domains to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` environment variables if needed.
- The `/admin/` route is intentionally hidden and returns the custom 404 page.
