# READMEDEV

This file is the developer and agent operating guide for SentinelSquad.

Read this together with:

- [docs/WIKI.md](docs/WIKI.md)
- [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
- [docs/PROJECT_REPOSITORIES.md](docs/PROJECT_REPOSITORIES.md)
- [docs/AGENT_PROMPTS.md](docs/AGENT_PROMPTS.md)

## What This Repository Is

This repository is the shared project-management and knowledge repository for the full portfolio.

It owns:

- delivery issues
- project-board operating rules
- global prompts and standards
- global documentation and shared knowledge

Managed projects:

- `amanoba`
- `cardmass`
- `hatori`
- `kormanyvalto`
- `launchmass`
- `messmass`
- `narimato`
- `reply`
- `sentinelsquad`
- `sso`

It does not replace product repositories.

If the task is product implementation, the usual path is:

1. read the issue and board state here
2. identify the target product repository
3. switch to that product repository
4. implement there
5. return evidence and update board state here

## Required Reading Order

When starting work:

1. [docs/WIKI.md](docs/WIKI.md)
2. [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)
3. [docs/PROJECT_REPOSITORIES.md](docs/PROJECT_REPOSITORIES.md)
4. the relevant product page under `docs/projects/`
5. [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)
6. [docs/UI_UX_STANDARDS.md](docs/UI_UX_STANDARDS.md)

## Agent Prompts

The prompt library lives in [docs/AGENT_PROMPTS.md](docs/AGENT_PROMPTS.md).

It includes:

- default prompt for operating in this repository
- prompt for product-repo implementation work
- prompt for board-management work
- prompt for documentation maintenance

## Board Discipline

Every delivery task should be represented by:

- an issue in this repository
- a GitHub Project card on the board

Before implementation:

- confirm the issue exists
- confirm the product field is correct
- confirm the status is correct
- confirm acceptance criteria are clear

During implementation:

- keep the board current
- add evidence to the issue
- update status when the state changes

Detailed rules: [docs/PROJECT_MANAGEMENT.md](docs/PROJECT_MANAGEMENT.md)

## Product Repositories

This repository should document product repositories, not absorb them.

Use [docs/PROJECT_REPOSITORIES.md](docs/PROJECT_REPOSITORIES.md) to determine:

- which repo to open
- what belongs there
- what belongs here
- how agents should move between the central repo and a product repo

Use the product pages under `docs/projects/` for repository-specific navigation.

## Standards

Engineering standards:

- [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)

UI/UX standards:

- [docs/UI_UX_STANDARDS.md](docs/UI_UX_STANDARDS.md)

Core non-negotiables:

- no hardcoded product data when configuration or data modeling is appropriate
- no baked-in styling that prevents reuse or theming
- no undocumented workflow changes
- no board-bypass delivery work
- no cross-repo ambiguity about where code belongs

## Documentation Rules

When you update shared process, standards, prompts, or product navigation:

- update the relevant Markdown docs in this repository
- keep [docs/WIKI.md](docs/WIKI.md) current
- keep README and READMEDEV aligned with the wiki

When you update product-specific implementation:

- update docs in the product repository first
- only add or update content here if it affects cross-project behavior or shared standards

## Build and Runtime

Build and run instructions are maintained in:

- [docs/BUILD_AND_RUN.md](docs/BUILD_AND_RUN.md)

## Suggested Operating Loop for Agents

1. Read the issue.
2. Check the board card.
3. Read the relevant product page.
4. Decide whether work belongs here or in a product repo.
5. Implement in the correct repository.
6. Validate.
7. Add evidence to the issue.
8. Update board status.
9. Update shared docs here if global behavior changed.
