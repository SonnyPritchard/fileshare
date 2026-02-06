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

info "Checking Docker..."
need_cmd docker

docker info >/dev/null 2>&1 || fail "Docker is not running"

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
else
  fail "docker compose is required"
fi

if [ -f ./.env ]; then
  info "Loading environment from ./.env"
  set -a
  . ./.env
  set +a
else
  info "No ./.env found; proceeding with defaults"
fi

info "Stopping services..."
$COMPOSE_CMD down --remove-orphans

info "Services are stopped."
