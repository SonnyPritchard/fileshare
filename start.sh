#!/bin/sh
set -eu

info() {
  printf '%s\n' "$*"
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required tool not found: $1"
}

info "Checking required tools..."
need_cmd docker

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
elif docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
else
  fail "docker-compose or docker compose is required"
fi

if command -v pnpm >/dev/null 2>&1; then
  PKG_CMD="pnpm"
elif command -v npm >/dev/null 2>&1; then
  PKG_CMD="npm"
else
  fail "pnpm or npm is required"
fi

info "Using package manager: $PKG_CMD"
info "Using compose command: $COMPOSE_CMD"

if [ -f ./.env ]; then
  info "Loading environment from ./.env"
  set -a
  . ./.env
  set +a
else
  info "No ./.env found; proceeding with defaults"
fi

info "Starting services..."
$COMPOSE_CMD up -d --remove-orphans

info "Services are running."
