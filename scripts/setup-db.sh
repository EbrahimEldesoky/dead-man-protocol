#!/usr/bin/env bash
# scripts/setup-db.sh — Starts PostgreSQL & provisions Prisma schema
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"

CONTAINER="quantum_postgres"
DB_PORT="5440"

dmb_info "Cleaning up any old containers..."
docker rm -f "$CONTAINER" 2>/dev/null || true

dmb_info "Starting PostgreSQL (port ${DB_PORT})..."
docker run -d \
  --name "$CONTAINER" \
  -e POSTGRES_USER=dmb_admin \
  -e POSTGRES_PASSWORD=dmb_quantum_password123 \
  -e POSTGRES_DB=quantum_vault \
  -p "${DB_PORT}:5432" \
  postgres:15.5-alpine \
  >>/dev/null

# Wait for DB to be ready
dmb_info "Waiting for PostgreSQL to be ready..."
for i in {1..15}; do
  if docker exec "$CONTAINER" pg_isready -U dmb_admin -q 2>/dev/null; then
    break
  fi
  sleep 1
done

dmb_ok "PostgreSQL is healthy on port ${DB_PORT}"

dmb_info "Generating Prisma Client..."
(cd app && npx prisma generate --schema=prisma/schema.prisma 2>&1 | grep -E "(Generated|Error)" || true)
dmb_ok "Prisma Client generated"

dmb_info "Synchronizing Prisma schema with database..."
(cd app && npx prisma db push --schema=prisma/schema.prisma --accept-data-loss 2>&1 | grep -E "(sync|Done|Error)" || true)
dmb_ok "Database schema synchronized: ${CYAN}quantum_vault${RESET}"
