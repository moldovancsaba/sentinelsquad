#!/bin/bash
set -euo pipefail

LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLISTS=(
  "$LAUNCH_AGENTS_DIR/com.mvpfactory.ollama.plist"
  "$LAUNCH_AGENTS_DIR/com.mvpfactory.sentinelsquad.plist"
)
LABELS=(
  "com.mvpfactory.ollama"
  "com.mvpfactory.sentinelsquad"
)

for label in "${LABELS[@]}"; do
  launchctl bootout "gui/$UID/$label" >/dev/null 2>&1 || true
  launchctl disable "gui/$UID/$label" >/dev/null 2>&1 || true
  echo "Stopped: $label"
done

for plist in "${PLISTS[@]}"; do
  rm -f "$plist"
  echo "Removed: $plist"
done

# One-time cleanup in case the legacy MCP daemon plist exists.
launchctl bootout "gui/$UID/com.mvpfactory.nexus-mcp" >/dev/null 2>&1 || true
launchctl disable "gui/$UID/com.mvpfactory.nexus-mcp" >/dev/null 2>&1 || true
rm -f "$LAUNCH_AGENTS_DIR/com.mvpfactory.nexus-mcp.plist"

echo "Nexus LaunchAgents uninstalled."
