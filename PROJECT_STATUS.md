# Project Status

## Current phase
MVP – Pre-Implementation

## Implemented
- Repository scaffold and docs
- Minimal service stubs (API, web, agent, shared types)
- Control plane metadata stub endpoint
- Agent transport adapter stubs (noop + tailscale placeholder)
- Web frontend (landing, auth, dashboard, device linking UI)

## Planned for v1
- Device registration and linking flow
- Team space management (basic CRUD)
- File transfer initiation and tracking
- Friendly URLs for private local app access
- Activity audit log (lightweight)
- Basic auth (email + magic link)

## Out of scope
- Sync features
- Mobile apps
- SSO or enterprise features
- Advanced policy/role management
- Multi-region or HA architecture

## Known risks
- UX clarity for first-time device linking
- Desktop agent installation friction
- Dependence on the embedded transport layer

## Next milestones
- Define API contracts and shared types
- Establish local dev workflow and compose topology
- Implement basic auth and device registration
- Wire frontend auth to API
- Implement real device enrollment flow
- Enable file transfer UI
