# Project Management

SentinelSquad is the central delivery-management repository.

## Source of Truth

The operational source of truth is:

- GitHub issues in this repository
- the GitHub Project board attached to this workflow

Board:

- [GitHub Project 1](https://github.com/users/moldovancsaba/projects/1)

## What Must Exist For Delivery Work

Every delivery item should have:

- an issue in this repository
- a matching board card
- a `Product` field
- a `Status` field
- enough acceptance detail for execution

## Field Model

- `Status`: delivery state
- `Agent`: current owner
- `Product`: target product/repository
- `Type`: kind of work
- `Priority`: urgency

## Status Flow

Recommended flow:

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Done`
- `Blocked` when needed

Rules:

- work should begin only from `Ready`
- `In Progress` means implementation or active investigation is happening
- `Review` means implementation exists and needs evaluation or acceptance
- `Done` means accepted and evidenced

## What Belongs In This Repository

- project delivery issues
- shared execution prompts
- board scripts
- global standards
- global knowledge

## What Does Not Belong In This Repository

- product-local feature code unless the product is intentionally housed here
- product-only release notes
- product-only architecture decisions that do not affect other products

## Agent Workflow

1. Read the issue.
2. Confirm board fields.
3. Identify the product repository.
4. Move into the product repository if the task is implementation.
5. Implement and validate there.
6. Return issue evidence here.
7. Update board status.

## Evidence Requirements

Issue comments should include:

- what changed
- where it changed
- validation commands
- result summary
- risks or follow-up if any

## Scripts

- `./scripts/sentinelsquad-set-project-fields.sh`
- `./scripts/sentinelsquad-ready-gate-audit.sh`
- `node ./scripts/sentinelsquad-validate-prompt-package.js`

## Relationship To Product Repositories

Detailed boundaries live in:

- [PROJECT_REPOSITORIES.md](PROJECT_REPOSITORIES.md)
