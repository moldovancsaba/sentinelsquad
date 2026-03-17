#!/bin/bash
set -euo pipefail

SENTINELSQUAD_ROOT="/Users/moldovancsaba/Projects/sentinelsquad/apps/sentinelsquad"
REPO_ROOT="/Users/moldovancsaba/Projects/sentinelsquad"
CODIUM_BIN="${CODIUM_BIN:-$(command -v codium || true)}"
OPEN_BIN="/usr/bin/open"
CURL_BIN="/usr/bin/curl"

if ! "$CURL_BIN" -fsS "http://127.0.0.1:3007/signin" >/dev/null 2>&1; then
  if [[ -x "$SENTINELSQUAD_ROOT/scripts/launcher/nexus-daemon-install.sh" ]]; then
    echo "SentinelSquad is not reachable; restarting background services..."
    bash "$SENTINELSQUAD_ROOT/scripts/launcher/nexus-daemon-install.sh" >/dev/null
  fi
fi

if [[ -x "$SENTINELSQUAD_ROOT/scripts/launcher/nexus-daemon-status.sh" ]]; then
  bash "$SENTINELSQUAD_ROOT/scripts/launcher/nexus-daemon-status.sh" || true
fi

if [[ -n "$CODIUM_BIN" && -x "$CODIUM_BIN" ]]; then
  "$CODIUM_BIN" "$REPO_ROOT" >/dev/null 2>&1 || true
else
  "$OPEN_BIN" -a "VSCodium" "$REPO_ROOT" >/dev/null 2>&1 || true
fi

"$OPEN_BIN" "http://127.0.0.1:3007/chat" >/dev/null 2>&1 || true
"$OPEN_BIN" "http://127.0.0.1:3007/nexus" >/dev/null 2>&1 || true

echo "Workspace opened. In Roo chat use:"
echo "@Controller run cell: <your task>"
