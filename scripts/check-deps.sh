#!/usr/bin/env bash
# scripts/check-deps.sh — Validates all required tools before launch
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"

FAILED=0

check_tool() {
  local cmd="$1" label="$2" install_hint="$3"
  if command -v "$cmd" &>/dev/null; then
    local ver
    ver=$("$cmd" --version 2>&1 | head -n1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -n1)
    dmb_ok "${label}  ${GRAY}v${ver}${RESET}"
  else
    dmb_error "${label} not found"
    dmb_info  "Install: ${install_hint}"
    FAILED=1
  fi
}

check_docker_running() {
  if docker info &>/dev/null 2>&1; then
    dmb_ok "Docker daemon  ${GRAY}running${RESET}"
  else
    dmb_error "Docker daemon is not running — please start Docker first."
    FAILED=1
  fi
}

check_port_free() {
  local port="$1"
  if ! ss -tlnp | grep -q ":${port}"; then
    dmb_ok "Port ${port}  ${GRAY}available${RESET}"
  else
    dmb_warn "Port ${port} is already in use — DB will attempt to reuse existing container"
  fi
}

dmb_step "1" "3" "Runtime Checks"
check_tool  "node"   "Node.js"        "https://nodejs.org"
check_tool  "npm"    "npm"            "ships with Node.js"
check_tool  "docker" "Docker"         "https://docs.docker.com/get-docker/"
check_tool  "git"    "Git"            "https://git-scm.com"

dmb_step "2" "3" "System Checks"
check_docker_running
check_port_free "5440"
check_port_free "3000"

dmb_step "3" "3" "Project Integrity"
if [ -f "app/package.json" ]; then
  dmb_ok "app/package.json found"
else
  dmb_error "app/package.json not found — run from the project root!"
  FAILED=1
fi

if [ -f "app/prisma/schema.prisma" ]; then
  dmb_ok "prisma/schema.prisma found"
else
  dmb_error "Prisma schema not found!"
  FAILED=1
fi

if [ -f "app/.env" ]; then
  dmb_ok ".env file found"
else
  dmb_warn ".env file missing — quantum features may be disabled"
fi

echo ""
if [ "$FAILED" -eq 1 ]; then
  dmb_error "Pre-flight checks failed. Fix the above issues and re-run."
  exit 1
else
  dmb_ok "${GREEN}${BOLD}All checks passed — ready to launch!${RESET}"
fi
