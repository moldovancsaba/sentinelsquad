#!/bin/bash
set -euo pipefail

SENTINELSQUAD_ROOT="${SENTINELSQUAD_ROOT:-/Users/moldovancsaba/Projects/sentinelsquad/apps/sentinelsquad}"
NPM_BIN="${NPM_BIN:-$(command -v npm || true)}"
LSOF_BIN="/usr/sbin/lsof"

if [[ -z "$NPM_BIN" || ! -x "$NPM_BIN" ]]; then
  echo "npm binary not found."
  exit 1
fi

cd "$SENTINELSQUAD_ROOT"
if [[ -f .env ]]; then
  set -a
  # shellcheck source=/dev/null
  source ./.env
  set +a
fi

export SENTINELSQUAD_LAUNCH_MODE="${SENTINELSQUAD_LAUNCH_MODE:-dev}"
SENTINELSQUAD_APP_PORT="${SENTINELSQUAD_APP_PORT:-3007}"

# Ensure daemon-owned process can bind cleanly.
if [[ -x "$LSOF_BIN" ]]; then
  pids="$($LSOF_BIN -t -iTCP:"$SENTINELSQUAD_APP_PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      kill "$pid" >/dev/null 2>&1 || true
    done <<< "$pids"
    sleep 1
  fi
fi

if [[ "$SENTINELSQUAD_LAUNCH_MODE" == "prod" ]]; then
  "$NPM_BIN" run build >/dev/null 2>&1 || true
  exec "$NPM_BIN" run start
fi
exec "$NPM_BIN" run dev
