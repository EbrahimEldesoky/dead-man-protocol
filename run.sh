#!/usr/bin/env bash
# ============================================================
#   DeadMan Protocol — Master Orchestrator
#   Usage: ./run.sh [--skip-build] [--skip-checks]
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS="$SCRIPT_DIR/scripts"

# Load UI helpers
source "$SCRIPTS/lib/ui.sh"

# Parse flags
SKIP_BUILD=false
SKIP_CHECKS=false
for arg in "$@"; do
  case $arg in
    --skip-build)   SKIP_BUILD=true ;;
    --skip-checks)  SKIP_CHECKS=true ;;
  esac
done

# ── Shutdown hook ──────────────────────────────────────────
cleanup() {
  echo ""
  dmb_info "Shutting down services..."
  docker rm -f quantum_postgres 2>/dev/null || true
  dmb_ok "Shutdown complete."
}
trap cleanup EXIT INT TERM

# ══════════════════════════════════════════════════════════
#   BANNER
# ══════════════════════════════════════════════════════════
clear
dmb_banner

echo -e "  ${WHITE}Launching the full DeadMan Protocol stack...${RESET}"
echo -e "  ${GRAY}Flags: skip-build=${SKIP_BUILD}  skip-checks=${SKIP_CHECKS}${RESET}"
echo ""

# ══════════════════════════════════════════════════════════
#   PHASE 1 — Pre-flight Checks
# ══════════════════════════════════════════════════════════
if [ "$SKIP_CHECKS" = false ]; then
  dmb_step "1" "4" "Pre-Flight Checks"
  bash "$SCRIPTS/check-deps.sh"
  dmb_ok "${GREEN}${BOLD}Pre-flight complete ✔${RESET}"
else
  dmb_warn "Skipping pre-flight checks (--skip-checks)"
fi

dmb_divider

# ══════════════════════════════════════════════════════════
#   PHASE 2 — Database
# ══════════════════════════════════════════════════════════
dmb_step "2" "4" "Quantum Database Initialization"
bash "$SCRIPTS/setup-db.sh"
dmb_ok "${GREEN}${BOLD}Database ready ✔${RESET}"

dmb_divider

# ══════════════════════════════════════════════════════════
#   PHASE 3 — Build Validation
# ══════════════════════════════════════════════════════════
if [ "$SKIP_BUILD" = false ]; then
  dmb_step "3" "4" "Build & Validation"
  bash "$SCRIPTS/build-app.sh"
  dmb_ok "${GREEN}${BOLD}Build validated ✔${RESET}"
else
  dmb_warn "Skipping build validation (--skip-build)"
fi

dmb_divider

# ══════════════════════════════════════════════════════════
#   PHASE 4 — Launch Frontend
# ══════════════════════════════════════════════════════════
dmb_step "4" "4" "Launching Next.js DApp"
dmb_info "Connecting to Solana Devnet..."
dmb_info "Binding IBM Quantum API..."

dmb_online_banner

# Start the dev server
cd "$SCRIPT_DIR/app"
exec npm run dev
