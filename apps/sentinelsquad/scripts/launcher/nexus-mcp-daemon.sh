#!/bin/bash
set -euo pipefail

SENTINELSQUAD_ROOT="${SENTINELSQUAD_ROOT:-/Users/moldovancsaba/Projects/sentinelsquad/apps/sentinelsquad}"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3 || true)}"

if [[ -z "$PYTHON_BIN" || ! -x "$PYTHON_BIN" ]]; then
  echo "python3 binary not found."
  exit 1
fi

cd "$SENTINELSQUAD_ROOT"
exec "$PYTHON_BIN" scripts/nexus/mcp_server_py.py
