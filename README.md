# SentinelSquad

SentinelSquad is the central repository for project delivery management across our product portfolio.

This repository is not the main application codebase for a single product. It is the shared control plane where:

- GitHub issues are created and maintained as delivery tasks
- the GitHub Project board is managed as the operational source of truth
- agent workflow rules are defined
- cross-project standards and shared knowledge are documented
- product repository access patterns are documented

Start here:

- Wiki: [docs/WIKI.md](docs/WIKI.md)
- Board workflow: [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
- Product-repo boundaries: [docs/PROJECT_REPOSITORIES.md](docs/PROJECT_REPOSITORIES.md)
- Coding standards: [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)
- UI/UX standards: [docs/UI_UX_STANDARDS.md](docs/UI_UX_STANDARDS.md)
- Agent/developer guide: [READMEDEV.md](READMEDEV.md)

## Purpose

SentinelSquad exists to separate delivery management from product implementation.

This repository owns:

- delivery issues and GitHub Project board discipline
- the rules agents must follow when moving work through the board
- shared prompts, runbooks, and navigation docs
- shared engineering standards across products
- cross-product knowledge in Markdown form

This repository does not own:

- the primary application code for Amanoba, CardMass, Hatori, KormanyValto, LaunchMass, MessMass, Narimato, Reply, SentinelSquad as a product, SSO, or other products
- product-specific assets, feature branches, or release histories
- product-local implementation docs that belong with product code

## Repository Boundaries

Use this repository when you need to:

- create or manage a delivery issue
- move a card through the GitHub Project board
- understand how agents should work across projects
- find shared coding rules and UI/UX rules
- look up where a product repository lives and how it should be accessed
- update global knowledge that applies across more than one product

Use a product repository when you need to:

- change product code
- run product-specific builds/tests
- update product-local implementation docs
- work on components, APIs, data models, layouts, or releases for that product

## GitHub Project Board

The GitHub Project board is the operational source of truth for delivery flow.

- Board: [GitHub Project 1](https://github.com/users/moldovancsaba/projects/1)
- Repo issues: [moldovancsaba/sentinelsquad/issues](https://github.com/moldovancsaba/sentinelsquad/issues)

Every delivery task should map to a GitHub issue in this repository and a card on the board.

Core fields:

- `Status`
- `Agent`
- `Product`
- `Type`
- `Priority`

Detailed rules: [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)

## Documentation Structure

The documentation is intentionally wiki-like. The entry point is [docs/WIKI.md](docs/WIKI.md).

Main sections:

- Build and runtime: [docs/BUILD_AND_RUN.md](docs/BUILD_AND_RUN.md)
- Delivery process: [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
- Product access and repo boundaries: [docs/PROJECT_REPOSITORIES.md](docs/PROJECT_REPOSITORIES.md)
- Shared engineering rules: [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)
- Shared UI/UX rules: [docs/UI_UX_STANDARDS.md](docs/UI_UX_STANDARDS.md)
- General knowledge base: [docs/GENERAL_KNOWLEDGE.md](docs/GENERAL_KNOWLEDGE.md)
- Agent prompt library: [docs/AGENT_PROMPTS.md](docs/AGENT_PROMPTS.md)

Product pages:

- [docs/projects/amanoba.md](docs/projects/amanoba.md)
- [docs/projects/cardmass.md](docs/projects/cardmass.md)
- [docs/projects/hatori.md](docs/projects/hatori.md)
- [docs/projects/kormanyvalto.md](docs/projects/kormanyvalto.md)
- [docs/projects/launchmass.md](docs/projects/launchmass.md)
- [docs/projects/messmass.md](docs/projects/messmass.md)
- [docs/projects/narimato.md](docs/projects/narimato.md)
- [docs/projects/reply.md](docs/projects/reply.md)
- [docs/projects/sentinelsquad-product.md](docs/projects/sentinelsquad-product.md)
- [docs/projects/sso.md](docs/projects/sso.md)

## Managed Projects

This repository currently manages delivery flow and shared knowledge for:

- `amanoba` at `/Users/moldovancsaba/Projects/amanoba`
- `cardmass` at `/Users/moldovancsaba/Projects/cardmass`
- `hatori` at `/Users/moldovancsaba/Projects/hatori`
- `kormanyvalto` at `/Users/moldovancsaba/Projects/kormanyvalto`
- `launchmass` at `/Users/moldovancsaba/Projects/launchmass`
- `messmass` at `/Users/moldovancsaba/Projects/messmass`
- `narimato` at `/Users/moldovancsaba/Projects/narimato`
- `reply` at `/Users/moldovancsaba/Projects/reply`
- `sentinelsquad` as both this central management repository and the SentinelSquad product repository
- `sso` at `/Users/moldovancsaba/Projects/sso`

## How Agents Should Work

Agents should:

- start from the board and issue context
- use this repository for rules, prompts, standards, and shared knowledge
- switch into the correct product repository before making product code changes
- keep issue status and evidence synchronized with real execution
- update shared docs here when the change affects multiple products or global process

Agents should not:

- treat this repository as the code home for every product
- store product-specific implementation detail here unless it is cross-project
- bypass the board when doing delivery work

Detailed operating rules live in:

- [docs/RULES.md](docs/RULES.md)
- [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
- [docs/PROJECT_REPOSITORIES.md](docs/PROJECT_REPOSITORIES.md)
- [READMEDEV.md](READMEDEV.md)

## Setup and Build

Setup:

- [docs/SETUP.md](docs/SETUP.md)

Build and local runtime:

- [docs/BUILD_AND_RUN.md](docs/BUILD_AND_RUN.md)

## Scripts

Board-management scripts:

- [scripts/sentinelsquad-set-project-fields.sh](scripts/sentinelsquad-set-project-fields.sh)
- [scripts/sentinelsquad-ready-gate-audit.sh](scripts/sentinelsquad-ready-gate-audit.sh)
- [scripts/sentinelsquad-validate-prompt-package.js](scripts/sentinelsquad-validate-prompt-package.js)

Operational scripts:

- [scripts/sentinelsquad-docker-preflight.sh](scripts/sentinelsquad-docker-preflight.sh)
- [scripts/sentinelsquad-docker-bootstrap.sh](scripts/sentinelsquad-docker-bootstrap.sh)
- [scripts/sentinelsquad-docker-portability-gate.sh](scripts/sentinelsquad-docker-portability-gate.sh)

## For Developers and Agents

Read [READMEDEV.md](READMEDEV.md) before changing process docs, standards, board workflow, or shared prompts.
