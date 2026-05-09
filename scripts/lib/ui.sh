#!/usr/bin/env bash
# scripts/lib/ui.sh — Shared terminal UI utilities for DMB scripts

# Colors & Styles
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

RED='\033[38;5;196m'
GREEN='\033[38;5;82m'
YELLOW='\033[38;5;220m'
CYAN='\033[38;5;51m'
ORANGE='\033[38;5;208m'
WHITE='\033[38;5;255m'
GRAY='\033[38;5;244m'

BG_DARK='\033[48;5;234m'

# ─────────────────────────────────────────────
dmb_banner() {
  echo -e ""
  echo -e "${ORANGE}${BOLD}"
  echo -e "  ██████╗ ███╗   ███╗██████╗     ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗"
  echo -e "  ██╔══██╗████╗ ████║██╔══██╗    ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝"
  echo -e "  ██║  ██║██╔████╔██║██████╔╝    ██║   ██║███████║██║   ██║██║     ██║   "
  echo -e "  ██║  ██║██║╚██╔╝██║██╔══██╗    ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   "
  echo -e "  ██████╔╝██║ ╚═╝ ██║██████╔╝     ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   "
  echo -e "  ╚═════╝ ╚═╝     ╚═╝╚═════╝       ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   "
  echo -e "${RESET}"
  echo -e "  ${GRAY}Trustless Digital Inheritance Protocol on Solana${RESET}"
  echo -e "  ${GRAY}────────────────────────────────────────────────${RESET}"
  echo ""
}

dmb_step() {
  local num="$1" total="$2" text="$3"
  echo -e ""
  echo -e "  ${ORANGE}${BOLD}[${num}/${total}]${RESET} ${WHITE}${BOLD}${text}${RESET}"
  echo -e "  ${GRAY}$(printf '─%.0s' {1..52})${RESET}"
}

dmb_ok() {
  echo -e "  ${GREEN}✔${RESET}  $1"
}

dmb_info() {
  echo -e "  ${CYAN}→${RESET}  ${GRAY}$1${RESET}"
}

dmb_warn() {
  echo -e "  ${YELLOW}⚠${RESET}  $1"
}

dmb_error() {
  echo -e "  ${RED}✘${RESET}  ${RED}${BOLD}$1${RESET}"
}

dmb_check() {
  local cmd="$1" label="$2"
  if command -v "$cmd" &>/dev/null; then
    local ver
    ver=$("$cmd" --version 2>&1 | head -n1 | sed 's/^[^0-9]*//')
    dmb_ok "${label} ${GRAY}v${ver}${RESET}"
    return 0
  else
    dmb_error "${label} not found — please install it first."
    return 1
  fi
}

dmb_run() {
  local label="$1"; shift
  dmb_info "$label"
  if "$@" &>/dev/null; then
    dmb_ok "Done"
  else
    dmb_error "Failed: $label"
    exit 1
  fi
}

dmb_divider() {
  echo -e ""
  echo -e "  ${GRAY}════════════════════════════════════════════════════${RESET}"
  echo -e ""
}

dmb_online_banner() {
  echo ""
  echo -e "  ${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
  echo -e "  ${GREEN}${BOLD}║     ✳  DeadMan Protocol is Fully Online!      ║${RESET}"
  echo -e "  ${GREEN}${BOLD}╠══════════════════════════════════════════════════╣${RESET}"
  echo -e "  ${GREEN}${BOLD}║${RESET}  ${WHITE}UI:${RESET}          ${CYAN}http://localhost:3000${RESET}              ${GREEN}${BOLD}║${RESET}"
  echo -e "  ${GREEN}${BOLD}║${RESET}  ${WHITE}Quantum DB:${RESET}  ${GREEN}Running on port 5440${RESET}              ${GREEN}${BOLD}║${RESET}"
  echo -e "  ${GREEN}${BOLD}║${RESET}  ${WHITE}Network:${RESET}     ${ORANGE}Solana Devnet${RESET}                      ${GREEN}${BOLD}║${RESET}"
  echo -e "  ${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
  echo ""
}
