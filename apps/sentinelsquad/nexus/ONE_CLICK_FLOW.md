# One-Click Flow (VSCodium + Roo + SentinelSquad + ChatDev)

## First time (one click)
Run:
- `~/Desktop/Nexus Install Daemon.command`

This installs persistent background services (launchd):
- Ollama (`com.mvpfactory.ollama`)
- SentinelSquad (`com.mvpfactory.sentinelsquad`)
- Nexus MCP bridge (`com.mvpfactory.nexus-mcp`)

## Daily use (one click)
Run:
- `~/Desktop/Open Nexus Workspace.command`

This opens:
- VSCodium on repo
- SentinelSquad chat (`/chat`)
- SentinelSquad nexus panel (`/nexus`)

## In Roo chat
Use plain text:
- `@Controller run cell: build a secure python cli tool with tests`

No JSON required.

## Dashboard purpose
Use SentinelSquad dashboard only for:
- settings
- health checks
- logs/audit

Primary interaction stays in Roo chat.

## Uninstall
Run:
- `~/Desktop/Nexus Uninstall Daemon.command`
