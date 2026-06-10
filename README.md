# 🎵 Music Platform

Piattaforma web per la gestione di testi e accordi musicali — per musicisti, band e gruppi.
Backend Django REST + Frontend React, con supporto multilingua IT / FR / EN.

---

## Stack Tecnologico

| Layer | Tecnologie |
| ------ | ---------- |
| Backend | Django 6.0.6 · DRF 3.17.1 · SimpleJWT · django-filter · drf-nested-routers |
| Frontend | React 19 · Vite · React Router v7 · Axios · i18next |
| Auth | JWT (access + refresh) con rotazione automatica e blacklist |
| Infra | Docker · Docker Compose · Nginx · Gunicorn |
| CI/CD | GitHub Actions (backend + frontend) |
| Test | pytest-django + factory_boy (backend) · Vitest + RTL (frontend) |

---

## Funzionalità Implementate

- Registrazione / Login con email e password
- Gestione canzoni: titolo, artista, tonalità, modo, BPM, testo con accordi
- Trasposizione accordi in tempo reale (±semitoni)
- Gruppi musicali e membership con ruoli
- Setlist per concerti con ordine e trasposizione per canzone
- Profilo utente multilingua (IT / FR / EN)
- GDPR: esportazione dati e cancellazione account
- Rate limiting e Audit Log

---

## Avvio in Locale

### Prerequisiti

- Python 3.11+
- Node.js 20+
- Git

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements/development.txt
python manage.py migrate --settings=config.settings.development
python manage.py createsuperuser --settings=config.settings.development
python manage.py runserver --settings=config.settings.development
```

Backend disponibile su: `http://localhost:8000`
Admin disponibile su: `http://localhost:8000/admin/`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend disponibile su: `http://localhost:5173`

### Credenziali superadmin (sviluppo)

```text
Email:    tebou.digital@gmail.com
Password: Admin1234!
```

---

## Variabili d'Ambiente

Copia `.env.example` in `backend/.env` e personalizza i valori:

```powershell
cp .env.example backend/.env
```

---

## Test

### Test Backend

```powershell
cd backend
venv\Scripts\python.exe -m pytest
```

Risultato atteso: **33/33 test passati**

### Test Frontend

```powershell
cd frontend
npm test
```

Risultato atteso: **9/9 test passati**

---

## Build Production

```powershell
cd frontend
npm run build          # output in frontend/dist/
```

Con Docker:

```powershell
docker compose up --build
```

---

## Struttura del Repository

```text
music-platform/
├── backend/
│   ├── apps/
│   │   ├── common/          # AbstractBaseModel, IsOwner, AuditLog, throttling
│   │   ├── users/           # CustomUser, Profile, GDPR views
│   │   ├── songs/           # Song, LyricLine, ChordAnnotation, trasposizione
│   │   ├── groups/          # MusicGroup, Membership
│   │   └── setlists/        # Setlist, SetlistItem
│   ├── config/
│   │   ├── settings/        # base / development / production / testing
│   │   └── urls.py
│   ├── requirements/        # base / development / production / testing
│   ├── Dockerfile
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── api/             # client.js, auth.js, songs.js, groups.js, setlists.js
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── contexts/        # AuthContext
│   │   ├── i18n/            # it.js, fr.js, en.js
│   │   ├── pages/           # auth/, songs/, groups/, setlists/, ProfilePage
│   │   └── test/            # setup.js
│   └── vite.config.js
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        ├── backend-ci.yml
        └── frontend-ci.yml
```

---

## API Principali

| Metodo | Endpoint | Descrizione |
| ------ | -------- | ----------- |
| POST | `/api/v1/auth/register/` | Registrazione |
| POST | `/api/v1/auth/login/` | Login → JWT |
| POST | `/api/v1/auth/refresh/` | Rinnova access token |
| POST | `/api/v1/auth/logout/` | Blacklist refresh token |
| GET/PATCH | `/api/v1/auth/me/` | Profilo utente |
| GET | `/api/v1/auth/me/export/` | Export dati GDPR |
| DELETE | `/api/v1/auth/me/delete/` | Cancella account |
| GET/POST | `/api/v1/songs/` | Lista / crea canzoni |
| GET | `/api/v1/songs/{id}/transpose/?semitones=N` | Trasposizione |
| GET/POST | `/api/v1/songs/{id}/lines/` | Righe testo |
| GET/POST | `/api/v1/groups/` | Gruppi musicali |
| GET/POST | `/api/v1/setlists/` | Scalette |

---

## Licenza

Uso personale ed educativo.
