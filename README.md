# Fileshare control plane

## Overview
This monorepo contains a control-plane web app (`apps/web`) and API service (`apps/api`).

## Auth flow (MVP)
- Users enter an email on `/login`.
- The API creates a short-lived sign-in token and logs the sign-in URL to the API console.
- Visiting that URL verifies the token, creates a session, sets an HTTP-only cookie, and redirects to `/dashboard`.
- Sessions persist across refresh until the server-side expiry.

Note: sign-in links are logged to the API console instead of being emailed.

## Local dev
This repo uses Docker Compose for the services. The compose file can be found at `docker-compose.yml`.
For local development, use `./scripts/start.sh`.
Postgres is auto-configured for development; no manual DB or env setup is required for the MVP.

Useful environment variables:
- `API_PORT` (default: `4000`)
- `WEB_PORT` (default: `3000`)
- `WEB_BASE_URL` (default: `http://localhost:3000`)
- `API_BASE_URL` (default: `http://localhost:4000`)

## Docker compose (current)
```yaml
version: "3.9"

services:
  api:
    build:
      context: ./apps/api
    environment:
      - API_PORT=${API_PORT:-4000}
    ports:
      - "${API_PORT:-4000}:4000"

  web:
    build:
      context: ./apps/web
    environment:
      - WEB_PORT=${WEB_PORT:-3000}
    ports:
      - "${WEB_PORT:-3000}:3000"
    depends_on:
      - api
```
