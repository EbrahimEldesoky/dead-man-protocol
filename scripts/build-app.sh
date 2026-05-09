#!/usr/bin/env bash
# scripts/build-app.sh — Installs deps and runs type check (dev mode only)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"

cd app

dmb_info "Installing Node dependencies..."
if [ -d "node_modules" ]; then
  dmb_ok "node_modules exists — skipping fresh install"
else
  npm install --silent 2>&1 | tail -n2
  dmb_ok "Dependencies installed"
fi

dmb_info "Quick TypeScript check..."
if npx tsc --noEmit 2>&1 | grep -qE "^app|error TS"; then
  dmb_warn "TypeScript warnings detected (non-blocking in dev)"
else
  dmb_ok "TypeScript checks passed"
fi
