# private-connect

Private Connect links devices to a private team space, enabling direct file transfer and friendly access URLs for local apps with no user setup.

## Core features
- Link devices to a private team space
- Send files directly between devices
- Access private local apps via friendly URLs
- Desktop agent for private connectivity with an abstracted transport layer

## Repository structure
- `apps/web` — Web app (Next.js)
- `apps/api` — API service
- `apps/agent` — Desktop agent
- `packages/shared` — Shared types/utilities
- `infra` — Infrastructure definitions
- `docs` — Product and engineering docs
- `scripts` — Automation helpers

## Web app

Location: apps/web

Provides the control-plane UI for:
- Authentication
- Device visibility
- Device linking
- File transfer initiation (UI only)

## Run locally
1. Copy `.env.example` to `.env` and adjust as needed.
2. Run `./start.sh`.
3. Services will start via Docker Compose.

## MVP scope (not included)
- Device or file sync
- Mobile apps
- SSO or enterprise features
- Advanced admin/analytics tooling
