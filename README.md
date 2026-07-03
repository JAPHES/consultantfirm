# JEA Consultancy Firm

A Django website for **Jared Etaba Consultancy**, focused on mining and mineral processing services.

## Project Structure

- **Django project:** `consult`
- **Django app:** `cons`
- **Main static assets:** `assets/`
- **Templates:** `templates/cons/`

## Features

- Public marketing pages for consultancy services
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
- `POST /forms/newsletter/`
- `POST /forms/get-a-quote/`

Each endpoint returns plain text `"OK"` on successful validation.

## Deploying to Render

This project includes Render deployment files:

- `render.yaml` defines the web service and PostgreSQL database.
- `build.sh` installs dependencies, collects static files, and runs migrations.
- `.python-version` pins the app to Python 3.12 on Render.

Recommended Render flow:

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Render, create a new Blueprint instance from the repository.
3. Let Render apply `render.yaml`.
4. Wait for the build to finish and open the generated `.onrender.com` URL.
5. After the Render site works, add the custom subdomain in Render and then create the DNS record at Name.com.

For manual setup instead of Blueprints, use:

- Build Command: `bash build.sh`
- Start Command: `python -m gunicorn consult.wsgi:application`
- Required environment variables: `DATABASE_URL`, `SECRET_KEY`, `WEB_CONCURRENCY`
- Custom domain environment variables:
  - `ALLOWED_HOSTS=jaredetaba.secora.dev`
  - `CSRF_TRUSTED_ORIGINS=https://jaredetaba.secora.dev`

## Notes

- Local development uses SQLite when `DATABASE_URL` is not set.
- Render uses PostgreSQL through `DATABASE_URL`.
- Add future custom domains to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` environment variables if needed.
- The `/admin/` route is intentionally hidden and returns the custom 404 page.
