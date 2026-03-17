# Project Repositories

This document explains the difference between the central SentinelSquad management repository and the individual product repositories it manages.

## SentinelSquad Repository

This repository is the central repository for:

- project management
- GitHub issues
- GitHub Project board workflow
- shared prompts
- shared standards
- shared knowledge and wiki pages

## Product Repositories

Each product repository should contain:

- product source code
- product build/test configuration
- product-local implementation docs
- product-local assets and runtime details

## Decision Rule

Ask:

- Is this about delivery coordination, shared knowledge, prompts, or cross-project standards?
  - If yes, it belongs here.
- Is this about implementing product behavior or changing product code?
  - If yes, it belongs in the product repository.

## How Agents Should Find Product Repositories

Use:

- the `Product` field on the board card
- the relevant page under `docs/projects/`

Each product page should tell the agent:

- what the product is
- which repository owns the code
- what kind of work belongs there
- what kind of work still belongs here

## How Agents Should Access Product Repositories

Agents should:

1. open this repository first for issue and board context
2. identify the product repository from the product page
3. switch to the product repository for implementation
4. return here to update issue evidence and shared docs

## Product Pages

- [projects/amanoba.md](projects/amanoba.md)
- [projects/cardmass.md](projects/cardmass.md)
- [projects/hatori.md](projects/hatori.md)
- [projects/kormanyvalto.md](projects/kormanyvalto.md)
- [projects/launchmass.md](projects/launchmass.md)
- [projects/messmass.md](projects/messmass.md)
- [projects/narimato.md](projects/narimato.md)
- [projects/reply.md](projects/reply.md)
- [projects/sentinelsquad-product.md](projects/sentinelsquad-product.md)
- [projects/sso.md](projects/sso.md)

## Managed Local Repositories

Current managed repositories:

- `amanoba`: `/Users/moldovancsaba/Projects/amanoba`
- `cardmass`: `/Users/moldovancsaba/Projects/cardmass`
- `hatori`: `/Users/moldovancsaba/Projects/hatori`
- `kormanyvalto`: `/Users/moldovancsaba/Projects/kormanyvalto`
- `launchmass`: `/Users/moldovancsaba/Projects/launchmass`
- `messmass`: `/Users/moldovancsaba/Projects/messmass`
- `narimato`: `/Users/moldovancsaba/Projects/narimato`
- `reply`: `/Users/moldovancsaba/Projects/reply`
- `sentinelsquad`: `/Users/moldovancsaba/Projects/sentinelsquad`
- `sso`: `/Users/moldovancsaba/Projects/sso`

## Special Case: SentinelSquad

`sentinelsquad` is both:

- the central management and knowledge repository
- a product we also develop

When the issue is about SentinelSquad product implementation, agents may work in this repository directly.
When the issue is about shared management, board process, or cross-project standards, the work also stays here.

## Shared Rules Across Product Repositories

All product repos should follow the same shared standards documented here:

- [CODING_STANDARDS.md](CODING_STANDARDS.md)
- [UI_UX_STANDARDS.md](UI_UX_STANDARDS.md)
- [RULES.md](RULES.md)
