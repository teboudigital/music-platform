# 🎵 Music Platform — Lyrics & Chords Web App

## Overview

This project is a **music-oriented web platform** designed to help musicians, bands, and groups manage song lyrics, chord charts, and musical metadata in a structured and collaborative way.

The platform focuses on:

* clarity and usability for musicians
* clean separation between domain logic and presentation
* scalability from personal use to group collaboration
* progressive enhancement from a web app to mobile usage

The application is built as an **API-first system** with a modern frontend client.

---

## Goals

The main goals of this project are:

* Provide a clean and efficient way to create and manage songs with lyrics and chords
* Support musical concepts such as key, transposition, and chord difficulty levels
* Enable both individual and group usage
* Build a solid technical foundation suitable for long-term evolution
* Serve as a professional-grade software project, not a prototype

---

## Core Features (MVP 1)

* User authentication
* Song creation and management
* Lyrics editor with chord annotations
* Musical metadata:

  * title
  * author
  * language
  * key
* Personal song library
* Mobile-first responsive interface

Future features are intentionally excluded from the first iteration to preserve focus and quality.

---

## Architecture Overview

The project follows a **decoupled architecture**:

* **Backend**: Django + Django REST Framework
  Responsible for business logic, data modeling, authentication, and API exposure.

* **Frontend**: React
  Responsible for user experience, presentation, and interaction with the API.

Communication between frontend and backend is handled exclusively through HTTP APIs.

The repository is structured as a **monorepo** for early-stage development, while keeping backend and frontend logically isolated to allow future separation if needed.

---

## Repository Structure

```text
music-platform/
│
├── backend/                # Django backend (API)
│   ├── config/             # Project configuration
│   ├── apps/               # Domain-driven Django apps
│   │   ├── users/
│   │   ├── songs/
│   │   ├── groups/
│   │   └── setlists/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/       # API clients
│   │   └── i18n/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Design Principles

This project is guided by the following principles:

* **Separation of concerns**
  Domain logic, API layer, and UI are clearly separated.

* **Explicitness over magic**
  Decisions are documented and structures are intentional.

* **Progressive complexity**
  The system starts simple and grows only when justified by real needs.

* **Domain-driven thinking**
  Musical concepts drive the data model and services, not frameworks.

---

## Technology Stack

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL

### Frontend

* JavaScript
* React
* Modern CSS (mobile-first approach)

---

## Language and Naming Conventions

* User interface and documentation: **French**
* Codebase (classes, variables, APIs): **English**

This separation ensures both clarity for end users and maintainability for developers.

---

## Development Philosophy

This is not a tutorial project.

The codebase is intended to:

* remain readable over time
* be easy to test and refactor
* support future contributors
* evolve toward production readiness

Shortcuts are avoided when they would compromise long-term quality.

---

## Roadmap (High-Level)

* MVP 1: Individual usage (songs, lyrics, chords)
* MVP 2: Musical intelligence (transposition, difficulty levels)
* MVP 3: Group collaboration
* MVP 4: Advanced features (audio analysis, offline mode)

Details are intentionally omitted at this stage.

---

## Getting Started

Instructions for local development will be added once the initial backend and frontend skeletons are in place.

---

## License

This project is currently intended for personal and educational use.
Licensing terms may evolve as the project matures.

---

## Author

Built and maintained as a long-term software engineering project.
