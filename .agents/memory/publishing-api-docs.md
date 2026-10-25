---
name: Publishing API-backed docs
description: Publishability requirement for this API workspace and its documentation frontend.
---

Keep a deployable web artifact at `/` for the API documentation frontend, with the Python API service routed at `/api`. The API artifact's own production build and run configuration was not sufficient for Replit to recognize a publishable user-facing app.

**Why:** the workspace showed “nothing to publish” while only the API and design artifacts were present; adding the root web artifact made project artifacts deployable.

**How to apply:** preserve the root web artifact and `/api` service routing when changing artifact paths or deployment settings.
