# Build And Run

This page documents how to build and run the SentinelSquad repository locally.

## Repository Structure

- app: `apps/sentinelsquad`
- scripts: `scripts/`
- docs/wiki: `docs/`

## Prerequisites

- Node.js and npm
- GitHub CLI for board scripts
- project access configured per [SETUP.md](SETUP.md)

## Build The Web App

```bash
cd /Users/moldovancsaba/Projects/sentinelsquad/apps/sentinelsquad
npm install
npm run build
```

## Run The Web App

```bash
cd /Users/moldovancsaba/Projects/sentinelsquad/apps/sentinelsquad
npm run dev
```

## Board Scripts

Examples:

```bash
cd /Users/moldovancsaba/Projects/sentinelsquad
./scripts/sentinelsquad-set-project-fields.sh ISSUE_NUMBER --agent Gwen
./scripts/sentinelsquad-ready-gate-audit.sh
node ./scripts/sentinelsquad-validate-prompt-package.js --issue ISSUE_NUMBER --repo moldovancsaba/sentinelsquad
```

## Documentation Rule

If build/run instructions change, update this file and [WIKI.md](WIKI.md).
