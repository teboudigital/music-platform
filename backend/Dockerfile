# Stage 1: build delle dipendenze
FROM python:3.13-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements/production.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r production.txt


# Stage 2: immagine finale leggera
FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

# Copia solo i pacchetti installati dallo stage builder
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

# Raccoglie i file statici durante il build
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Gunicorn: 4 workers, timeout 120s, bind su 0.0.0.0:8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120"]
