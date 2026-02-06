# LLM Context

## Product intent
Private Connect provides a private team space that links devices, enables direct file transfer, and exposes friendly URLs for accessing local apps. The desktop agent handles private connectivity; the transport layer is always abstracted behind a stable interface.

## Architectural principles
- Keep the system minimal and modular; avoid premature abstractions
- Separate control plane concerns (auth, device registry, routing metadata) from agent responsibilities
- Treat the transport layer as a pluggable implementation detail
- Prefer explicit, readable code and TODOs over speculation

## Naming conventions
Avoid these words in user-facing text: VPN, IP, tunnel, node.

## Agent responsibilities
- Enroll a device into a team space
- Maintain a secure local presence and report status
- Transfer files to/from other enrolled devices
- Expose local apps to friendly URLs via the abstracted transport layer

## Control plane responsibilities
- Identity and session management
- Device registry and team space membership
- Access policy evaluation
- Metadata for routing and friendly URLs
- Auditing and basic usage reporting

## Strict rules
- Do not expose networking concepts in user-facing text
- Do not expand scope without explicit instruction
- Do not refactor architecture unless requested

## How to help effectively
- Ask clarifying questions when requirements are ambiguous
- Keep changes small and reversible
- Update docs alongside code
- Use TODOs to mark intentional gaps

## Web frontend
- Next.js control-plane UI implemented
- Landing, auth, dashboard, and device linking pages added
- Uses mocked API functions
- No transport or networking concepts exposed in UI
